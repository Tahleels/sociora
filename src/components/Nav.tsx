"use client";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getProfile } from "@/lib/session";
import type { UserProfile } from "@/types";
export default function Nav() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => setProfile(getProfile()), [pathname]);
  function search(e: FormEvent) { e.preventDefault(); const q = query.trim(); if (q) router.push(`/search?q=${encodeURIComponent(q)}`); }
  return <header className="sticky top-0 z-30 border-b border-line/80 bg-paper/90 backdrop-blur-xl"><div className="mx-auto flex h-[76px] max-w-7xl items-center gap-6 px-5 lg:px-10">
    <Link href="/" className="font-serif text-[25px] font-semibold tracking-tight">sociora<span className="text-accent">.</span></Link>
    <nav className="flex shrink-0 items-center gap-3 text-sm text-muted sm:gap-5"><Link className="hidden hover:text-ink md:inline" href="/feed">Feed</Link><Link className="hover:text-ink" href="/ask">Ask</Link></nav>
    <form onSubmit={search} className="ml-auto hidden w-full max-w-xs items-center rounded-full border border-line bg-white/70 px-4 sm:flex"><span className="text-muted">⌕</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search questions" aria-label="Search questions" className="w-full bg-transparent px-2 py-2.5 text-sm outline-none placeholder:text-muted/70" /></form>
    <Link href={profile ? "/ask" : "/onboarding"} className="ml-auto max-w-[140px] truncate whitespace-nowrap rounded-full border border-line bg-white/70 px-3 py-2.5 text-xs font-semibold text-ink hover:border-accent sm:ml-0 sm:max-w-none sm:px-4">{profile ? profile.anonymousId : "Join anonymously"}</Link>
  </div></header>;
}
