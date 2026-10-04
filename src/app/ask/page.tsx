"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { getProfile } from "@/lib/session";
import type { ExperienceMatch, QuestionClassification } from "@/types";

const examples = ["Should I switch careers in my 30s?", "How do you make friends after moving?", "What helped you through burnout?"];
type Stage = "idle" | "classifying" | "matching" | "done" | "error";
export default function AskPage() {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [stage, setStage] = useState<Stage>("idle"), [routeStep, setRouteStep] = useState(0), [classification, setClassification] = useState<QuestionClassification | null>(null), [matches, setMatches] = useState<ExperienceMatch[]>([]), [error, setError] = useState(""), [matchError, setMatchError] = useState(""), [posting, setPosting] = useState(false);
  useEffect(() => { const q = new URLSearchParams(window.location.search).get("q"); if (q) { setQuestion(q); try { sessionStorage.removeItem("sociora_pending_question"); } catch {} } }, []);
  const routeQuestion = useCallback(async (text = question) => {
    const clean = text.trim(); if (!clean) return;
    setQuestion(clean); setError(""); setMatchError(""); setClassification(null); setMatches([]); setRouteStep(0); setStage("classifying");
    const classifyPromise = fetch("/api/classify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: clean }) }).then(async r => { if (!r.ok) throw new Error("We could not understand this question yet."); return r.json() as Promise<QuestionClassification>; });
    const ticker = setInterval(() => setRouteStep(current => Math.min(2, current + 1)), 220);
    try {
      const [result] = await Promise.all([classifyPromise, new Promise(resolve => setTimeout(resolve, 620))]);
      clearInterval(ticker); setRouteStep(3);
      setClassification(result); setStage("matching");
      const profile = getProfile();
      try {
        const matchResponse = await fetch("/api/match", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ classification: result, excludeProfileId: profile?.id }) });
        if (!matchResponse.ok) throw new Error("The people matching service is unavailable.");
        const data = await matchResponse.json(); setMatches(Array.isArray(data.matches) ? data.matches : []);
      } catch { setMatchError("We found the right route, but could not load matching people. Retry the routing step to look again."); }
      await new Promise(resolve => setTimeout(resolve, 220));
      setStage("done");
    } catch (e) { clearInterval(ticker); setError(e instanceof Error ? e.message : "Something went wrong. Please try again."); setStage("error"); }
  }, [question]);
  async function postAnonymously() {
    const profile = getProfile();
    if (!profile) { try { sessionStorage.setItem("sociora_pending_question", question); } catch {} router.push("/onboarding"); return; }
    if (!classification) return;
    setPosting(true); setError("");
    try {
      const res = await fetch("/api/posts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: question, anonymousId: profile.anonymousId, classification }) });
      const data = await res.json(); if (!res.ok) throw new Error(data.error ?? "Your question could not be posted.");
      router.push(`/post/${data.id}`);
    } catch (e) { setError(e instanceof Error ? e.message : "Your question could not be posted."); setPosting(false); }
  }
  const running = stage === "classifying" || stage === "matching";
  return <main className="mx-auto max-w-5xl px-5 py-10 sm:py-14">
    <div className="mx-auto max-w-3xl text-center"><p className="text-xs font-bold uppercase tracking-[.2em] text-accent">A question has a way of finding its people</p><h1 className="mt-3 font-serif text-4xl sm:mt-4 sm:text-6xl">What&apos;s on your mind?</h1><p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted sm:mt-4 sm:text-base sm:leading-7">Ask honestly. We&apos;ll find the people whose experience could make a difference.</p></div>

    <form className="mx-auto mt-7 max-w-3xl sm:mt-10" onSubmit={event => { event.preventDefault(); routeQuestion(); }}>
      <Card className="p-4 sm:p-7">
        <label htmlFor="question" className="sr-only">Your question</label>
        <textarea id="question" value={question} disabled={running} onChange={e => setQuestion(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); routeQuestion(); } }} maxLength={1200} placeholder="I&apos;m trying to figure out..." className="min-h-36 w-full resize-y bg-transparent p-2 text-base leading-7 outline-none placeholder:text-[#b4aca2] focus-visible:ring-2 focus-visible:ring-accent/30 disabled:opacity-70 sm:min-h-40 sm:text-lg sm:leading-8" />
        <div className="mt-3 flex flex-col gap-3 border-t border-line pt-4 sm:mt-4 sm:flex-row sm:items-center sm:justify-between"><span className="text-xs text-muted">Your identity stays private <span className="mx-1">·</span> {question.length}/1200</span><Button type="submit" disabled={!question.trim() || running} className="w-full sm:w-auto">{running ? "Routing your question..." : "Find my people"} <span aria-hidden>↗</span></Button></div>
      </Card>
      <p className="mt-2 text-right text-[11px] text-muted">Tip: press Ctrl or Command + Enter to route</p>
    </form>

    {stage === "idle" && <div className="mx-auto mt-5 max-w-3xl"><p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">Need a place to start?</p><div className="flex flex-wrap gap-2">{examples.map(ex => <Chip key={ex} onClick={() => { setQuestion(ex); routeQuestion(ex); }}>{ex}</Chip>)}</div></div>}

    {running && <Card role="status" aria-live="polite" className="reveal mx-auto mt-7 max-w-3xl p-5 sm:mt-9 sm:p-8"><div className="flex items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f2e6dc] text-accent"><span className="animate-spin motion-reduce:animate-none">✳</span></span><div><h2 className="font-serif text-xl sm:text-2xl">{stage === "matching" ? "Finding relevant people..." : "Understanding your question..."}</h2><p className="mt-1 text-xs text-muted">Connecting the topic, context, and lived experience.</p></div></div><ol className="mt-7 space-y-3" aria-label="Routing progress">{["Detecting topic", "Understanding context", "Finding relevant experience"].map((label, i) => { const complete = stage === "matching" || i < routeStep; const active = stage === "classifying" && i === routeStep; return <li key={label} aria-current={active ? "step" : undefined} className="flex items-center gap-3 text-sm"><span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs ${complete ? "bg-[#e8eee4] text-[#617859]" : active ? "border border-accent text-accent" : "border border-line text-muted"}`}>{complete ? "✓" : active ? <span className="animate-pulse">●</span> : "·"}</span><span className={complete || active ? "text-ink" : "text-muted"}>{label}</span></li>; })}</ol></Card>}

    {stage === "error" && <Card role="alert" className="reveal mx-auto mt-7 max-w-3xl p-6 sm:mt-9 sm:p-8"><h2 className="font-serif text-2xl">We couldn&apos;t route that just yet.</h2><p className="mt-2 text-sm leading-6 text-muted">{error}</p><Button className="mt-5 w-full sm:w-auto" onClick={() => routeQuestion()}>Try again</Button></Card>}

    {stage === "done" && classification && <section aria-labelledby="route-result-title" className="reveal mx-auto mt-8 max-w-5xl sm:mt-10"><div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-accent"><span aria-hidden>✳</span> Your question has a direction</div><Card className="overflow-hidden"><div className="border-b border-line px-5 py-4 sm:px-8"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-muted">Your question</p><p className="mt-1 break-words font-serif text-lg leading-7 sm:text-xl">&ldquo;{question}&rdquo;</p></div><div className="grid lg:grid-cols-[1fr_310px]"><div className="p-5 sm:p-8 lg:p-10">
      <p className="text-[10px] font-bold uppercase tracking-[.18em] text-muted">Domain</p><h2 id="route-result-title" className="mt-1 font-serif text-4xl sm:text-5xl">{classification.domain}<span className="text-accent">.</span></h2><div className="mt-4 flex flex-wrap gap-2"><Badge>Context · {classification.context}</Badge><Badge tone="accent">Intent · {classification.intent}</Badge>{classification.secondaryDomain && <Badge>Also related · {classification.secondaryDomain}</Badge>}</div>
      <div className="my-7 h-px bg-line sm:my-8"/><div className="grid gap-6 sm:grid-cols-2"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-muted">Target perspectives</p><div className="mt-3 flex flex-wrap gap-2">{classification.targetUserTypes.length ? classification.targetUserTypes.map(x => <Chip key={x} className="cursor-default">{x}</Chip>) : <p className="text-sm text-muted">Open to any perspective.</p>}</div></div><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-muted">Required experience</p><div className="mt-3 flex flex-wrap gap-2">{classification.requiredExperiences.map(x => <Badge key={x} tone="accent">{x}</Badge>)}</div>{!classification.requiredExperiences.length && <p className="mt-3 text-sm text-muted">No specific experience required.</p>}{classification.tags.length > 0 && <p className="mt-3 text-xs leading-5 text-muted">Signals: {classification.tags.join(" · ")}</p>}</div></div>
      <div className="mt-7 rounded-2xl bg-[#f6f2ec] p-4 sm:mt-9 sm:p-5"><div className="flex items-end justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-muted">Routing confidence</p><p className="mt-1 text-xs text-muted">Confidence in this topic and experience route</p></div><span className="shrink-0 font-serif text-3xl">{Math.round(classification.confidence * 100)}<small className="text-lg">%</small></span></div><div role="progressbar" aria-label="Routing confidence" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(classification.confidence * 100)} className="mt-4 h-2 overflow-hidden rounded-full bg-white"><div className="confidence-fill h-full rounded-full bg-accent" style={{ width: `${Math.max(4, Math.min(100, classification.confidence * 100))}%` }}/></div></div>
    </div><aside className="border-t border-line bg-[#f8f5f0] p-5 sm:p-7 lg:border-l lg:border-t-0"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-muted">Relevant people</p><h3 className="mt-2 font-serif text-2xl">People who can help</h3>{matches.length ? <div className="mt-5 space-y-3">{matches.slice(0,4).map(match => <MatchCard key={match.profileId} match={match} targetUserTypes={classification.targetUserTypes}/>)}</div> : matchError ? <div role="alert" className="mt-5 rounded-2xl border border-[#dcb9aa] bg-white/80 p-4"><p className="text-sm font-medium">People could not load.</p><p className="mt-1 text-xs leading-5 text-muted">{matchError}</p><Button variant="secondary" className="mt-3 w-full" onClick={() => routeQuestion(question)}>Retry routing</Button></div> : <div className="mt-5 rounded-2xl border border-line bg-white/70 p-4"><p className="text-sm font-medium">No close match yet.</p><p className="mt-1 text-xs leading-5 text-muted">Your question can still find its way to someone with the right perspective.</p></div>}<div className="mt-6 border-t border-line pt-5"><p className="text-xs leading-5 text-muted">Your question will be shared with your anonymous ID.</p><Button disabled={posting} onClick={postAnonymously} className="mt-4 min-h-14 w-full text-sm">{posting ? "Posting..." : "Post anonymously"} <span aria-hidden>↗</span></Button><Button variant="quiet" className="mt-2 w-full" onClick={() => { setStage("idle"); setClassification(null); setMatchError(""); }}>Edit question</Button></div></aside></div></Card>{error && <p role="alert" className="mt-3 text-center text-sm text-accent">{error}</p>}</section>}
  </main>;
}
function MatchCard({ match, targetUserTypes }: { match: ExperienceMatch; targetUserTypes: string[] }) {
  const reasons = [...(match.matchedExperiences ?? []).map(experience => `Experience: ${experience}`), ...(match.userType && targetUserTypes.includes(match.userType) ? [`Perspective: ${match.userType}`] : [])];
  return <div className="rounded-2xl border border-line bg-white/80 p-4"><div className="flex flex-wrap items-start justify-between gap-2"><div><p className="text-sm font-semibold">{match.anonymousId}</p>{match.userType && <p className="mt-1 text-xs text-muted">{match.userType}</p>}</div><Badge>{Math.round(match.score * 100)}% match</Badge></div><div className="mt-3 border-t border-line pt-3"><p className="text-[10px] font-bold uppercase tracking-[.14em] text-muted">Why this match</p>{reasons.length ? <div className="mt-2 flex flex-wrap gap-1.5">{reasons.map(reason => <span key={reason} className="rounded-full bg-mist px-2.5 py-1 text-[10px] text-muted">{reason}</span>)}</div> : <p className="mt-1 text-xs leading-5 text-muted">Selected for a relevant perspective on this topic.</p>}</div></div>;
}
