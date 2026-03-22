import Link from "next/link";

const features = [
  {
    title: "Scan your wardrobe",
    description:
      "Upload clothing photos and let AI classify each item by type, colors, pattern, and tags.",
  },
  {
    title: "Build better outfits",
    description:
      "Mix and match your existing pieces into saved looks with suggestions based on weather and style.",
  },
  {
    title: "Plan your week",
    description:
      "Assign outfits to each day and stay organized with a simple weekly planner built for real life.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-text-primary">
      <section className="mx-auto max-w-6xl px-6 pb-12 pt-20 text-center">
        <p className="inline-flex rounded-full border border-border bg-surface px-4 py-1 text-sm text-text-secondary">
          Smart wardrobe planning
        </p>
        <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">
          WardrobeAI helps you organize outfits and dress better every day.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base text-text-secondary sm:text-lg">
          Scan what you already own, generate outfit ideas with AI, and plan your week in minutes.
        </p>
        <div className="mt-8">
          <Link
            href="/signup"
            className="inline-flex rounded-lg bg-primary px-6 py-3 font-medium text-text-primary transition-colors hover:bg-primary-hover"
          >
            Create your account
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-6 pb-20 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <article key={feature.title} className="rounded-xl border border-border bg-surface p-6">
            <h2 className="text-lg font-semibold">{feature.title}</h2>
            <p className="mt-2 text-sm text-text-secondary">{feature.description}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
