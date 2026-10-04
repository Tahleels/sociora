import { NextResponse } from "next/server";
import { resolvePost } from "@/lib/store";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = await req.json().catch(() => null);
  if (typeof b?.outcome !== "string" || !b.outcome.trim()) {
    return NextResponse.json({ error: "outcome required" }, { status: 400 });
  }
  const post = await resolvePost(id, b.outcome.trim());
  return post ? NextResponse.json(post) : NextResponse.json({ error: "not found" }, { status: 404 });
}
