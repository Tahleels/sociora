// OWNER: Workstream B
import { NextResponse } from "next/server";
import { createAnswer } from "@/lib/store";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = await req.json().catch(() => null);
  if (!b?.content || !b?.anonymousId) return NextResponse.json({ error: "content, anonymousId required" }, { status: 400 });
  return NextResponse.json(await createAnswer({ postId: id, anonymousId: b.anonymousId, content: b.content }));
}
