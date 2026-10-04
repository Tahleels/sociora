// OWNER: Workstream B
import { NextResponse } from "next/server";
import { createPost, listPosts } from "@/lib/store";

export async function GET(req: Request) {
  const domain = new URL(req.url).searchParams.get("domain") ?? undefined;
  return NextResponse.json({ posts: await listPosts(domain) });
}

export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  if (!b?.content || !b?.anonymousId || !b?.classification) return NextResponse.json({ error: "content, anonymousId, classification required" }, { status: 400 });
  const c = b.classification;
  const post = await createPost({
    anonymousId: b.anonymousId,
    content: b.content,
    domain: c.domain,
    context: c.context,
    intent: c.intent,
    targetUserTypes: c.targetUserTypes ?? [],
    requiredExperiences: c.requiredExperiences ?? [],
    tags: c.tags ?? [],
  });
  return NextResponse.json(post);
}
