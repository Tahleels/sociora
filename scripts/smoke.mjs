// Smoke test: classify + match + search for the demo questions. Usage: node scripts/smoke.mjs
const BASE = process.env.BASE_URL || "http://localhost:3000";

const cases = [
  ["final-year student job anxiety", "I am a final-year engineering student and I am scared I will not get a job after graduation. How should I deal with this?", "Career"],
  ["manager criticism", "My manager constantly criticizes me in front of everyone. How should I handle it?", "Psychology"],
  ["software interview", "How do I prepare for a software interview?", "Technology"],
];

let failed = 0;
for (const [name, question, expectedDomain] of cases) {
  const c = await fetch(`${BASE}/api/classify`, {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ question }),
  }).then((r) => r.json());
  const m = await fetch(`${BASE}/api/match`, {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ classification: c }),
  }).then((r) => r.json());
  const ok = c.domain === expectedDomain && m.matches?.length > 0;
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"} ${name}: ${c.domain}/${c.context}/${c.intent} conf=${c.confidence} src=${c.source} top=${m.matches?.[0]?.anonymousId} (${m.matches?.[0]?.score})`);
}
const s = await fetch(`${BASE}/api/search?q=${encodeURIComponent("How do I prepare for a software interview?")}`).then((r) => r.json());
const sOk = Array.isArray(s.posts) && Array.isArray(s.people);
if (!sOk) failed++;
console.log(`${sOk ? "PASS" : "FAIL"} search: ${s.posts?.length} posts, ${s.people?.length} people`);
process.exit(failed ? 1 : 0);
