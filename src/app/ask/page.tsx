"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { getProfile } from "@/lib/session";
import type { ExperienceMatch, QuestionClassification, TrajectoryMatch } from "@/types";

const examples = ["Should I switch careers in my 30s?", "How do you make friends after moving?", "What helped you through burnout?"];
type Stage = "idle" | "classifying" | "matching" | "done" | "error";
export default function AskPage() {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [stage, setStage] = useState<Stage>("idle"), [classification, setClassification] = useState<QuestionClassification | null>(null), [matches, setMatches] = useState<ExperienceMatch[]>([]), [trajectory, setTrajectory] = useState<TrajectoryMatch[]>([]), [error, setError] = useState(""), [posting, setPosting] = useState(false);
  useEffect(() => { const q = new URLSearchParams(window.location.search).get("q"); if (q) { setQuestion(q); try { sessionStorage.removeItem("sociora_pending_question"); } catch {} } }, []);
  const routeQuestion = useCallback(async (text = question) => {
    const clean = text.trim(); if (!clean) return;
    setQuestion(clean); setError(""); setClassification(null); setMatches([]); setTrajectory([]); setStage("classifying");
    const classifyPromise = fetch("/api/classify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: clean }) }).then(async r => { if (!r.ok) throw new Error("We couldn’t understand this question yet."); return r.json() as Promise<QuestionClassification>; });
    try {
      const [result] = await Promise.all([classifyPromise, new Promise(resolve => setTimeout(resolve, 1650))]);
      setClassification(result); setStage("matching");
      const profile = getProfile();
      const matchPromise = fetch("/api/match", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ classification: result, excludeProfileId: profile?.id }) });
      const trajectoryPromise = fetch("/api/trajectory", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ classification: result }) });
      const [matchResponse, trajectoryResponse] = await Promise.all([matchPromise, trajectoryPromise, new Promise(resolve => setTimeout(resolve, 600))]);
      if (matchResponse.ok) { const data = await matchResponse.json(); setMatches(Array.isArray(data.matches) ? data.matches : []); }
      if (trajectoryResponse.ok) { const data = await trajectoryResponse.json(); setTrajectory(Array.isArray(data.matches) ? data.matches : []); }
      setStage("done");
    } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong. Please try again."); setStage("error"); }
  }, [question]);
  async function postAnonymously() {
    const profile = getProfile();
    if (!profile) { try { sessionStorage.setItem("sociora_pending_question", question); } catch {} router.push("/onboarding"); return; }
    if (!classification) return;
    setPosting(true); setError("");
    try {
      const res = await fetch("/api/posts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: question, anonymousId: profile.anonymousId, classification }) });
      const data = await res.json(); if (!res.ok) throw new Error(data.error ?? "Your question couldn’t be posted.");
      router.push(`/post/${data.id}`);
    } catch (e) { setError(e instanceof Error ? e.message : "Your question couldn’t be posted."); setPosting(false); }
  }
  const running = stage === "classifying" || stage === "matching";
  return <main className="mx-auto max-w-5xl px-5 py-12 sm:py-16">
    <div className="mx-auto max-w-3xl text-center"><p className="text-xs font-bold uppercase tracking-[.2em] text-accent">A question has a way of finding its people</p><h1 className="mt-4 font-serif text-4xl sm:text-6xl">What’s on your mind?</h1><p className="mx-auto mt-4 max-w-xl leading-7 text-muted">Ask honestly. We’ll find the people whose experience could make a difference.</p></div>
    <Card className="mx-auto mt-10 max-w-3xl p-5 sm:p-7"><label htmlFor="question" className="sr-only">Your question</label><textarea id="question" value={question} onChange={e => setQuestion(e.target.value)} maxLength={1200} placeholder="I’m trying to figure out…" className="min-h-40 w-full resize-y bg-transparent p-2 text-lg leading-8 outline-none placeholder:text-[#b4aca2]"/><div className="mt-4 flex items-center justify-between border-t border-line pt-4"><span className="text-xs text-muted">Your identity stays private <span className="mx-1">·</span> {question.length}/1200</span><Button disabled={!question.trim() || running} onClick={() => routeQuestion()}>{running ? "Finding your people…" : "Find my people"} <span aria-hidden>↗</span></Button></div></Card>
    {stage === "idle" && <div className="mx-auto mt-6 max-w-3xl"><p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">Need a place to start?</p><div className="flex flex-wrap gap-2">{examples.map(ex => <Chip key={ex} onClick={() => { setQuestion(ex); routeQuestion(ex); }}>{ex}</Chip>)}</div></div>}
    {running && <Card className="reveal mx-auto mt-9 max-w-3xl p-7 sm:p-9"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#f2e6dc] text-accent"><span className="animate-spin">✳</span></span><div><h2 className="font-serif text-2xl">Understanding your question…</h2><p className="mt-1 text-xs text-muted">Looking for the experience behind the answer.</p></div></div><div className="mt-8 space-y-4">{["Detecting topic", "Understanding context", "Finding relevant experience"].map((label, i) => { const complete = stage === "matching" || (stage === "classifying" && i < 2); return <div key={label} className="flex items-center gap-3 text-sm"><span className={`grid h-6 w-6 place-items-center rounded-full text-xs ${complete ? "bg-[#e8eee4] text-[#617859]" : "border border-line text-muted"}`}>{complete ? "✓" : <span className={i === (stage === "classifying" ? 2 : 2) ? "animate-pulse" : ""}>·</span>}</span><span className={complete ? "text-ink" : "text-muted"}>{label}</span></div>; })}</div></Card>}
    {stage === "error" && <Card className="reveal mx-auto mt-9 max-w-3xl p-7"><h2 className="font-serif text-2xl">We couldn’t route that just yet.</h2><p className="mt-2 text-sm text-muted">{error}</p><Button className="mt-5" onClick={() => routeQuestion()}>Try again</Button></Card>}
    {stage === "done" && classification && <section className="reveal mx-auto mt-10 max-w-5xl"><div className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-accent"><span>✳</span> Your question has a direction</div>
      {trajectory.length > 0 && <TrajectoryStrip matches={trajectory}/>}
      <Card className="overflow-hidden"><div className="grid lg:grid-cols-[1fr_290px]"><div className="p-6 sm:p-10">
      <p className="text-[10px] font-bold uppercase tracking-[.18em] text-muted">Your question is most relevant to</p><h2 className="mt-2 font-serif text-4xl sm:text-5xl">{classification.domain}<span className="text-accent">.</span></h2><div className="mt-4 flex flex-wrap gap-2"><Badge>{classification.context} context</Badge><Badge tone="accent">{classification.intent}</Badge>{classification.secondaryDomain && <Badge>{classification.secondaryDomain}</Badge>}</div>
      <div className="my-8 h-px bg-line"/><div className="grid gap-7 sm:grid-cols-2"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-muted">Best perspectives</p><div className="mt-3 flex flex-wrap gap-2">{classification.targetUserTypes.map(x => <Chip key={x} className="cursor-default">{x}</Chip>)}</div></div><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-muted">Relevant experience</p><div className="mt-3 flex flex-wrap gap-2">{[...classification.requiredExperiences, ...classification.tags].map(x => <Badge key={x} tone="accent">{x}</Badge>)}</div>{!classification.requiredExperiences.length && !classification.tags.length && <p className="mt-3 text-xs text-muted">Open to anyone with a perspective.</p>}</div></div>
      <div className="mt-9 rounded-2xl bg-[#f6f2ec] p-5"><div className="flex items-end justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-muted">Routing confidence</p><p className="mt-1 text-xs text-muted">How well the experience signals match</p></div><span className="font-serif text-3xl">{Math.round(classification.confidence * 100)}<small className="text-lg">%</small></span></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-accent transition-all duration-1000" style={{ width: `${Math.max(4, Math.min(100, classification.confidence * 100))}%` }}/></div></div>
    </div><aside className="border-t border-line bg-[#f8f5f0] p-6 sm:p-8 lg:border-l lg:border-t-0"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-muted">People who can help</p><h3 className="mt-2 font-serif text-2xl">Lived it. Learned from it.</h3>{matches.length ? <div className="mt-5 space-y-3">{matches.slice(0,4).map(match => <MatchCard key={match.profileId} match={match}/>)}</div> : <div className="mt-5 rounded-2xl border border-line bg-white/70 p-4"><p className="text-sm font-medium">You could be the first.</p><p className="mt-1 text-xs leading-5 text-muted">We’ll keep your question open for the right perspective to find it.</p></div>}<div className="mt-7 border-t border-line pt-5"><p className="text-xs leading-5 text-muted">Your question will appear as an anonymous conversation.</p><Button disabled={posting} onClick={postAnonymously} className="mt-4 w-full">{posting ? "Posting…" : "Post anonymously"} <span aria-hidden>↗</span></Button><Button variant="quiet" className="mt-2 w-full" onClick={() => { setStage("idle"); setClassification(null); }}>Edit question</Button></div></aside></div></Card>{error && <p className="mt-3 text-center text-sm text-accent">{error}</p>}</section>}
  </main>;
}
function MatchCard({ match }: { match: ExperienceMatch }) {
  return <div className="rounded-2xl border border-line bg-white/80 p-4"><div className="flex items-center justify-between gap-2"><span className="text-sm font-semibold">{match.anonymousId}</span><Badge>{Math.round(match.score * 100)}% fit</Badge></div>{match.matchedExperiences?.length ? <div className="mt-3 flex flex-wrap gap-1.5">{match.matchedExperiences.slice(0,3).map(e => <span key={e} className="rounded-full bg-mist px-2.5 py-1 text-[10px] text-muted">{e}</span>)}</div> : <p className="mt-2 text-xs text-muted">A useful perspective</p>}</div>;
}
function TrajectoryStrip({ matches }: { matches: TrajectoryMatch[] }) {
  const resolved = matches.length;
  return <Card className="mb-5 overflow-hidden border-accent/30 bg-[#fbf4ec] p-6 sm:p-7">
    <p className="text-[10px] font-bold uppercase tracking-[.2em] text-accent">Not just people like you — people ahead of you</p>
    <h3 className="mt-2 font-serif text-2xl sm:text-3xl">{resolved} {resolved === 1 ? "person" : "people"} stood exactly here. {resolved === 1 ? "They're" : "All of them are"} past it now.</h3>
    <div className="mt-6 grid gap-4 sm:grid-cols-2">{matches.map(m => <TrajectoryCard key={m.postId} match={m}/>)}</div>
  </Card>;
}
function TrajectoryCard({ match }: { match: TrajectoryMatch }) {
  return <div className="rounded-2xl border border-line bg-white/90 p-5">
    <div className="flex items-center justify-between gap-2 text-[11px] text-muted"><span>{match.anonymousId} · asked this {match.monthsAgo} month{match.monthsAgo === 1 ? "" : "s"} ago</span></div>
    <p className="mt-2 text-sm italic leading-6 text-muted">“{match.content}”</p>
    <div className="my-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.15em] text-accent"><span aria-hidden>↓</span> what happened</div>
    <p className="text-sm leading-6">{match.outcome}</p>
    {match.matchedExperiences.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{match.matchedExperiences.slice(0,3).map(e => <span key={e} className="rounded-full bg-mist px-2.5 py-1 text-[10px] text-muted">{e}</span>)}</div>}
  </div>;
}
