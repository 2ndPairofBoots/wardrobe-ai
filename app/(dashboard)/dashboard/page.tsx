import Link from "next/link";

const quickActions = [
  {
    title: "Scan a new item",
    description: "Add a fresh piece to your wardrobe with AI-powered metadata tagging.",
    href: "/wardrobe",
    cta: "Open wardrobe",
  },
  {
    title: "Build outfits",
    description: "Create and save looks from your current closet inventory.",
    href: "/outfits",
    cta: "Create outfits",
  },
  {
    title: "Plan your week",
    description: "Turn your saved looks into a practical weekly rotation.",
    href: "/planner",
    cta: "Open planner",
  },
];

const tips = [
  "Start by scanning your top 12 most-worn items first.",
  "Add occasion and season tags to improve suggestion quality.",
  "Use the planner for high-friction mornings like Mondays.",
];

export default function DashboardPage() {
  return (
    <main className="space-y-8">
      <section className="rounded-2xl border border-border bg-gradient-to-br from-[#fff9ef] to-[#fff4e2] p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">Dashboard</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text-primary">Your wardrobe command center</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-text-secondary sm:text-base">
          Pick up where you left off, keep your closet data fresh, and move from suggestions to a full week plan in one flow.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/suggestions"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-text-primary transition duration-300 hover:bg-primary-hover"
          >
            Get outfit suggestions
          </Link>
          <Link
            href="/profile"
            className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text-secondary transition duration-300 hover:bg-background hover:text-text-primary"
          >
            Update style profile
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {quickActions.map((action) => (
          <article
            key={action.title}
            className="rounded-xl border border-border bg-surface p-5 shadow-[0_16px_36px_-30px_rgba(31,27,22,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_45px_-32px_rgba(31,27,22,0.58)]"
          >
            <h2 className="text-lg font-semibold text-text-primary">{action.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">{action.description}</p>
            <Link
              href={action.href}
              className="mt-4 inline-flex rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-text-secondary transition duration-300 hover:bg-[#f5ece0] hover:text-text-primary"
            >
              {action.cta}
            </Link>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6">
        <h3 className="text-lg font-semibold text-text-primary">Pro tips for better recommendations</h3>
        <ul className="mt-4 space-y-2 text-sm text-text-secondary">
          {tips.map((tip) => (
            <li key={tip} className="rounded-lg border border-border bg-white px-3 py-2">
              {tip}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
