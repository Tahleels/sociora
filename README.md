# Sociora

Sociora is an anonymous question-and-answer demo built around one idea: a useful answer often comes from someone who has lived through the same thing. A person asks a question, the app classifies its topic and context, and a matching step surfaces profiles with related experience.

This repository is a hackathon MVP built with Next.js App Router, React, TypeScript, and Tailwind CSS. It includes the landing page, anonymous onboarding, an ask-and-routing screen, and API routes backed by seeded in-memory data.

## Contents

- [Run locally](#run-locally)
- [Environment](#environment)
- [How the app works](#how-the-app-works)
- [Routes and current status](#routes-and-current-status)
- [API reference](#api-reference)
- [Data model](#data-model)
- [Project structure](#project-structure)
- [Scripts](#scripts)
- [Current implementation notes](#current-implementation-notes)

## Run locally

Requirements:

- Node.js (a current LTS release is recommended)
- npm

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To make a production build and run it locally:

```bash
npm run build
npm run start
```

## Environment

The app can start without environment variables. `.env.example` lists optional provider and database keys. To create a local environment file:

```bash
# macOS / Linux
cp .env.example .env.local

# Windows PowerShell
Copy-Item .env.example .env.local
```

Available variables:

| Variable | Purpose | Current behavior |
| --- | --- | --- |
| `GEMINI_API_KEY` | Reserved for Gemini question classification | Not currently read by the classifier in this checkout |
| `OPENROUTER_API_KEY` | Reserved for OpenRouter question classification | Not currently read by the classifier in this checkout |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase is not connected to the app yet |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public client key | Supabase is not connected to the app yet |

Do not commit real secrets or `.env.local`.

## How the app works

1. A visitor can learn about Sociora on the landing page and start onboarding or ask a question.
2. Onboarding collects a user type, domains, experience areas, and optional help topics. The profile API creates an anonymous ID; the browser stores the returned profile in local storage.
3. On `/ask`, the user submits a question. The page calls the classification API, then asks the matching API for relevant anonymous profiles.
4. The result shows the main domain, context, intent, target perspectives, relevant experience, a confidence value, and any matching profiles.
5. Posting sends the question, anonymous ID, and classification to the posts API. If no browser profile exists, the app sends the visitor through onboarding and carries the question along in session storage.

The public profile fields use anonymous names such as `Anonymous Scholar #4821`; the UI does not display real names or contact details. This is a demo-level anonymous display system, not an authentication or privacy security guarantee: there is no account system, access control, or persistent database, and the API accepts the anonymous ID supplied by the client. Do not use it for sensitive or personally identifying information.

## Routes and current status

| Path | Status | Description |
| --- | --- | --- |
| `/` | Implemented | Landing page and explanation of the question-routing loop. |
| `/onboarding` | Implemented | Four-step profile setup and anonymous identity reveal. |
| `/ask` | Implemented | Question entry, routing animation, match results, and post submission. Supports a question prefill through `?q=...`. |
| `/feed` | UI not present | The navigation includes a Feed link, but this checkout has no feed page. |
| `/search` | UI not present | Search API exists and the navigation has a search field, but there is no search page. |
| `/post/[id]` | UI not present | Post and answer APIs exist. The ask screen redirects here after a successful post, but this checkout has no post-detail page. |

The feed, search, and post-detail pages are described in `docs/PROMPT_B_community-feed-search.md`; that document is a workstream brief and does not mean the pages are implemented here.

## API reference

All routes are Next.js route handlers under `src/app/api` and return JSON.

| Method and path | Request | Response / behavior |
| --- | --- | --- |
| `POST /api/profile` | `{ "userType": "Student", "domains": [], "experiences": [], "helpTopics": [] }` | Creates and returns a `UserProfile`. `userType` is required. |
| `GET /api/profile?id=...` | Profile ID in query string | Returns the profile, or `404` with `{ "error": "not found" }`. |
| `POST /api/classify` | `{ "question": "..." }` | Returns a `QuestionClassification`. A missing question returns `400`. |
| `POST /api/match` | `{ "classification": { ... }, "excludeProfileId": "..." }` | Returns `{ "matches": ExperienceMatch[] }`, limited to eight profiles. `excludeProfileId` is optional. |
| `GET /api/posts?domain=Career` | Optional domain query string | Returns `{ "posts": Post[] }`; without a domain it returns all posts. |
| `POST /api/posts` | `{ "content": "...", "anonymousId": "...", "classification": { ... } }` | Creates and returns a `Post`. All three fields are required. |
| `GET /api/posts/:id` | Post ID in path | Returns `{ "post": Post, "answers": Answer[] }`, or `404`. |
| `POST /api/posts/:id/answers` | `{ "anonymousId": "...", "content": "..." }` | Adds and returns an `Answer`; requires both fields. |
| `GET /api/search?q=...` | Search text in query string | Returns `{ "classification", "posts", "people" }`. Empty `q` returns a null classification and empty arrays. |

Example classification request:

```bash
curl -X POST http://localhost:3000/api/classify \
  -H "Content-Type: application/json" \
  -d '{"question":"How do I prepare for a software engineering interview?"}'
```

## Data model

The shared TypeScript contracts live in `src/types/index.ts`.

- **User types:** Student, Working Professional, Founder, Educator, Researcher, Parent, Other.
- **Domains:** Technology, Psychology, Career, Education, Finance, Business, Relationships, Health, Science, Gaming.
- **Experiences:** College Life, Job Search, Interviews, Software Development, Starting a Business, Managing People, Mental Wellbeing, Relationships, Teaching, Research, Freelancing, Career Switching, Studying Abroad, Finance, Leadership.
- **Intents:** Advice, Discussion, Information, Venting, Recommendation.
- **Contexts:** College, Workplace, Job Search, Startup, School, Home, Online, Health, General.

Core records:

- `UserProfile`: internal ID, anonymous ID, user type, domains, experiences, help topics, and optional creation time.
- `QuestionClassification`: primary and optional secondary domain, context, intent, target user types, required experiences, tags, confidence from 0 to 1, and optional source.
- `Post`: anonymous author ID, content, classification fields, creation time, and optional answer count.
- `Answer`: post ID, anonymous author ID, content, and creation time.
- `ExperienceMatch`: profile ID, anonymous ID, score from 0 to 1, and optional matched experiences.

Keep the shared shapes in `src/types/index.ts` aligned with all API consumers when changing the data contract.

## Project structure

```text
src/
  app/
    page.tsx                 Landing page
    layout.tsx               Shared layout and navigation
    globals.css              Global styles and animation utilities
    onboarding/page.tsx      Anonymous profile setup
    ask/page.tsx             Question classification and routing UI
    api/                     Profile, classification, matching, posts, answers, search APIs
  components/
    Nav.tsx                  Global navigation and search input
    ui/                      Button, Chip, Badge, and Card primitives
  lib/
    ai/classify.ts           Deterministic question classifier
    identity.ts              Anonymous display ID generation
    matching.ts              Profile ranking
    session.ts               Browser local-storage profile helpers
    store.ts                 Seeded in-memory data store
  types/index.ts             Shared TypeScript data contracts
docs/                        Workstream implementation briefs
supabase/schema.sql          Optional schema draft; not connected to runtime
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local development server. |
| `npm run build` | Build the production application. |
| `npm run start` | Start the production server after a build. |

## Current implementation notes

- **Classification is a placeholder.** `src/lib/ai/classify.ts` uses a small set of keyword checks and currently returns `source: "fallback"`, a confidence of `0.5`, and limited categories. It does not use the Gemini or OpenRouter keys yet.
- **Matching is a placeholder.** `src/lib/matching.ts` scores domain (40%), overlapping required experience (30%), and target user type (10%). Context currently contributes zero; the intended context weighting is not implemented.
- **Data is in memory.** `src/lib/store.ts` seeds sample profiles, posts, and answers and keeps new records in the running server process. Data is not durable and may reset when the process restarts or the serverless instance changes.
- **Profiles are also stored in the browser.** `src/lib/session.ts` stores the current profile under `sociora_profile` in local storage. This browser copy does not make server data persistent.
- **Onboarding has a local fallback.** If `POST /api/profile` fails, onboarding saves a generated profile locally so the visitor can continue. That local-only profile is not added to the server-side matching store.
- **Supabase is not wired in.** `supabase/schema.sql` is a schema draft only; runtime code uses `src/lib/store.ts`.
- **Some destination screens are missing.** Feed, search, and post detail UI are not present in this checkout. In particular, a successful post is created by the API, but the redirect destination `/post/:id` currently has no page.
- **No automated test script is configured.** The available package scripts are listed above.
