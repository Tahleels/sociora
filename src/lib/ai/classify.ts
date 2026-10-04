// Experience Router classifier. Stable export: classifyQuestion(text) -> QuestionClassification. Never throws.
// Env (all optional, put in .env.local): GEMINI_API_KEY (preferred) or OPENROUTER_API_KEY.
// Optional overrides: GEMINI_MODEL (default gemini-2.0-flash), OPENROUTER_MODEL (default google/gemini-2.0-flash-001).
import {
  CONTEXTS, DOMAINS, EXPERIENCES, INTENTS, USER_TYPES,
  type Experience, type Intent, type QuestionClassification, type UserType,
} from "@/types";
import { fallbackClassify } from "./fallback";

const TIMEOUT_MS = 8000;

const PROMPT = (q: string) => `You are the Experience Router for an anonymous Q&A platform. Classify the user's question so it can be routed to people with the most relevant lived experience (not just people who like the topic).

Return ONLY JSON with exactly these keys:
{
  "domain": one of ${JSON.stringify(DOMAINS)},
  "secondaryDomain": optional, one of the same list,
  "context": one of ${JSON.stringify(CONTEXTS)},
  "intent": one of ${JSON.stringify(INTENTS)},
  "targetUserTypes": 1-3 of ${JSON.stringify(USER_TYPES)} (who is best placed to answer),
  "requiredExperiences": 1-4 of ${JSON.stringify(EXPERIENCES)} (experience an answerer should have),
  "tags": 2-5 short lowercase phrases,
  "confidence": number 0..1
}

Question: """${q.slice(0, 1500)}"""`;

function oneOf<T extends string>(list: readonly T[], v: unknown): T | undefined {
  return typeof v === "string" ? list.find((x) => x.toLowerCase() === v.trim().toLowerCase()) : undefined;
}
function manyOf<T extends string>(list: readonly T[], v: unknown, max: number): T[] {
  if (!Array.isArray(v)) return [];
  return [...new Set(v.map((x) => oneOf(list, x)).filter((x): x is T => !!x))].slice(0, max);
}

function sanitize(raw: any, text: string): QuestionClassification | null {
  if (!raw || typeof raw !== "object") return null;
  const fb = fallbackClassify(text); // fills any gaps
  const domain = oneOf(DOMAINS, raw.domain);
  if (!domain) return null;
  const secondary = oneOf(DOMAINS, raw.secondaryDomain);
  const targetUserTypes: UserType[] = manyOf(USER_TYPES, raw.targetUserTypes, 3);
  const requiredExperiences: Experience[] = manyOf(EXPERIENCES, raw.requiredExperiences, 4);
  const tags: string[] = Array.isArray(raw.tags)
    ? [...new Set<string>(raw.tags.filter((t: unknown) => typeof t === "string" && t.trim()).map((t: string) => t.trim().toLowerCase()))].slice(0, 5)
    : [];
  const conf = Number(raw.confidence);
  return {
    domain,
    ...(secondary && secondary !== domain ? { secondaryDomain: secondary } : {}),
    context: oneOf(CONTEXTS, raw.context) ?? fb.context,
    intent: (oneOf(INTENTS, raw.intent) ?? fb.intent) as Intent,
    targetUserTypes: targetUserTypes.length ? targetUserTypes : fb.targetUserTypes,
    requiredExperiences: requiredExperiences.length ? requiredExperiences : fb.requiredExperiences,
    tags: tags.length ? tags : fb.tags,
    confidence: Number.isFinite(conf) ? Math.max(0, Math.min(1, +conf.toFixed(2))) : 0.8,
    source: "llm",
  };
}

function parseJson(s: string): unknown {
  const cleaned = s.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  try { return JSON.parse(cleaned); } catch {
    const m = cleaned.match(/\{[\s\S]*\}/);
    return m ? JSON.parse(m[0]) : null;
  }
}

async function callGemini(key: string, text: string): Promise<string> {
  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: PROMPT(text) }] }],
      generationConfig: { responseMimeType: "application/json", temperature: 0.2 },
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`gemini ${res.status}`);
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

async function callOpenRouter(key: string, text: string): Promise<string> {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL || "google/gemini-2.0-flash-001",
      messages: [{ role: "user", content: PROMPT(text) }],
      response_format: { type: "json_object" },
      temperature: 0.2,
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`openrouter ${res.status}`);
  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? "";
}

export async function classifyQuestion(text: string): Promise<QuestionClassification> {
  try {
    const gemini = process.env.GEMINI_API_KEY;
    const openrouter = process.env.OPENROUTER_API_KEY;
    if (gemini || openrouter) {
      const out = gemini ? await callGemini(gemini, text) : await callOpenRouter(openrouter!, text);
      const result = sanitize(parseJson(out), text);
      if (result) return result;
    }
  } catch (e) {
    console.warn("[classify] LLM failed, using fallback:", (e as Error).message);
  }
  return fallbackClassify(text);
}
