// OWNER: Workstream A
import { NextResponse } from "next/server";
import { classifyQuestion } from "@/lib/ai/classify";

export async function POST(req: Request) {
  const { question } = await req.json().catch(() => ({ question: "" }));
  if (!question || typeof question !== "string") return NextResponse.json({ error: "question required" }, { status: 400 });
  return NextResponse.json(await classifyQuestion(question));
}
