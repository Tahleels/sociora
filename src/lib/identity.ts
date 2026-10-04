import type { UserType } from "@/types";

const PREFIX: Record<UserType, string> = {
  Student: "Scholar",
  "Working Professional": "Professional",
  Founder: "Builder",
  Educator: "Mentor",
  Researcher: "Researcher",
  Parent: "Guardian",
  Other: "Explorer",
};

export function generateAnonymousId(userType: UserType): string {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `Anonymous ${PREFIX[userType] ?? "Explorer"} #${n}`;
}

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
