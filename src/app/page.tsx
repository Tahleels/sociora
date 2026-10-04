import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const steps = [
  { n: "01", title: "A real question", copy: "Ask what's on your mind, without attaching it to your name." },
  { n: "02", title: "A thoughtful route", copy: "Our AI finds the topics, context and experience your question needs." },
  { n: "03", title: "People who've been there", copy: "Your question reaches a small circle with something useful to share." },
  { n: "04", title: "A human conversation", copy: "Learn from honest perspectives, shared anonymously." },
];
export default function Home() {
  return <main className="overflow-hidden">
    <section className="relative mx-auto grid min-h-[650px] max-w-7xl items-center gap-16 px-5 py-20 lg:grid-cols-[1.1fr_.9fr] lg:px-10 lg:py-24">
      <div className="reveal relative z-10"><div className="mb-8 inline-flex items-center gap-2 rounded-full border border-line bg-white/60 px-4 py-2 text-xs font-medium text-muted"><span className="h-2 w-2 rounded-full bg-[#8a9b74]" /> A little more human, by design</div>
        <h1 className="max-w-3xl font-serif text-5xl leading-[1.08] tracking-tight sm:text-6xl lg:text-[72px]">Ask anything.<br /><em className="font-normal text-accent">Anonymously.</em></h1>
        <p className="mt-7 max-w-xl text-lg leading-8 text-muted">Get answers from people who’ve lived it. A thoughtful place to ask the questions you might not ask anywhere else.</p>
        <div className="mt-9 flex flex-wrap gap-3"><Button href="/onboarding">Find your people <span aria-hidden>↗</span></Button><Button href="/ask" variant="secondary">Ask a question</Button></div>
        <div className="mt-9 flex items-center gap-3 text-xs text-muted"><div className="flex -space-x-2">{["#d6a07d", "#809589", "#bf8675", "#c7ae77"].map(c => <span key={c} className="h-7 w-7 rounded-full border-2 border-paper" style={{ background: c }} />)}</div>Built for honest questions and generous answers</div>
      </div>
      <div className="relative mx-auto w-full max-w-[480px] reveal-delay">
        <div className="absolute -right-10 top-8 h-72 w-72 rounded-full bg-[#ead9c5]/60 blur-3xl" />
        <Card className="float relative rotate-[1.5deg] p-7 sm:p-9"><div className="flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-[.2em] text-muted">A question, finding its way</span><span className="h-2 w-2 rounded-full bg-[#8a9b74]" /></div>
          <p className="mt-8 font-serif text-2xl leading-relaxed">“I’m thinking about switching careers in my 30s. How did you know it was time?”</p>
          <div className="my-7 h-px bg-line" /><div className="flex items-center justify-between text-xs text-muted"><span>Shared anonymously</span><span>Just now</span></div>
          <div className="relative my-8 flex items-center justify-between px-1"><div className="absolute left-8 right-8 top-1/2 h-px bg-line"/><div className="relative rounded-full border border-line bg-paper px-3 py-2 text-[10px] text-muted">Question</div><div className="relative grid h-12 w-12 place-items-center rounded-full bg-ink text-lg text-white shadow-lg">✳</div><div className="relative rounded-full border border-line bg-paper px-3 py-2 text-[10px] text-muted">People</div></div>
          <div className="rounded-2xl bg-[#f5f1eb] p-4"><div className="flex items-center justify-between"><span className="text-xs font-semibold">Career changers</span><span className="text-[10px] text-muted">A good place to start</span></div><div className="mt-3 flex -space-x-2">{["#b77f69", "#879485", "#c4a57c"].map(c => <span key={c} className="h-8 w-8 rounded-full border-2 border-[#f5f1eb]" style={{ background: c }} />)}<span className="ml-3 self-center text-[11px] text-muted">People who’ve made the leap</span></div></div>
        </Card>
        <div className="absolute -bottom-7 -left-7 rounded-2xl border border-line bg-white px-4 py-3 shadow-card"><span className="font-serif text-lg">94%</span><span className="ml-2 text-[10px] text-muted">question fit</span></div>
      </div>
    </section>
    <section className="border-y border-line bg-[#f4f0e9] px-5 py-20"><div className="mx-auto max-w-7xl"><div className="mb-12 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-accent">A better kind of asking</p><h2 className="mt-3 font-serif text-4xl">A question finds its people.</h2></div><p className="max-w-sm text-sm leading-6 text-muted">Not a feed to shout into. A small, intentional loop that connects lived experience to the questions that need it.</p></div>
      <div className="grid gap-px overflow-hidden rounded-3xl border border-line bg-line md:grid-cols-4">{steps.map(s => <div key={s.n} className="bg-paper p-7"><span className="text-xs font-medium text-accent">{s.n}</span><h3 className="mt-10 font-serif text-xl">{s.title}</h3><p className="mt-3 text-sm leading-6 text-muted">{s.copy}</p></div>)}</div>
    </div></section>
    <section className="mx-auto max-w-7xl px-5 py-20 text-center"><p className="text-xs font-bold uppercase tracking-[.2em] text-accent">Your next step</p><h2 className="mx-auto mt-4 max-w-2xl font-serif text-4xl leading-tight sm:text-5xl">The right perspective can change everything.</h2><Button href="/onboarding" className="mt-8">Join the conversation <span aria-hidden>↗</span></Button></section>
  </main>;
}
