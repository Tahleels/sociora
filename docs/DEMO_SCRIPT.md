# Demo script (~90s live)

**Setup before judges arrive:** `npm run dev`, browser on `/`, a fresh browser profile (no saved identity), wifi-independent (fallback classifier works offline).

1. **Landing (10s)** — "Reddit routes your question to a topic. Sociora routes it to people who've lived it." Click *Join anonymously*.
2. **Onboarding (15s)** — Student → Career, Psychology → College Life, Job Search → skip Q4. Reveal: *"You are Anonymous Scholar #xxxx."* Point out: no name, email, college shown — structured profile used privately for routing only.
3. **Ask (40s)** — Paste:
   > I'm a final-year engineering student and I'm scared I won't get a job after graduation. How should I deal with this?

   Let the routing animation play. Narrate the card: *Career* (with Psychology), best perspectives *Students + Working Professionals*, experience *Job Search / College Life / Mental Wellbeing*, confidence, and the **people who can help**. "Not dumped in a Psychology feed."
4. **Post (10s)** — *Post Anonymously* → lands on the discussion; seeded answers visible; post a quick answer as yourself.
5. **Contrast (15s)** — Ask: *"My manager constantly criticizes me in front of everyone."* Different domain, different people → proves it's understanding, not keywords.
6. **Search (optional)** — "How do I prepare for a software interview?" → AI interprets (Technology · Job Search), shows discussions + people.

**Fallback if something breaks:** the routing works without an API key; if the UI stalls, `node scripts/smoke.mjs` shows the router output in the terminal.
