# WORKSTREAM A — AI Experience Router + Matching (branch: `feat/ai-router`)

You are one of 3 parallel engineers on a 30-minute hackathon MVP ("Sociora": anonymous Q&A where AI routes questions to people with relevant experience). Next.js 15 + TypeScript + Tailwind. Speed > polish. Do not overengineer.

## Read first (1 minute)
- `src/types/index.ts` — shared contract. DO NOT change existing shapes.
- `src/lib/ai/classify.ts`, `src/lib/matching.ts` — placeholders you replace.
- `src/app/api/classify/route.ts`, `src/app/api/match/route.ts` — thin routes you own.

## You OWN (only touch these)
- `src/lib/ai/**`
- `src/lib/matching.ts`
- `src/app/api/classify/**`, `src/app/api/match/**`
Do NOT edit anything else (store, pages, layout, other API routes, types). If you need a change elsewhere, tell the lead.

## Stable exports other streams depend on (keep signatures EXACT)
- `classifyQuestion(text: string): Promise<QuestionClassification>` — must NEVER throw, never hang (timeout ~8s then fall back).
- `matchProfiles(c, profiles, excludeId?): ExperienceMatch[]` sorted desc by score (0..1).

## Tasks
1. **LLM classifier** in `src/lib/ai/classify.ts`: if `GEMINI_API_KEY` set, call Gemini REST (`gemini-2.0-flash`, `generateContent`, `responseMimeType: "application/json"`) via plain `fetch`; else if `OPENROUTER_API_KEY`, call OpenRouter chat completions. Prompt must constrain output to the enums in `src/types` (DOMAINS, EXPERIENCES, INTENTS, USER_TYPES, CONTEXTS) and return JSON matching `QuestionClassification`. Validate/sanitize the result: drop unknown enum values, clamp confidence to 0..1, ensure arrays non-empty, set `source: "llm"`. Any failure → fallback.
2. **Deterministic fallback** (`src/lib/ai/fallback.ts`): keyword/regex rules mapping text → domain (+secondaryDomain), context (College/Workplace/Job Search/Startup...), intent, targetUserTypes, requiredExperiences, tags, confidence (0.55–0.8). Must correctly handle these two examples:
   - "final-year engineering student scared I won't get a job" → Career (secondary Psychology), context College, Advice, targets Student + Working Professional, experiences Job Search / College Life / Mental Wellbeing, tags like "career anxiety","placements".
   - "manager constantly criticizes me in front of everyone" → Psychology (secondary Career), context Workplace, targets Working Professional, experiences Managing People / Leadership, tags "workplace conflict".
   Also handle "How do I prepare for a software interview?" → Technology, Job Search, Interviews + Software Development. `source: "fallback"`.
3. **Matching** in `src/lib/matching.ts`: weighted score — domain 40% (primary=full, secondary=partial; profile.domains includes it), experience 30% (overlap ratio of requiredExperiences), context 20% (map context → experiences/domains, e.g. College→"College Life", Workplace→"Managing People"/"Leadership"/Career, Job Search→"Job Search"/"Interviews", Startup→"Starting a Business"; profile gets credit if related), user type 10% (profile.userType in targetUserTypes). Return `matchedExperiences`. Round to 3 decimals.
4. Verify with curl: `POST /api/classify` for the 3 examples above, with and without API keys; `POST /api/match` returns sensible top people from seeded profiles (see `src/lib/store.ts`).
5. Add `GEMINI_API_KEY` usage notes to a comment at the top of classify.ts (`.env.example` already lists keys; don't edit it).

## Done when
Both endpoints work with no keys set (fallback) and with a key (LLM), `npm run build` passes, then commit on your branch and push. Commit often; small commits. Do not merge to main yourself.
