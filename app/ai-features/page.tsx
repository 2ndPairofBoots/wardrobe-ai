import Link from "next/link";

const featureBlocks = [
  {
    title: "AI Closet Structuring",
    description:
      "Transforms raw clothing photos into organized inventory with category, color, season, and occasion metadata.",
    status: "Live",
  },
  {
    title: "Contextual Outfit Composer",
    description:
      "Builds complete outfit combinations from your existing closet using weather, occasion, and style profile context.",
    status: "Live",
  },
  {
    title: "Wardrobe Gap Intelligence",
    description:
      "Detects closet overlaps and missing anchor pieces so shopping recommendations are targeted, not random.",
    status: "Live",
  },
  {
    title: "Style Report Generator",
    description:
      "Creates usage and cost-per-wear analysis so you can improve rotation quality and spending decisions.",
    status: "Rolling out",
  },
  {
    title: "Adaptive Fit Logic",
    description:
      "Uses your manual body proportions to tune outfit confidence and reduce fit mismatch recommendations.",
    status: "Rolling out",
  },
  {
    title: "Seasonal Capsule Copilot",
    description:
      "Generates capsule wardrobe suggestions by season while preserving your personal style preferences.",
    status: "Planned",
  },
];

export default function AIFeaturesPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f6f2e9] text-[#1f1b16]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[#8ab0ab]/25 blur-3xl" />
        <div className="absolute bottom-[-8rem] right-[-5rem] h-72 w-72 rounded-full bg-[#f9c784]/30 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 pb-16 pt-12 sm:px-8 lg:px-10">
        <header className="rounded-2xl border border-[#1f1b16]/10 bg-white/75 p-6 backdrop-blur sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6a5d4f]">AI Features</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Built for practical wardrobe intelligence</h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#5d5043] sm:text-base">
            These are the capabilities powering WardrobeAI today and what we are shipping next to make personal style systems smarter, faster, and less stressful.
          </p>
        </header>

        <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {featureBlocks.map((feature) => (
            <article key={feature.title} className="rounded-2xl border border-[#1f1b16]/12 bg-white p-5 shadow-[0_16px_36px_-32px_rgba(31,27,22,0.5)]">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7b6a58]">{feature.status}</p>
              <h2 className="mt-2 text-lg font-semibold tracking-tight">{feature.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#5d5043]">{feature.description}</p>
            </article>
          ))}
        </section>

        <section className="mt-10 rounded-3xl border border-[#1f1b16]/15 bg-[#1f1b16] p-8 text-center text-[#fff6e8] sm:p-10">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Want access to advanced AI modules?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-[#f4e7d3]/90 sm:text-base">
            Join Pro to unlock deeper insights and higher-capacity generation workflows designed for serious wardrobe optimization.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/pricing" className="rounded-xl bg-[#fff6e8] px-5 py-3 text-sm font-semibold text-[#1f1b16] transition duration-300 hover:bg-[#fff0d8]">
              Compare plans
            </Link>
            <Link href="/signup" className="rounded-xl border border-[#fff6e8]/35 px-5 py-3 text-sm font-semibold text-[#fff6e8] transition duration-300 hover:bg-[#fff6e8]/10">
              Start free
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
