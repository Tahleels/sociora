"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { Answer, Post as PostType } from "@/types";
import { getProfile } from "@/lib/session";
import { AnonymousAvatar, relativeTime } from "@/components/feed/PostCard";

interface PostResponse {
  post: PostType;
  answers: Answer[];
}

export default function PostPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<PostResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [anonymousId, setAnonymousId] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [answerError, setAnswerError] = useState("");

  useEffect(() => {
    setAnonymousId(getProfile()?.anonymousId ?? null);
    const controller = new AbortController();
    fetch(`/api/posts/${encodeURIComponent(id)}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(response.status === 404 ? "This discussion could not be found." : "Could not load this discussion.");
        setData((await response.json()) as PostResponse);
      })
      .catch((reason: unknown) => {
        if (reason instanceof Error && reason.name !== "AbortError") setError(reason.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [id]);

  async function submitAnswer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const answerText = content.trim();
    if (!data || !anonymousId || !answerText || sending) return;

    const optimisticAnswer: Answer = {
      id: `optimistic-${Date.now()}`,
      postId: data.post.id,
      anonymousId,
      content: answerText,
      createdAt: new Date().toISOString(),
    };
    setData((current) => current ? { ...current, answers: [...current.answers, optimisticAnswer] } : current);
    setContent("");
    setSending(true);
    setAnswerError("");

    try {
      const response = await fetch(`/api/posts/${encodeURIComponent(data.post.id)}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anonymousId, content: answerText }),
      });
      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(result?.error ?? "Your answer could not be posted.");
      }
      const savedAnswer = (await response.json()) as Answer;
      setData((current) => current ? {
        ...current,
        answers: current.answers.map((answer) => answer.id === optimisticAnswer.id ? savedAnswer : answer),
      } : current);
    } catch (reason) {
      setData((current) => current ? {
        ...current,
        answers: current.answers.filter((answer) => answer.id !== optimisticAnswer.id),
      } : current);
      setContent(answerText);
      setAnswerError(reason instanceof Error ? reason.message : "Your answer could not be posted.");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="min-h-screen bg-paper px-5 pb-20 pt-8 text-ink sm:px-8">
      <div className="mx-auto max-w-3xl">
        <nav className="mb-8 flex items-center justify-between">
          <Link href="/feed" className="text-sm text-ink/60 transition hover:text-accent">← Back to discussions</Link>
          <Link href="/" className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Sociora</Link>
        </nav>

        {loading && <div className="animate-pulse space-y-5 rounded-2xl border border-ink/10 bg-white/70 p-7"><div className="h-4 w-44 rounded bg-ink/10" /><div className="h-7 w-11/12 rounded bg-ink/10" /><div className="h-7 w-3/4 rounded bg-ink/10" /></div>}
        {!loading && error && <div role="alert" className="rounded-2xl border border-red-900/15 bg-red-50 p-6 text-sm text-red-900">{error}<p className="mt-4"><Link href="/feed" className="underline">Return to the community feed</Link></p></div>}

        {!loading && !error && data && (
          <>
            <article className="rounded-3xl border border-ink/10 bg-white/75 p-6 shadow-[0_18px_60px_rgba(20,17,15,0.04)] sm:p-9">
              <div className="flex items-center gap-3">
                <AnonymousAvatar anonymousId={data.post.anonymousId} size="large" />
                <div>
                  <p className="text-sm font-semibold">{data.post.anonymousId}</p>
                  <p className="mt-1 text-xs text-ink/45">{relativeTime(data.post.createdAt)}</p>
                </div>
              </div>
              <h1 className="mt-7 whitespace-pre-wrap font-serif text-3xl leading-tight tracking-tight sm:text-4xl">{data.post.content}</h1>

              <div className="mt-6 flex flex-wrap gap-2">
                <span className="rounded-full bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent">{data.post.domain}</span>
                <span className="rounded-full bg-ink/[0.045] px-3 py-1.5 text-xs text-ink/65">{data.post.context}</span>
                <span className="rounded-full bg-ink/[0.045] px-3 py-1.5 text-xs text-ink/65">{data.post.intent}</span>
              </div>

              {data.post.requiredExperiences.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {data.post.requiredExperiences.map((experience) => <span key={experience} className="rounded-md border border-ink/10 px-2.5 py-1.5 text-xs text-ink/60">{experience}</span>)}
                </div>
              )}

              <div className="mt-7 border-t border-ink/[0.08] pt-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/40">Routed to</p>
                <p className="mt-2 text-sm text-ink/70">{data.post.targetUserTypes.join(" · ") || "Community"}</p>
              </div>
            </article>

            <section className="mt-10">
              <div className="mb-5 flex items-baseline justify-between">
                <h2 className="font-serif text-2xl">Thoughtful answers</h2>
                <span className="text-sm text-ink/50">{data.answers.length}</span>
              </div>
              <div className="space-y-3">
                {data.answers.map((answer) => (
                  <article key={answer.id} className="rounded-2xl border border-ink/10 bg-white/60 p-5 sm:p-6">
                    <div className="flex items-center gap-3">
                      <AnonymousAvatar anonymousId={answer.anonymousId} />
                      <div>
                        <p className="text-sm font-semibold">{answer.anonymousId}</p>
                        <p className="mt-0.5 text-xs text-ink/45">{relativeTime(answer.createdAt)}</p>
                      </div>
                    </div>
                    <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-ink/80">{answer.content}</p>
                  </article>
                ))}
                {data.answers.length === 0 && <p className="rounded-2xl border border-dashed border-ink/15 px-5 py-8 text-center text-sm text-ink/55">No answers yet. Your perspective could be the one someone needs.</p>}
              </div>
            </section>

            <section className="mt-8 rounded-2xl border border-ink/10 bg-white/60 p-5 sm:p-6">
              <h2 className="font-serif text-xl">Add your perspective</h2>
              {anonymousId ? (
                <form className="mt-4" onSubmit={submitAnswer}>
                  <label htmlFor="answer" className="sr-only">Your answer</label>
                  <textarea id="answer" value={content} onChange={(event) => setContent(event.target.value)} maxLength={5000} rows={4} placeholder="Share what you’ve learned or what helped you…" className="w-full resize-y rounded-xl border border-ink/10 bg-paper px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-ink/35 focus:border-accent/50 focus:ring-2 focus:ring-accent/10" />
                  {answerError && <p role="alert" className="mt-2 text-sm text-red-800">{answerError}</p>}
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-ink/45">Answering as {anonymousId}</p>
                    <button type="submit" disabled={sending || !content.trim()} className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50">{sending ? "Sharing…" : "Share answer"}</button>
                  </div>
                </form>
              ) : (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
                  <p className="text-sm text-ink/60">An anonymous profile is needed to share an answer. You can browse other discussions in the meantime.</p>
                  <Link href="/feed" className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent/90">Browse discussions</Link>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
