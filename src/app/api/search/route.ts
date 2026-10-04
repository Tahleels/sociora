// OWNER: Workstream B (uses A's classifyQuestion + matchProfiles)
import { NextResponse } from "next/server";
import { classifyQuestion } from "@/lib/ai/classify";
import { matchProfiles } from "@/lib/matching";
import { listPosts, listProfiles } from "@/lib/store";

export async function GET(req: Request) {
  const q = (new URL(req.url).searchParams.get("q") ?? "").trim();
  if (!q) return NextResponse.json({ classification: null, posts: [], people: [] });
  const classification = await classifyQuestion(q);
  const words = q.toLowerCase().split(/\W+/).filter((w) => w.length > 2);
  const posts = (await listPosts())
    .map((p) => {
      const hay = `${p.content} ${p.tags.join(" ")}`.toLowerCase();
      const score = words.filter((w) => hay.includes(w)).length + (p.domain === classification.domain ? 2 : 0);
      return { p, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.p);
  const people = matchProfiles(classification, await listProfiles()).slice(0, 5);
  return NextResponse.json({ classification, posts, people });
}
