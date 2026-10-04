# Sociora

Anonymous Q&A where AI routes your question to people with the most relevant *lived experience* — not just people who like the topic.

```
Question → AI Experience Router → domain + context + intent + required experience → matching people → anonymous discussion
```

## Run

```bash
npm install
cp .env.example .env.local   # all keys optional
npm run dev                  # http://localhost:3000
```

Works with **no keys and no database**: a deterministic keyword classifier and in-memory seeded data are used as fallbacks.

| Env var | Effect |
|---|---|
| `GEMINI_API_KEY` | LLM classification via Gemini (preferred) |
| `OPENROUTER_API_KEY` | LLM classification via OpenRouter |
| `NEXT_PUBLIC_SUPABASE_URL` / `_ANON_KEY` | Optional Postgres (schema in `supabase/schema.sql`) |

## Architecture

- `src/types/index.ts` — shared data + API contracts
- `src/lib/ai/` — LLM classifier + keyword fallback (Workstream A)
- `src/lib/matching.ts` — weighted scoring: domain 40 / experience 30 / context 20 / user type 10
- `src/lib/store.ts` — data layer (in-memory seed, swappable)
- `src/app/api/*` — classify, match, profile, posts, answers, search
- Pages: `/` landing, `/onboarding`, `/ask` (AI routing screen), `/feed`, `/post/[id]`, `/search`

## Smoke test the router

```bash
npm run dev            # in one terminal
node scripts/smoke.mjs # in another (BASE_URL=http://localhost:3000 by default)
```
