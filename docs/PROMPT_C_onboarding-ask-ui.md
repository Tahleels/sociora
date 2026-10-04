# WORKSTREAM C — Landing, Onboarding, Ask + AI Routing Screen, Design System (branch: `feat/onboarding-ask`)

You are one of 3 parallel engineers on a 30-minute hackathon MVP ("Sociora": anonymous Q&A where AI routes questions to people with relevant experience). Next.js 15 + TypeScript + Tailwind. Speed > polish. Do not overengineer.

## Read first (1 minute)
- `src/types/index.ts` — shared contract + API contracts at the bottom. DO NOT change existing shapes.
- `src/lib/session.ts` — `getProfile()/saveProfile()` (localStorage). Your onboarding must call `saveProfile`.
- Working APIs you call: `POST /api/profile`, `POST /api/classify`, `POST /api/match`, `POST /api/posts`. (Workstream A is improving classify/match behind the same contract; B owns posts/feed. Code strictly to the contract.)

## You OWN (only touch these)
- `src/app/layout.tsx`, `src/app/globals.css`, `src/app/page.tsx`, `tailwind.config.ts`
- `src/app/onboarding/**`, `src/app/ask/**`
- `src/components/ui/**`, `src/components/routing/**`, `src/components/Nav.tsx`
Do NOT edit `/feed`, `/post`, `/search`, `src/components/feed/**`, `src/lib/store.ts`, `src/lib/ai/**`, `src/lib/matching.ts`, API routes.

## Tasks
1. **Design system + layout** (do this first, small): font pairing (e.g. `next/font/google` serif display for headings + Inter), tokens, `Nav` (logo "Sociora", links: Feed, Ask, Search box that routes to `/search?q=`, and the user's anonymous id chip if profile exists, else "Join anonymously"). Small ui components in `src/components/ui/`: `Button`, `Chip` (selectable), `Badge` (domain), `Card`. Aesthetic: minimal, premium, human, knowledge-focused (warm paper bg, ink text, accent). NOT Instagram/Reddit/SaaS dashboard/chatbot.
2. **Landing `/`**: strong hero ("Ask anything. Anonymously. Get answers from people who've lived it."), the core loop visualized (Question → AI Router → Right people → Anonymous discussion), CTA buttons to `/onboarding` and `/ask`. Subtle animations.
3. **`/onboarding`**: 4 steps, one question per screen, progress indicator, selectable chips (options from `USER_TYPES`, `DOMAINS`, `EXPERIENCES` in types). Q1 single-select, Q2/Q3 multi-select, Q4 optional ("What would you like help with?" free text / chips). On finish `POST /api/profile` → `saveProfile()` → reveal screen: "You are **Anonymous Scholar #4821**" with a nice animation → CTA to `/ask`. Handle API failure gracefully.
4. **`/ask` — the star of the demo (the AI routing screen)**. Flow: textarea (supports `?q=` prefill, example-question chips) → submit → animated staged progress: "Understanding your question…" with ✓ Detecting topic, ✓ Understanding context, ✓ Finding relevant experience (staggered ~500ms each, run real `POST /api/classify` in parallel; wait for both) → result card:
   - YOUR QUESTION IS MOST RELEVANT TO → domain (big, + secondary domain), context & intent badges
   - BEST PERSPECTIVES → targetUserTypes chips
   - RELEVANT EXPERIENCE → requiredExperiences + tags chips
   - Confidence: animated bar, e.g. 94%
   - PEOPLE WHO CAN HELP → top matches from `POST /api/match` (anonymous ids, match %, matched experience chips; never any real info)
   - `[ Post Anonymously ]` → `POST /api/posts` with `{content, anonymousId: getProfile().anonymousId, classification}` → redirect to `/post/{id}`. If no profile, redirect to `/onboarding` first (preserve question in sessionStorage).
   - Secondary: "Edit question" button.
   Must be visually impressive; add loading/error/empty states; if `/api/classify` fails show an error with retry.
5. Make sure the app never crashes without env vars or profile.

## Done when
Demo path works: `/` → `/onboarding` → `/ask` → routing animation + result → Post Anonymously → lands on `/post/:id`. (`/post/:id` is built by B; if not merged yet, verify the POST succeeds.) `npm run build` passes, commit on your branch and push. Do not merge to main yourself.
