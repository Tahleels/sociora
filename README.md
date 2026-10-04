<p align="center">
  <img src="docs/assets/banner.svg" alt="Sociora — ask anonymously, get answers from people who've lived it" width="100%"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs" alt="Next.js 15"/>
  <img src="https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Tailwind-3-06b6d4?logo=tailwindcss&logoColor=white" alt="Tailwind"/>
  <img src="https://img.shields.io/badge/AI-Gemini%20%7C%20OpenRouter-c2410c" alt="AI"/>
  <img src="https://img.shields.io/badge/works%20offline-fallback%20classifier-2ea44f" alt="Works without keys"/>
</p>

## The problem

When you're scared about your career, being bullied by a manager, or lost in a decision, the best answer comes from someone who **has been exactly there**. Today:

- **Reddit / Quora** route your question to a *topic*. You get whoever happens to be scrolling.
- **ChatGPT** gives fluent, generic advice with zero lived experience.
- **Asking under your real name** means you don't ask the honest question at all.

## The idea

> **Reddit routes your question to a topic. Sociora routes it to people who've lived it.**

You ask anonymously. An **AI Experience Router** works out the *domain, context, intent and required experience* behind your question, then finds the people whose lived experience fits. Everyone, asker and answerer, stays anonymous (`Anonymous Scholar #4821`).

<p align="center">
  <img src="docs/assets/routing-flow.svg" alt="Question → AI router → weighted matching → anonymous discussion" width="100%"/>
</p>

### Example

| | |
|---|---|
| **Question** | *"I'm a final-year engineering student and I'm scared I won't get a job after graduation."* |
| **Domain** | Career (secondary: Psychology) |
| **Context / Intent** | College · Advice |
| **Best perspectives** | Students · Working Professionals |
| **Required experience** | Job Search · College Life · Mental Wellbeing |
| **Not** | dumped into a generic Psychology feed |

<!-- Screenshots: replace once the UI is merged
<p align="center"><img src="docs/assets/screens/ask.png" width="48%"/> <img src="docs/assets/screens/feed.png" width="48%"/></p>
-->

## Features

- **Anonymous onboarding** — 4 questions, only what improves routing
- **Anonymous identity** — `Anonymous Builder #7318`; real info is never shown
- **AI question classification** — LLM (Gemini/OpenRouter) with a deterministic fallback
- **Experience routing + relevant-people matching** — transparent weighted score
- **Community feed** — filter by domain, badges and experience tags
- **Anonymous questions & answers**
- **Context-aware search** — understands "how do I prepare for a software interview?" as *Technology · Job Search · Advice*

## High-level design (HLD)

```mermaid
flowchart LR
    U([User browser]) -->|onboarding / ask / feed / search| FE[Next.js App Router<br/>React + Tailwind]
    FE -->|fetch| API[Next.js API routes]
    API --> CL[Classifier<br/>src/lib/ai]
    CL -->|API key present| LLM[(Gemini / OpenRouter)]
    CL -->|no key / timeout / error| FB[Keyword fallback]
    API --> MT[Matcher<br/>src/lib/matching.ts]
    API --> ST[Store<br/>src/lib/store.ts]
    MT --> ST
    ST -->|default| MEM[(In-memory seed data)]
    ST -.->|optional| SB[(Supabase Postgres)]
    FE <-->|localStorage| SESS[Anonymous session]
```

**Design principles:** no env var can crash the app, so every external dependency (LLM, DB) has a local fallback. No vector DB, no microservices, no ML recommender. Simple and explainable beats clever in a hackathon.

## Low-level design (LLD)

### 1. The ask → route → post flow

```mermaid
sequenceDiagram
    actor User
    participant UI as /ask page
    participant C as POST /api/classify
    participant M as POST /api/match
    participant P as POST /api/posts
    participant S as Store

    User->>UI: types question
    par staged animation
        UI->>UI: Detecting topic → context → experience
    and real work
        UI->>C: {question}
        C-->>UI: QuestionClassification (llm | fallback)
    end
    UI->>M: {classification}
    M->>S: listProfiles()
    M-->>UI: ExperienceMatch[] (sorted)
    UI-->>User: routing card + best people
    User->>UI: Post Anonymously
    UI->>P: {content, anonymousId, classification}
    P->>S: createPost()
    P-->>UI: Post → redirect /post/:id
```

### 2. Data model

```mermaid
erDiagram
    PROFILE ||--o{ POST : "asks (anonymousId)"
    PROFILE ||--o{ ANSWER : "writes (anonymousId)"
    POST ||--o{ ANSWER : has
    PROFILE {
        string id
        string anonymousId "public identity"
        string userType
        string[] domains
        string[] experiences
        string[] helpTopics
    }
    POST {
        string id
        string anonymousId
        string content
        string domain
        string context
        string intent
        string[] targetUserTypes
        string[] requiredExperiences
        string[] tags
    }
    ANSWER {
        string id
        string postId
        string anonymousId
        string content
    }
```

The structured profile is used **privately for routing**. Only `anonymousId` is ever returned to other users.

### 3. Experience Router output

```json
{
  "domain": "Career",
  "secondaryDomain": "Psychology",
  "context": "College",
  "intent": "Advice",
  "targetUserTypes": ["Student", "Working Professional"],
  "requiredExperiences": ["Job Search", "College Life", "Mental Wellbeing"],
  "tags": ["career anxiety", "placements"],
  "confidence": 0.82,
  "source": "llm"
}
```

LLM output is **validated against closed enums** (unknown values dropped, confidence clamped, gaps filled from the fallback), so a bad model response can't break the UI.

### 4. Matching algorithm

```
score = 0.40 · domain      (primary = 1.0, secondary = 0.5)
      + 0.30 · experience  (shared required experiences / required)
      + 0.20 · context     (context → typical experiences & domains)
      + 0.10 · userType    (profile type ∈ targetUserTypes)
```

Deterministic, explainable, instant. A match can show *why* it was chosen (the shared experiences).

### 5. API contract

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/classify` | question → `QuestionClassification` |
| POST | `/api/match` | classification → ranked `ExperienceMatch[]` |
| POST / GET | `/api/profile` | create / fetch anonymous profile |
| GET / POST | `/api/posts` | feed (`?domain=`) / create post |
| GET | `/api/posts/:id` | post + answers |
| POST | `/api/posts/:id/answers` | add anonymous answer |
| GET | `/api/search?q=` | context-aware search → classification + posts + people |

Types live in [`src/types/index.ts`](src/types/index.ts).

### 6. Project structure

```
src/
├─ types/index.ts          shared data contract
├─ lib/
│  ├─ ai/classify.ts       LLM classifier (Gemini / OpenRouter)
│  ├─ ai/fallback.ts       deterministic keyword classifier
│  ├─ matching.ts          weighted scoring
│  ├─ store.ts             data layer (in-memory seed, swappable)
│  ├─ identity.ts          anonymous ID generator
│  └─ session.ts           localStorage session
├─ app/
│  ├─ api/*                classify · match · profile · posts · search
│  └─ (pages)              / · onboarding · ask · feed · post/[id] · search
supabase/schema.sql        optional Postgres schema
scripts/smoke.mjs          router smoke test
```

## Run it

```bash
npm install
cp .env.example .env.local     # every key is optional
npm run dev                    # http://localhost:3000
```

| Env var | Effect |
|---|---|
| `GEMINI_API_KEY` | LLM classification via Gemini (preferred) |
| `OPENROUTER_API_KEY` | LLM classification via OpenRouter |
| `NEXT_PUBLIC_SUPABASE_URL` / `_ANON_KEY` | Optional Postgres (schema in `supabase/schema.sql`) |

No keys? It still works: keyword classifier plus seeded in-memory data.

```bash
node scripts/smoke.mjs         # classify + match + search sanity check
```

## Roadmap

- Learn from "this answer helped" signals to improve matching
- Embeddings-based semantic retrieval for search
- Moderation and abuse reporting; reputation tied to anonymous IDs
- Verified-experience badges (e.g. "verified: placed at a product company")
- Campus and employer community spaces

## Team

Built in a hackathon sprint by a team of three, split across **AI router**, **community & data** and **onboarding & routing UI**. See [`docs/`](docs/) for the workstream briefs and the [demo script](docs/DEMO_SCRIPT.md).
