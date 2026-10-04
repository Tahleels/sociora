import { NextResponse } from "next/server";
import { matchTrajectory } from "@/lib/trajectory";
import { listPosts } from "@/lib/store";

export async function POST(req: Request) {
  const { classification, excludePostId } = await req.json().catch(() => ({}));
  if (!classification) return NextResponse.json({ error: "classification required" }, { status: 400 });
  const posts = await listPosts(); // no domain filter: trajectory scores across all domains
  const matches = matchTrajectory(classification, posts, excludePostId).slice(0, 4);
  return NextResponse.json({ matches });
}
