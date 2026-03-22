import Link from "next/link";

export default function AboutPage() {
  const values = [
    {
      icon: "🎯",
      title: "Intelligent",
      description: "AI-powered analysis that understands your style and body as unique",
    },
    {
      icon: "⚡",
      title: "Fast",
      description: "Get outfit suggestions and insights in seconds, not hours",
    },
    {
      icon: "🎨",
      title: "Personal",
      description: "Adapts to your preferences, not generic recommendations",
    },
    {
      icon: "🔒",
      title: "Private",
      description: "Your data stays yours—we never sell or train on your wardrobe",
    },
  ];

  const features = [
    {
      title: "Visual Wardrobe Analysis",
      description: "Upload photos of your clothing. Our AI scans and catalogs items instantly.",
    },
    {
      title: "Outfit Generation",
      description: "Get curated outfit suggestions based on weather, occasion, and your style.",
    },
    {
      title: "Body-Aware Recommendations",
      description: "Personalized fit and style advice that considers your unique proportions.",
    },
    {
      title: "Smart Shopping",
      description: "Discover pieces that actually complement your existing wardrobe.",
    },
    {
      title: "Weekly Planning",
      description: "Plan your week ahead with weather-integrated outfit suggestions.",
    },
    {
      title: "Style Insights",
      description: "Understand your fashion patterns and optimize your closet.",
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f6f2e9] text-[#1f1b16]">
      {/* Background gradients */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 right-1/4 h-96 w-96 rounded-full bg-[#f9c784]/30 blur-3xl" />
        <div className="absolute top-1/3 -left-32 h-80 w-80 rounded-full bg-[#d8a48f]/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-[#f9c784]/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-16 sm:px-8 lg:px-10">
        {/* Hero Section */}
        <section className="mb-24 pt-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6a5d4f]">About WardrobeAI</p>
          <h1 className="mt-4 text-5xl font-bold tracking-tight sm:text-6xl">
            AI that understands <span className="text-[#d8a48f]">your style</span>
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg text-[#5d5043] sm:text-xl">
            We&apos;re building the intelligence layer for personal fashion. No more decision fatigue, no more wasted closet space—just smart, personalized style recommendations powered by advanced AI.
          </p>
        </section>

        {/* Problem / Vision Section */}
        <section className="mb-24 grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">The Problem</h2>
            <p className="mt-4 text-[#5d5043]">
              The average person spends 30+ minutes every morning deciding what to wear. Yet 80% of our wardrobes go unworn. We buy clothes impulsively, forget what we own, and struggle to mix and match effectively.
            </p>
            <p className="mt-3 text-[#5d5043]">
              Traditional fashion advice is generic and impersonal. Style guides don&apos;t account for your body, budget, or lifestyle. Fashion apps are cluttered. Nothing integrates intelligence with practicality.
            </p>
          </div>
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">Our Vision</h2>
            <p className="mt-4 text-[#5d5043]">
              Wardrobes shouldn&apos;t be complicated. We&apos;re using computer vision and machine learning to create a personal style AI that knows your closet better than you do.
            </p>
            <p className="mt-3 text-[#5d5043]">
              WardrobeAI is the missing layer between your wardrobe and decision-making. It lets you focus on living your life, not coordinating outfits.
            </p>
          </div>
        </section>

        {/* Core Values */}
        <section className="mb-24">
          <h2 className="text-center text-3xl font-semibold tracking-tight">Our Core Principles</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <div key={value.title} className="rounded-2xl border border-[#1f1b16]/12 bg-white p-6">
                <div className="text-4xl">{value.icon}</div>
                <h3 className="mt-4 font-semibold text-[#1f1b16]">{value.title}</h3>
                <p className="mt-2 text-sm text-[#5d5043]">{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features Grid */}
        <section className="mb-24">
          <h2 className="text-center text-3xl font-semibold tracking-tight">What We Build</h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-xl border border-[#1f1b16]/12 bg-white/50 p-6 backdrop-blur-sm">
                <h3 className="font-semibold text-[#1f1b16]">{feature.title}</h3>
                <p className="mt-2 text-sm text-[#5d5043]">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tech Stack / Approach */}
        <section className="mb-24 rounded-3xl border border-[#1f1b16]/12 bg-white p-8 sm:p-12">
          <h2 className="text-3xl font-semibold tracking-tight">How It Works</h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-3">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#f9c784]/30">
                <span className="text-xl font-bold text-[#d8a48f]">1</span>
              </div>
              <h3 className="mt-4 font-semibold">Upload &amp; Scan</h3>
              <p className="mt-2 text-sm text-[#5d5043]">Take photos of your wardrobe. Our vision AI catalogs each item automatically.</p>
            </div>
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#f9c784]/30">
                <span className="text-xl font-bold text-[#d8a48f]">2</span>
              </div>
              <h3 className="mt-4 font-semibold">Learn Your Style</h3>
              <p className="mt-2 text-sm text-[#5d5043]">Our AI learns your preferences, body type, and lifestyle patterns.</p>
            </div>
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#f9c784]/30">
                <span className="text-xl font-bold text-[#d8a48f]">3</span>
              </div>
              <h3 className="mt-4 font-semibold">Get Smart Suggestions</h3>
              <p className="mt-2 text-sm text-[#5d5043]">Receive personalized outfits, shopping tips, and style insights daily.</p>
            </div>
          </div>
        </section>

        {/* Why Us */}
        <section className="mb-24">
          <h2 className="text-center text-3xl font-semibold tracking-tight">Why WardrobeAI</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            <div className="rounded-xl bg-[#fff9ef] p-6">
              <h3 className="font-semibold text-[#1f1b16]">Faster Than Thinking</h3>
              <p className="mt-2 text-sm text-[#5d5043]">Get outfit suggestions in seconds. No scrolling, no overthinking.</p>
            </div>
            <div className="rounded-xl bg-[#fff9ef] p-6">
              <h3 className="font-semibold text-[#1f1b16]">More Accurate Than Friends</h3>
              <p className="mt-2 text-sm text-[#5d5043]">AI trained on thousands of successful outfits knows what works for you.</p>
            </div>
            <div className="rounded-xl bg-[#fff9ef] p-6">
              <h3 className="font-semibold text-[#1f1b16]">Cheaper Than a Stylist</h3>
              <p className="mt-2 text-sm text-[#5d5043]">Professional styling at a fraction of the cost. One-time payment, forever access.</p>
            </div>
            <div className="rounded-xl bg-[#fff9ef] p-6">
              <h3 className="font-semibold text-[#1f1b16]">Actually Respects Your Privacy</h3>
              <p className="mt-2 text-sm text-[#5d5043]">Your wardrobe is personal. We never sell your data or train on your photos.</p>
            </div>
          </div>
        </section>

        {/* Team / Mission Section */}
        <section className="mb-16 rounded-3xl border border-[#1f1b16]/12 bg-white p-8 sm:p-12">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight">Our Mission</h2>
            <p className="mt-6 text-lg text-[#5d5043]">
              We&apos;re obsessed with the intersection of fashion, AI, and everyday decision-making. WardrobeAI was founded by developers who were tired of the same 5 outfits on rotation, despite having well-stocked closets.
            </p>
            <p className="mt-4 text-lg text-[#5d5043]">
              We&apos;re building the infrastructure for intelligent personal fashion. In a world of information overload, we believe everyone deserves an AI that truly understands their style.
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mb-8 rounded-3xl border border-[#1f1b16]/20 bg-gradient-to-br from-[#1f1b16] via-[#2f2922] to-[#1f1b16] p-8 text-center sm:p-12">
          <h2 className="text-3xl font-bold tracking-tight text-[#fff6e8] sm:text-4xl">
            Ready to transform your wardrobe?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-[#e8d9c9] sm:text-lg">
            Start with our free plan. No credit card required.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex rounded-xl bg-[#f9c784] px-6 py-3 text-sm font-semibold text-[#1f1b16] transition duration-300 hover:bg-[#f5b45f]"
            >
              Get Started Free
            </Link>
            <Link
              href="/pricing"
              className="inline-flex rounded-xl border border-[#f9c784]/30 bg-transparent px-6 py-3 text-sm font-semibold text-[#fff6e8] transition duration-300 hover:bg-white/10"
            >
              View Pricing
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
