// OWNER: Workstream A. Stable export: classifyQuestion(text) -> QuestionClassification. Must NEVER throw.
// This is a minimal placeholder so every other stream can run. A replaces it with LLM + real fallback.
import type { Domain, Experience, QuestionClassification } from "@/types";

export async function classifyQuestion(text: string): Promise<QuestionClassification> {
  const t = text.toLowerCase();
  let domain: Domain = "Career";
  if (/code|software|interview|programming|app|tech/.test(t)) domain = "Technology";
  else if (/anxi|stress|manager|boss|scared|depress/.test(t)) domain = "Psychology";
  else if (/startup|business|founder/.test(t)) domain = "Business";
  const requiredExperiences: Experience[] = domain === "Technology" ? ["Interviews", "Software Development"] : ["Job Search"];
  return {
    domain,
    context: "General",
    intent: "Advice",
    targetUserTypes: ["Student", "Working Professional"],
    requiredExperiences,
    tags: [],
    confidence: 0.5,
    source: "fallback",
  };
}
