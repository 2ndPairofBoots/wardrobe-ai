"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

type LandingWeather = {
  locationLabel: string;
  weatherLabel: string;
};

const highlights = [
  {
    title: "Photo scan that actually tags correctly",
    description: "Turn closet photos into structured items with category, season, color, and occasion tags.",
    image: "https://images.pexels.com/photos/2769274/pexels-photo-2769274.jpeg",
  },
  {
    title: "Suggestions grounded in your real wardrobe",
    description: "Get outfit ideas from the pieces you own, filtered by weather, occasion, and style profile.",
    image: "https://images.pexels.com/photos/3621436/pexels-photo-3621436.jpeg",
  },
  {
    title: "Weekly planning with less decision fatigue",
    description: "Build your week once and avoid the daily what should I wear loop every morning.",
    image: "https://images.pexels.com/photos/6379122/pexels-photo-6379122.jpeg",
  },
];

const flow = [
  {
    step: "01",
    title: "Build your closet map",
    description: "Upload clothing once. WardrobeAI extracts clean metadata so your closet is searchable.",
    image: "https://images.pexels.com/photos/3912994/pexels-photo-3912994.jpeg",
  },
  {
    step: "02",
    title: "Generate outfit options",
    description: "Pick an occasion and let the AI compose complete looks from your actual items.",
    image: "https://images.pexels.com/photos/2774902/pexels-photo-2774902.jpeg",
  },
  {
    step: "03",
    title: "Lock your week in minutes",
    description: "Drag suggestions into your planner so weekday mornings become autopilot.",
    image: "https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg",
  },
];

const footerGroups = [
  {
    title: "Product",
    links: [
      { href: "#highlights", label: "Highlights" },
      { href: "#how-it-works", label: "How it works" },
      { href: "/ai-features", label: "AI features" },
      { href: "/report", label: "Report issue" },
      { href: "/pricing", label: "Pricing" },
      { href: "/signup", label: "Get started" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/login", label: "Log in" },
      { href: "/signup", label: "Create account" },
      { href: "/profile", label: "Profile" },
    ],
  },
  {
    title: "Workflow",
    links: [
      { href: "/wardrobe", label: "Wardrobe" },
      { href: "/outfits", label: "Outfits" },
      { href: "/planner", label: "Planner" },
    ],
  },
];

export default function Home() {
  const [landingWeather, setLandingWeather] = useState<LandingWeather>({
    locationLabel: "Using your location...",
    weatherLabel: "Fetching weather...",
  });

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLandingWeather({
        locationLabel: "Location unavailable",
        weatherLabel: "Weather unavailable",
      });
      return;
    }

    const onSuccess = async (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;

      try {
        const response = await fetch(`/api/weather/current?lat=${latitude}&lng=${longitude}`);
        const json = (await response.json()) as {
          temp_c?: number;
          conditions?: string;
          city?: string | null;
          country_code?: string | null;
        };

        if (!response.ok || typeof json.temp_c !== "number") {
          throw new Error("Unable to load weather");
        }

        const location = [json.city, json.country_code].filter(Boolean).join(", ");
        setLandingWeather({
          locationLabel: location || "Nearby",
          weatherLabel: `${Math.round(json.temp_c)} C, ${json.conditions ?? "Unknown"}`,
        });
      } catch {
        setLandingWeather({
          locationLabel: "Nearby",
          weatherLabel: "Weather unavailable",
        });
      }
    };

    const onError = () => {
      setLandingWeather({
        locationLabel: "Location unavailable",
        weatherLabel: "Enable location for live weather",
      });
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 300000,
    });
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f6f2e9] text-[#1f1b16]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[#f9c784]/40 blur-3xl" />
        <div className="absolute right-[-8rem] top-44 h-72 w-72 rounded-full bg-[#8ab0ab]/30 blur-3xl" />
        <div className="absolute bottom-[-8rem] left-[-6rem] h-72 w-72 rounded-full bg-[#d8a48f]/30 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-8 sm:px-8 lg:px-10">
        <section className="grid items-center gap-10 pb-16 pt-14 lg:grid-cols-[1.1fr_0.9fr] lg:pb-24">
          <div className="motion-safe:animate-fade-up">
            <p className="inline-flex rounded-full border border-[#1f1b16]/15 bg-[#fff9ef] px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#564a3e]">
              AI wardrobe operating system
            </p>
            <h1 className="mt-5 max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Dress with intent, not guesswork.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-[#4f463d] sm:text-lg">
              WardrobeAI turns your closet into a decision engine. Scan pieces once, get smarter outfit
              suggestions daily, and plan your week with confidence.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/signup"
                className="rounded-xl bg-[#1f1b16] px-6 py-3 text-sm font-semibold text-[#fff6e8] shadow-[0_10px_30px_-16px_rgba(31,27,22,0.6)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#2f2922]"
              >
                Create your account
              </Link>
              <Link
                href="#how-it-works"
                className="rounded-xl border border-[#1f1b16]/20 bg-white/70 px-6 py-3 text-sm font-semibold text-[#2d2721] transition duration-300 hover:-translate-y-0.5 hover:bg-white"
              >
                See how it works
              </Link>
            </div>
            <div className="mt-8 grid max-w-lg grid-cols-3 gap-3 text-center text-xs sm:text-sm">
              {["3 min setup", "Weather aware", "Daily suggestions"].map((stat) => (
                <div key={stat} className="rounded-xl border border-[#1f1b16]/10 bg-white/70 p-3 font-medium text-[#4f463d]">
                  {stat}
                </div>
              ))}
            </div>
          </div>

          <div className="motion-safe:animate-fade-up rounded-2xl border border-[#1f1b16]/15 bg-[#fff9ef] p-5 shadow-[0_25px_60px_-35px_rgba(31,27,22,0.35)] [animation-delay:120ms]">
            <Image
              src="https://images.pexels.com/photos/2769274/pexels-photo-2769274.jpeg"
              alt="Individual clothing items and wardrobe pieces"
              width={500}
              height={220}
              className="w-full rounded-xl border border-[#1f1b16]/10 object-cover"
            />
            <div className="rounded-xl border border-[#1f1b16]/10 bg-white p-4 mt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5d5043]">Today</p>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-sm text-[#4f463d]">{landingWeather.locationLabel}</p>
                <p className="text-sm font-semibold">{landingWeather.weatherLabel}</p>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {[
                "Relaxed office: ivory oxford + charcoal trousers + tan loafers",
                "Evening plans: black knit + straight denim + suede jacket",
                "Rain-safe option: utility overshirt + tee + water-resistant sneakers",
              ].map((item, index) => (
                <article
                  key={item}
                  className="motion-safe:animate-fade-up rounded-xl border border-[#1f1b16]/10 bg-white p-4"
                  style={{ animationDelay: `${220 + index * 100}ms` }}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5d5043]">Option {index + 1}</p>
                  <p className="mt-1 text-sm leading-relaxed text-[#2f2922]">{item}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-[#1f1b16]/10 bg-white/65 p-5 backdrop-blur">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.14em] text-[#6a5d4f] sm:text-sm">
            Built for everyday wardrobes, not runway closets
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-center text-xs text-[#4f463d] sm:grid-cols-4 sm:text-sm">
            <div className="rounded-lg border border-[#1f1b16]/10 bg-[#fffdf8] px-3 py-2 font-medium">Outfit memory</div>
            <div className="rounded-lg border border-[#1f1b16]/10 bg-[#fffdf8] px-3 py-2 font-medium">Weather context</div>
            <div className="rounded-lg border border-[#1f1b16]/10 bg-[#fffdf8] px-3 py-2 font-medium">Body proportions</div>
            <div className="rounded-lg border border-[#1f1b16]/10 bg-[#fffdf8] px-3 py-2 font-medium">Planner sync</div>
          </div>
        </section>

        <section id="highlights" className="mt-6 grid gap-4 md:grid-cols-3">
          {highlights.map((highlight, index) => (
            <article
              key={highlight.title}
              className="motion-safe:animate-fade-up group rounded-2xl border border-[#1f1b16]/15 bg-white/80 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-[#1f1b16]/25 hover:shadow-[0_18px_40px_-28px_rgba(31,27,22,0.55)] overflow-hidden"
              style={{ animationDelay: `${300 + index * 120}ms` }}
            >
              <Image
                src={highlight.image}
                alt={highlight.title}
                width={400}
                height={180}
                className="w-full border-b border-[#1f1b16]/10 object-cover"
              />
              <div className="p-6">
              <h2 className="text-lg font-semibold tracking-tight transition duration-300 group-hover:text-[#2f2922]">{highlight.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-[#4f463d]">{highlight.description}</p>
              </div>
            </article>
          ))}
        </section>

        <section id="how-it-works" className="mt-16 rounded-3xl border border-[#1f1b16]/10 bg-[#fffdf8] p-6 sm:p-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5d5043]">How it works</p>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">A simple loop you can actually stick with</h3>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {flow.map((item, index) => (
              <article
                key={item.step}
                className="motion-safe:animate-fade-up rounded-2xl border border-[#1f1b16]/10 bg-white overflow-hidden"
                style={{ animationDelay: `${450 + index * 110}ms` }}
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  width={400}
                  height={160}
                  className="w-full border-b border-[#1f1b16]/10 object-cover"
                />
                <div className="p-5">
                <p className="text-xs font-semibold tracking-[0.12em] text-[#7b6a58]">{item.step}</p>
                <h4 className="mt-2 text-lg font-semibold">{item.title}</h4>
                <p className="mt-2 text-sm leading-relaxed text-[#4f463d]">{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-3xl border border-[#1f1b16]/15 bg-[#1f1b16] p-8 text-center text-[#fff6e8] sm:p-10">
          <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">Ready to make getting dressed effortless?</h3>
          <p className="mx-auto mt-3 max-w-xl text-sm text-[#f4e7d3]/85 sm:text-base">
            Start with what you already own and get a clearer, smarter way to plan outfits every week.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/signup"
              className="rounded-xl bg-[#fff6e8] px-6 py-3 text-sm font-semibold text-[#1f1b16] transition duration-300 hover:-translate-y-0.5 hover:bg-[#fff1dc]"
            >
              Get started free
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-[#fff6e8]/35 px-6 py-3 text-sm font-semibold text-[#fff6e8] transition duration-300 hover:bg-[#fff6e8]/10"
            >
              I already have an account
            </Link>
          </div>
        </section>

        <footer className="mt-14 border-t border-[#1f1b16]/12 pt-8">
          <div className="grid gap-8 md:grid-cols-[1.1fr_1fr]">
            <div>
              <p className="text-lg font-semibold tracking-tight">WardrobeAI</p>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-[#5d5043]">
                A practical AI wardrobe assistant built to reduce decision fatigue and help you wear what you own better.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
              {footerGroups.map((group) => (
                <div key={group.title}>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7b6a58]">{group.title}</p>
                  <ul className="mt-3 space-y-2 text-sm text-[#4f463d]">
                    {group.links.map((link) => (
                      <li key={link.label}>
                        <Link href={link.href} className="transition duration-300 hover:text-[#1f1b16]">
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-8 border-t border-[#1f1b16]/10 py-4 text-xs text-[#7b6a58]">
            © {new Date().getFullYear()} WardrobeAI. Designed for real closets.
          </p>
        </footer>
      </div>
    </main>
  );
}
