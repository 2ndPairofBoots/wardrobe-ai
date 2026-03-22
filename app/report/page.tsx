import Link from "next/link";

const insightCards = [
  {
    title: "Closet utilization",
    value: "68%",
    detail: "of your wardrobe was worn in the last 60 days",
  },
  {
    title: "Cost-per-wear trend",
    value: "-23%",
    detail: "average cost-per-wear dropped this quarter",
  },
  {
    title: "Outfit repeat confidence",
    value: "4.2/5",
    detail: "users rate repeated looks as intentional, not repetitive",
  },
];

const sections = [
  {
    title: "Wear frequency heatmap",
    description: "Visualize which categories are overused, underused, or ignored, so you can rebalance your closet intentionally.",
  },
  {
    title: "Gap and overlap analysis",
    description: "AI flags where your wardrobe has too many similar pieces and where your outfit-building flexibility is weak.",
  },
  {
    title: "Seasonal readiness score",
    description: "Get a proactive score for upcoming weather shifts based on what you already own and what you actually wear.",
  },
];

export default function ReportPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f6f2e9] text-[#1f1b16]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-16 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[#f9c784]/35 blur-3xl" />
        <div className="absolute bottom-[-8rem] right-[-5rem] h-72 w-72 rounded-full bg-[#8ab0ab]/25 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 pb-16 pt-10 sm:px-8 lg:px-10">
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#1f1b16]/10 bg-white/75 p-4 backdrop-blur sm:p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[#6a5d4f]">Wardrobe report</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Your style intelligence dashboard</h1>
          </div>
          <Link
            href="/signup"
            className="rounded-xl bg-[#1f1b16] px-4 py-2 text-sm font-semibold text-[#fff6e8] transition duration-300 hover:bg-[#2f2922]"
          >
            Generate my report
          </Link>
        </header>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {insightCards.map((item) => (
            <article key={item.title} className="rounded-2xl border border-[#1f1b16]/12 bg-white p-5 shadow-[0_20px_40px_-32px_rgba(31,27,22,0.5)]">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7b6a58]">{item.title}</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight">{item.value}</p>
              <p className="mt-2 text-sm text-[#5d5043]">{item.detail}</p>
            </article>
          ))}
        </section>

        <section className="mt-10 rounded-3xl border border-[#1f1b16]/12 bg-[#fff9ef] p-6 sm:p-8">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">What your report includes</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {sections.map((section) => (
              <article key={section.title} className="rounded-2xl border border-[#1f1b16]/12 bg-white p-4">
                <h3 className="text-base font-semibold">{section.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#5d5043]">{section.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-3xl border border-[#1f1b16]/15 bg-[#1f1b16] p-8 text-center text-[#fff6e8] sm:p-10">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Turn data into better style decisions</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-[#f4e7d3]/90 sm:text-base">
            WardrobeAI reports are built to help you wear more of what you own, buy less impulsively, and improve outfit confidence every week.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/pricing" className="rounded-xl bg-[#fff6e8] px-5 py-3 text-sm font-semibold text-[#1f1b16] transition duration-300 hover:bg-[#fff0d8]">
              View pricing
            </Link>
            <Link href="/ai-features" className="rounded-xl border border-[#fff6e8]/35 px-5 py-3 text-sm font-semibold text-[#fff6e8] transition duration-300 hover:bg-[#fff6e8]/10">
              Explore AI features
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
