"use client";
import type { UserProfile } from "@/types";

const KEY = "sociora_profile";

export function getProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch {
    return null;
  }
}
export function saveProfile(p: UserProfile) {
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch {}
}
export function clearProfile() {
  try { localStorage.removeItem(KEY); } catch {}
}
