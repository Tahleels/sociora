"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DOMAINS, type Domain, type Post } from "@/types";
import { PostCard } from "@/components/feed/PostCard";

const filters: Array<"All" | Domain> = ["All", ...DOMAINS];

function PostSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-ink/10 bg-white/70 p-6">
      <div className="flex gap-3">
        <div className="h-10 w-10 rounded-full bg-ink/10" />
        <div className="flex-1 space-y-3 pt-1">
          <div className="h-3 w-40 rounded bg-ink/10" />
          <div className="h-4 w-full rounded bg-ink/10" />
          <div className="h-4 w-3/4 rounded bg-ink/10" />
        </div>
      </div>
    </div>
  );
}

export default function FeedPage() {
  const [domain, setDomain] = useState<"All" | Domain>("All");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    const query = domain === "All" ? "" : `?domain=${encodeURIComponent(domain)}`;
    fetch(`/api/posts${query}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load the community feed.");
        const data = (await response.json()) as { posts: Post[] };
        setPosts(data.posts);
      })
      .catch((reason: unknown) => {
        if (reason instanceof Error && reason.name !== "AbortError") setError(reason.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [domain]);

  return (
    <main className="min-h-screen bg-paper px-5 pb-20 pt-10 text-ink sm:px-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-9 flex flex-wrap items-end justify-between gap-5">
          <div>
            <Link href="/" className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Sociora</Link>
            <h1 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">A little more understood.</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-ink/60">Questions find their way to people who have been there. Read, learn, and share at your own pace.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/search" className="rounded-full border border-ink/15 px-4 py-3 text-sm font-medium text-ink/70 transition hover:border-accent/40 hover:text-accent">Search</Link>
            <Link href="/ask" className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-white transition hover:bg-accent">Ask a question <span aria-hidden="true">↗</span></Link>
          </div>
        </header>

        <div className="mb-6 flex gap-2 overflow-x-auto pb-2" aria-label="Filter discussions by domain">
          {filters.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setDomain(item)}
              aria-pressed={domain === item}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm transition ${domain === item ? "border-ink bg-ink text-white" : "border-ink/10 bg-white/60 text-ink/65 hover:border-ink/25 hover:text-ink"}`}
            >
              {item}
            </button>
          ))}
        </div>

        <section className="space-y-4" aria-live="polite">
          {loading && <><PostSkeleton /><PostSkeleton /><PostSkeleton /></>}
          {!loading && error && <div role="alert" className="rounded-2xl border border-red-900/15 bg-red-50 p-5 text-sm text-red-900">{error} Refresh the page to try again.</div>}
          {!loading && !error && posts.map((post) => <PostCard key={post.id} post={post} />)}
          {!loading && !error && posts.length === 0 && (
            <div className="rounded-2xl border border-dashed border-ink/20 px-6 py-14 text-center">
              <h2 className="font-serif text-2xl">A quiet corner, for now.</h2>
              <p className="mt-2 text-sm text-ink/60">No discussions in {domain} yet. Start one and find people who understand.</p>
              <Link href="/ask" className="mt-5 inline-flex rounded-full bg-accent px-5 py-3 text-sm font-medium text-white transition hover:bg-accent/90">Ask the first question</Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
