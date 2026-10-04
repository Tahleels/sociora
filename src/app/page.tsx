import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const flow = [
  { n: "01", title: "Question", detail: "Ask honestly, without a public name." },
  { n: "02", title: "AI router", detail: "Your topic and context find a route." },
  { n: "03", title: "Relevant people", detail: "Lived experience shapes the match." },
  { n: "04", title: "Anonymous discussion", detail: "A useful conversation can begin." },
];

export default function Home() {
  return <main className="overflow-hidden">
    <section className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-14 sm:py-20 lg:min-h-[590px] lg:grid-cols-[1.05fr_.95fr] lg:gap-16 lg:px-10 lg:py-20">
      <div className="reveal relative z-10">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-white/60 px-4 py-2 text-xs font-medium text-muted"><span className="h-2 w-2 rounded-full bg-[#8a9b74]" /> Built around lived experience</div>
        <h1 className="max-w-3xl font-serif text-5xl leading-[1.08] tracking-tight sm:text-6xl lg:text-[68px]">Ask anything.<br /><em className="font-normal text-accent">Anonymously.</em></h1>
        <p className="mt-6 max-w-xl text-base leading-7 text-muted sm:text-lg sm:leading-8">Get thoughtful answers from people who’ve lived it. Sociora routes your question to the perspectives that can help.</p>
        <div className="mt-8 flex flex-wrap gap-3"><Button href="/onboarding">Join anonymously <span aria-hidden>↗</span></Button><Button href="/ask" variant="secondary">Ask a question</Button></div>
        <p className="mt-5 text-xs text-muted">No public profile. Your experience is what matters.</p>
      </div>
      <div className="relative mx-auto w-full max-w-[480px] reveal-delay">
        <div className="absolute -right-8 top-8 h-64 w-64 rounded-full bg-[#ead9c5]/60 blur-3xl" />
        <Card className="relative p-5 sm:p-8">
          <div className="flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-[.18em] text-muted">A question finding its way</span><span className="h-2 w-2 rounded-full bg-[#8a9b74]" /></div>
          <p className="mt-6 font-serif text-xl leading-relaxed sm:text-2xl">“I’m thinking about switching careers in my 30s. How did you know it was time?”</p>
          <div className="my-5 h-px bg-line" />
          <div className="flex items-start gap-3 rounded-2xl bg-[#f5f1eb] p-4"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-sm text-white">✳</div><div className="min-w-0"><div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1"><span className="text-xs font-semibold">Matched perspectives</span><span className="text-[10px] text-muted">Career · Career switching</span></div><div className="mt-3 flex items-center gap-2"><div className="flex -space-x-2">{["#b77f69", "#879485", "#c4a57c"].map(c => <span key={c} className="h-7 w-7 rounded-full border-2 border-[#f5f1eb]" style={{ background: c }} />)}</div><span className="text-[11px] text-muted">People who’ve made the leap</span></div></div></div>
          <div className="mt-4 flex items-center justify-between text-xs text-muted"><span>Shared anonymously</span><span>Experience first</span></div>
        </Card>
      </div>
    </section>

    <section aria-labelledby="flow-title" className="border-y border-line bg-[#f4f0e9] px-5 py-10 sm:py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-2"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-accent">The Sociora loop</p><h2 id="flow-title" className="mt-2 font-serif text-2xl sm:text-3xl">From question to understanding.</h2></div><span className="hidden text-xs text-muted md:block">A clear path to a human answer</span></div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{flow.map((item, i) => <div key={item.n} className="relative flex min-h-[112px] items-start gap-3 rounded-2xl border border-line bg-paper p-4 sm:min-h-[124px] sm:p-5"><span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#eee5db] font-serif text-xs text-accent">{item.n}</span><div className="min-w-0"><h3 className="font-semibold capitalize">{item.title}</h3><p className="mt-1 text-xs leading-5 text-muted">{item.detail}</p></div>{i < flow.length - 1 && <span aria-hidden className="absolute -right-2 top-1/2 z-10 hidden -translate-y-1/2 text-sm text-accent lg:block">→</span>}</div>)}</div>
      </div>
    </section>
  </main>;
}
