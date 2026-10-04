// OWNER: Workstream A
import { NextResponse } from "next/server";
import { matchProfiles } from "@/lib/matching";
import { listProfiles } from "@/lib/store";

export async function POST(req: Request) {
  const { classification, excludeProfileId } = await req.json().catch(() => ({}));
  if (!classification) return NextResponse.json({ error: "classification required" }, { status: 400 });
  const matches = matchProfiles(classification, await listProfiles(), excludeProfileId).slice(0, 8);
  return NextResponse.json({ matches });
}
