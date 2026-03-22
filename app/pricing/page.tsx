import Link from "next/link";
import { PublicHeader } from "@/components/site/PublicHeader";

const plans = [
  {
    name: "Free",
    price: "$0",
    subtitle: "Get organized and test the workflow",
    features: [
      "Up to 100 wardrobe items",
      "Basic outfit suggestions",
      "Weekly planner",
      "Weather-aware recommendations",
    ],
    cta: "Get started",
    href: "/signup",
    highlighted: false,
  },
  {
    name: "Pro Monthly",
    price: "$9/mo",
    subtitle: "Best for active weekly usage",
    features: [
      "Unlimited wardrobe items",
      "Full AI outfit and shopping suggestions",
      "Advanced report and usage insights",
      "Priority AI generations",
      "Cancel anytime",
    ],
    cta: "Start Pro",
    href: "/signup",
    highlighted: true,
  },
  {
    name: "Pro Lifetime",
    price: "$129 one-time",
    subtitle: "Pay once, keep Pro forever",
    features: [
      "Everything in Pro Monthly",
      "No recurring subscription",
      "Lifetime access to core Pro features",
      "Perfect for long-term closet tracking",
    ],
    cta: "Get Lifetime",
    href: "/signup",
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f6f2e9] text-[#1f1b16]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[#f9c784]/35 blur-3xl" />
        <div className="absolute bottom-[-8rem] left-[-4rem] h-72 w-72 rounded-full bg-[#d8a48f]/25 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 pb-16 pt-12 sm:px-8 lg:px-10">
        <PublicHeader />

        <header className="mt-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6a5d4f]">Pricing</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Simple pricing that stays out of your way</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-[#5d5043] sm:text-base">
            Start free. Upgrade monthly if you use it often, or choose one-time lifetime access if you hate subscriptions.
          </p>
        </header>

        <section className="mt-10 grid gap-4 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`rounded-2xl border p-6 ${
                plan.highlighted
                  ? "border-[#1f1b16]/25 bg-[#fffdf8] shadow-[0_25px_50px_-34px_rgba(31,27,22,0.55)]"
                  : "border-[#1f1b16]/12 bg-white"
              }`}
            >
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7b6a58]">{plan.name}</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight">{plan.price}</p>
              <p className="mt-2 text-sm text-[#5d5043]">{plan.subtitle}</p>
              <ul className="mt-5 space-y-2 text-sm text-[#2f2922]">
                {plan.features.map((feature) => (
                  <li key={feature}>- {feature}</li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`mt-6 inline-flex rounded-xl px-4 py-2 text-sm font-semibold transition duration-300 ${
                  plan.highlighted
                    ? "bg-[#1f1b16] text-[#fff6e8] hover:bg-[#2f2922]"
                    : "border border-[#1f1b16]/20 bg-white text-[#1f1b16] hover:bg-[#f5ece0]"
                }`}
              >
                {plan.cta}
              </Link>
            </article>
          ))}
        </section>

        <section className="mt-10 rounded-3xl border border-[#1f1b16]/12 bg-[#fff9ef] p-6 sm:p-8">
          <h2 className="text-xl font-semibold tracking-tight">Quick pricing notes</h2>
          <ul className="mt-3 space-y-2 text-sm text-[#5d5043]">
            <li>- Free plan is great for testing the full wardrobe flow before committing.</li>
            <li>- Monthly is ideal if you rotate outfits weekly and want recurring AI recommendations.</li>
            <li>- Lifetime is a one-time payment for users who want long-term value without another subscription.</li>
          </ul>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/report" className="inline-flex rounded-xl bg-[#1f1b16] px-4 py-2 text-sm font-semibold text-[#fff6e8] transition duration-300 hover:bg-[#2f2922]">
              Report an issue
            </Link>
            <Link href="/ai-features" className="inline-flex rounded-xl border border-[#1f1b16]/20 bg-white px-4 py-2 text-sm font-semibold text-[#1f1b16] transition duration-300 hover:bg-[#f5ece0]">
              Explore AI features
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
