// OWNER: Workstream B
import { NextResponse } from "next/server";
import { generateAnonymousId } from "@/lib/identity";
import { createProfile, getProfileById } from "@/lib/store";

export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  if (!b?.userType) return NextResponse.json({ error: "userType required" }, { status: 400 });
  const profile = await createProfile({
    anonymousId: generateAnonymousId(b.userType),
    userType: b.userType,
    domains: b.domains ?? [],
    experiences: b.experiences ?? [],
    helpTopics: b.helpTopics ?? [],
  });
  return NextResponse.json(profile);
}

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id") ?? "";
  const p = await getProfileById(id);
  return p ? NextResponse.json(p) : NextResponse.json({ error: "not found" }, { status: 404 });
}
