// OWNER: Workstream B
import { NextResponse } from "next/server";
import { createAnswer, getPost } from "@/lib/store";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = await req.json().catch(() => null);
  if (typeof b?.content !== "string" || !b.content.trim() || typeof b?.anonymousId !== "string" || !b.anonymousId.trim()) {
    return NextResponse.json({ error: "content, anonymousId required" }, { status: 400 });
  }
  if (!(await getPost(id))) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(await createAnswer({ postId: id, anonymousId: b.anonymousId, content: b.content.trim() }));
}
