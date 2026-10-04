# WORKSTREAM B — Community Feed, Post Detail, Answers, Search, Data Layer (branch: `feat/community`)

You are one of 3 parallel engineers on a 30-minute hackathon MVP ("Sociora": anonymous Q&A where AI routes questions to people with relevant experience). Next.js 15 + TypeScript + Tailwind. Speed > polish. Do not overengineer.

## Read first (1 minute)
- `src/types/index.ts` — shared contract (and the API contract list at the bottom). DO NOT change existing shapes.
- `src/lib/store.ts` — in-memory seeded data layer (works with no DB).
- `src/lib/session.ts` — `getProfile()` returns the current user's profile from localStorage (set by Workstream C's onboarding). Until onboarding exists, fall back gracefully (e.g. read-only mode or a default anonymous id) — never crash.
- API routes already exist and work: `src/app/api/{posts,posts/[id],posts/[id]/answers,search,profile}`.

## You OWN (only touch these)
- `src/lib/store.ts`
- `src/app/api/posts/**`, `src/app/api/search/**`, `src/app/api/profile/**`
- `src/app/feed/**`, `src/app/post/**`, `src/app/search/**`
- `src/components/feed/**` (create this folder; put all your components here)
Do NOT edit layout.tsx, globals.css, page.tsx, `/onboarding`, `/ask`, `src/components/ui/**`, `src/lib/ai/**`, `src/lib/matching.ts`. Need something shared? Build it inside `src/components/feed/`.

## Tasks
1. **`/feed` page**: domain filter chips (All + DOMAINS), list of post cards from `GET /api/posts?domain=`. Each card: anonymous identity (e.g. "Anonymous Scholar #9012") with a simple generated avatar (initial/gradient from id hash — no photos), content, domain badge, context badge, intent, experience tags ("Job Search", ...), "Routed to: Students · Working Professionals", answer count, relative time. Good loading skeleton + empty state. Nicely animated (CSS transitions / fade-in).
2. **`/post/[id]` page**: full post with classification badges, answers list, and an anonymous answer composer that `POST`s to `/api/posts/:id/answers` using `getProfile()?.anonymousId`. New answer appears instantly (optimistic). If no profile yet, show "Join anonymously to answer" linking to `/onboarding`.
3. **`/search` page** (reads `?q=`, has a search box): calls `GET /api/search?q=`. Show the AI's understanding at top ("Understood as: Technology · Job Search · Advice" using `classification`), then "Relevant discussions" (post cards, reuse your PostCard) and "People with relevant experience" (anonymous ids + userType + matched experience chips + match %). Handle empty state ("No discussions yet — ask this question"; link to `/ask?q=...`).
4. Improve `store.ts` internals if time permits (more seed data for richer demo: ~12 posts across domains, ~12 profiles, answers). **Keep every exported function signature unchanged** — other streams call them. Optional last: Supabase backend when `NEXT_PUBLIC_SUPABASE_URL` is set (`supabase/schema.sql` exists; use plain `fetch` to the REST API or add `@supabase/supabase-js`); must fall back to in-memory when unset. Skip if short on time.
5. Export a reusable `PostCard` from `src/components/feed/PostCard.tsx` (Workstream C may import it after merge — optional, don't block on it).

## Design
Minimal, premium, human, knowledge-focused. NOT Reddit/Instagram. Warm paper background (`bg-paper`, `text-ink`, accent `text-accent` already in tailwind config), strong typography, generous whitespace, soft borders, subtle hover/entrance animations.

## Done when
`/feed`, `/post/q1`, `/search?q=how do I prepare for a software interview` all work end-to-end on seed data, `npm run build` passes, commit on your branch and push. Do not merge to main yourself.
