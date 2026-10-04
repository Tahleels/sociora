"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { USER_TYPES, DOMAINS, EXPERIENCES, type UserType, type Domain, type Experience, type UserProfile } from "@/types";
import { saveProfile } from "@/lib/session";

const questions = [
  { eyebrow: "First, a little about you", title: "Which perspective do you bring?", note: "This helps us connect questions to lived experience.", options: USER_TYPES },
  { eyebrow: "Your world", title: "What topics feel familiar?", note: "Choose all the areas where you have something to share.", options: DOMAINS },
  { eyebrow: "Things you’ve lived", title: "What experience could you offer?", note: "No expertise required. Real life counts.", options: EXPERIENCES },
];
export default function OnboardingPage() {
  const [step, setStep] = useState(0), [userType, setUserType] = useState<UserType | "">(""), [domains, setDomains] = useState<Domain[]>([]), [experiences, setExperiences] = useState<Experience[]>([]), [helpText, setHelpText] = useState(""), [helpTopics, setHelpTopics] = useState<string[]>([]);
  const [busy, setBusy] = useState(false), [error, setError] = useState(""), [profile, setProfile] = useState<UserProfile | null>(null), [pendingQuestion, setPendingQuestion] = useState("");
  useEffect(() => { try { const q = sessionStorage.getItem("sociora_pending_question"); if (q) { setPendingQuestion(q); setHelpText(q); } } catch {} }, []);
  function toggle<T extends string>(items: T[], value: T, setter: (x: T[]) => void) { setter(items.includes(value) ? items.filter(i => i !== value) : [...items, value]); }
  const valid = step === 0 ? !!userType : step === 1 ? domains.length > 0 : step === 2 ? experiences.length > 0 : true;
  async function finish(helpOverride?: string) {
    if (!userType) return;
    setBusy(true); setError("");
    const finalHelp = helpOverride === undefined ? helpText : helpOverride;
    const topics = [...helpTopics, ...(finalHelp.trim() ? [finalHelp.trim()] : [])];
    try {
      const response = await fetch("/api/profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userType, domains, experiences, helpTopics: topics }) });
      if (!response.ok) throw new Error("We couldn’t save your profile just now.");
      const p = await response.json() as UserProfile; saveProfile(p); setProfile(p);
    } catch {
      const local: UserProfile = { id: `local-${Date.now()}`, anonymousId: `Anonymous Scholar #${Math.floor(1000 + Math.random() * 9000)}`, userType, domains, experiences, helpTopics: topics, createdAt: new Date().toISOString() };
      saveProfile(local); setProfile(local);
      setError("We couldn’t reach the profile service, so we saved your anonymous profile on this device.");
    } finally { setBusy(false); }
  }
  if (profile) return <main className="mx-auto max-w-3xl px-5 py-16 sm:py-24"><Card className="reveal overflow-hidden p-8 text-center sm:p-14"><div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#e8eee4] text-2xl text-[#617859]">✳</div><p className="mt-7 text-xs font-bold uppercase tracking-[.2em] text-accent">You’re in good company</p><h1 className="mt-4 font-serif text-4xl sm:text-5xl">You are <span className="text-accent">{profile.anonymousId}</span></h1><p className="mx-auto mt-5 max-w-lg leading-7 text-muted">Your identity stays yours. Your experience is what makes the conversation richer.</p>{error && <p className="mt-5 text-sm text-muted">{error}</p>}<div className="mt-9"><Button href={pendingQuestion ? `/ask?q=${encodeURIComponent(pendingQuestion)}` : "/ask"} onClick={() => { try { sessionStorage.removeItem("sociora_pending_question"); } catch {} }}>Ask your first question <span aria-hidden>↗</span></Button></div></Card></main>;
  if (step < 3) {
    const q = questions[step];
    return <main className="mx-auto max-w-3xl px-5 py-12 sm:py-20"><div className="mb-10 flex items-center justify-between text-xs text-muted"><span>GETTING TO KNOW YOU</span><span>0{step + 1} <span className="text-muted/60">/ 04</span></span></div><div className="mb-12 flex gap-2">{[0,1,2,3].map(i => <span key={i} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-accent" : "bg-line"}`} />)}</div><Card className="reveal p-7 sm:p-12"><p className="text-xs font-bold uppercase tracking-[.18em] text-accent">{q.eyebrow}</p><h1 className="mt-3 font-serif text-3xl sm:text-4xl">{q.title}</h1><p className="mt-3 text-sm text-muted">{q.note}</p><div className="mt-8 flex flex-wrap gap-2.5">{q.options.map(option => { const selected = step === 0 ? userType === option : step === 1 ? domains.includes(option as Domain) : experiences.includes(option as Experience); return <Chip key={option} selected={selected} onClick={() => step === 0 ? setUserType(option as UserType) : step === 1 ? toggle(domains, option as Domain, setDomains) : toggle(experiences, option as Experience, setExperiences)}>{option}</Chip>; })}</div><div className="mt-12 flex justify-between"><Button variant="quiet" disabled={step === 0} onClick={() => setStep(step - 1)}>← Back</Button><Button disabled={!valid} onClick={() => setStep(step + 1)}>Continue <span aria-hidden>→</span></Button></div></Card></main>;
  }
  return <main className="mx-auto max-w-3xl px-5 py-12 sm:py-20"><div className="mb-10 flex items-center justify-between text-xs text-muted"><span>ONE LAST THING</span><span>04 <span className="text-muted/60">/ 04</span></span></div><div className="mb-12 flex gap-2">{[0,1,2,3].map(i => <span key={i} className="h-1 flex-1 rounded-full bg-accent" />)}</div><Card className="reveal p-7 sm:p-12"><p className="text-xs font-bold uppercase tracking-[.18em] text-accent">Make space for what matters</p><h1 className="mt-3 font-serif text-3xl sm:text-4xl">What would you like help with?</h1><p className="mt-3 text-sm text-muted">Optional. Share a topic and we’ll help you find the right people.</p><textarea value={helpText} onChange={e => setHelpText(e.target.value)} maxLength={500} placeholder="I’d love to hear from people who…" className="mt-7 min-h-32 w-full resize-y rounded-2xl border border-line bg-white/70 p-4 text-sm leading-6 outline-none transition focus:border-accent"/><div className="mt-5 flex flex-wrap gap-2">{["A career change", "Finding balance", "Starting something new", "Building confidence"].map(t => <Chip key={t} selected={helpTopics.includes(t)} onClick={() => toggle(helpTopics, t, setHelpTopics)}>{t}</Chip>)}</div>{error && <p className="mt-4 text-sm text-accent">{error}</p>}<div className="mt-12 flex justify-between"><Button variant="quiet" onClick={() => setStep(2)}>← Back</Button><Button disabled={busy} onClick={() => finish()}>{busy ? "Saving…" : "Finish your profile"} <span aria-hidden>→</span></Button></div></Card><button onClick={() => finish("")} className="mx-auto mt-5 block text-xs text-muted underline decoration-line underline-offset-4 hover:text-ink" disabled={busy}>Skip this question</button></main>;
}
