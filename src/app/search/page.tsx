"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { ExperienceMatch, Post, QuestionClassification } from "@/types";
import { AnonymousAvatar, PostCard } from "@/components/feed/PostCard";

interface SearchResponse {
  classification: QuestionClassification | null;
  posts: Post[];
  people: ExperienceMatch[];
}

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") ?? "";
  const [input, setInput] = useState(query);
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => setInput(query), [query]);

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError("");
    fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Search is unavailable right now.");
        setResults((await response.json()) as SearchResponse);
      })
      .catch((reason: unknown) => {
        if (reason instanceof Error && reason.name !== "AbortError") setError(reason.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [query]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = input.trim();
    router.push(value ? `/search?q=${encodeURIComponent(value)}` : "/search");
  }

  const classification = results?.classification;
  const understood = classification
    ? [...new Set([classification.domain, classification.secondaryDomain, classification.context, classification.intent, ...classification.requiredExperiences, ...classification.tags].filter(Boolean))]
    : [];

  return (
    <main className="min-h-screen bg-paper px-5 pb-20 pt-8 text-ink sm:px-8">
      <div className="mx-auto max-w-4xl">
        <nav className="mb-10 flex items-center justify-between">
          <Link href="/feed" className="text-sm text-ink/60 transition hover:text-accent">← Community</Link>
          <Link href="/" className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Sociora</Link>
        </nav>

        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Find your people</p>
          <h1 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">Search the community</h1>
          <form onSubmit={submitSearch} className="mt-6 flex gap-2 rounded-2xl border border-ink/10 bg-white/80 p-2 shadow-[0_12px_40px_rgba(20,17,15,0.04)]">
            <label htmlFor="community-search" className="sr-only">Search discussions or ask a question</label>
            <input id="community-search" value={input} onChange={(event) => setInput(event.target.value)} placeholder="What would you like to figure out?" className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-ink/35 sm:px-4" />
            <button type="submit" className="rounded-xl bg-ink px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent">Search</button>
          </form>
        </header>

        {!query.trim() && <p className="mt-12 rounded-2xl border border-dashed border-ink/15 p-8 text-center text-sm text-ink/55">Search a question or topic to find helpful conversations and people.</p>}
        {loading && <div className="mt-8 space-y-4" aria-label="Searching"><div className="h-24 animate-pulse rounded-2xl bg-ink/5" /><div className="h-40 animate-pulse rounded-2xl bg-ink/5" /></div>}
        {!loading && error && <p role="alert" className="mt-8 rounded-2xl border border-red-900/15 bg-red-50 p-5 text-sm text-red-900">{error}</p>}

        {!loading && !error && results && (
          <div className="mt-8 space-y-10">
            {classification && (
              <section className="rounded-2xl border border-accent/15 bg-accent/[0.045] p-5 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Understood as</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {understood.map((item) => <span key={item} className="rounded-full border border-accent/15 bg-white/70 px-3 py-1.5 text-sm text-ink/75">{item}</span>)}
                </div>
              </section>
            )}

            <section>
              <div className="mb-4 flex items-baseline justify-between">
                <h2 className="font-serif text-2xl">Relevant discussions</h2>
                <span className="text-xs text-ink/45">{results.posts.length} found</span>
              </div>
              {results.posts.length > 0 ? (
                <div className="space-y-4">{results.posts.map((post) => <PostCard key={post.id} post={post} />)}</div>
              ) : (
                <div className="rounded-2xl border border-dashed border-ink/15 px-6 py-8">
                  <p className="font-serif text-xl">No discussions yet — ask this question.</p>
                  <p className="mt-2 text-sm text-ink/55">Your question may help someone else find the conversation they need.</p>
                  <Link href={`/ask?q=${encodeURIComponent(query)}`} className="mt-5 inline-flex rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent/90">Ask this question <span className="ml-2">↗</span></Link>
                </div>
              )}
            </section>

            <section>
              <div className="mb-4 flex items-baseline justify-between">
                <h2 className="font-serif text-2xl">People with relevant experience</h2>
                <span className="text-xs text-ink/45">{results.people.length} matched</span>
              </div>
              {results.people.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {results.people.map((person) => (
                    <article key={person.profileId} className="rounded-2xl border border-ink/10 bg-white/65 p-5">
                      <div className="flex items-center gap-3">
                        <AnonymousAvatar anonymousId={person.anonymousId} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">{person.anonymousId}</p>
                          <p className="mt-1 text-xs text-ink/50">{person.userType ?? "Community member"}</p>
                        </div>
                        <span className="rounded-full bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent">{Math.round(person.score * 100)}% match</span>
                      </div>
                      {person.matchedExperiences && person.matchedExperiences.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {person.matchedExperiences.map((experience) => <span key={experience} className="rounded-md border border-ink/10 px-2 py-1 text-[11px] text-ink/60">{experience}</span>)}
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              ) : <p className="text-sm text-ink/55">No matching profiles just yet.</p>}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

export default function SearchPage() {
  return <Suspense fallback={<main className="min-h-screen bg-paper p-8"><div className="mx-auto h-48 max-w-4xl animate-pulse rounded-2xl bg-ink/5" /></main>}><SearchResults /></Suspense>;
}
