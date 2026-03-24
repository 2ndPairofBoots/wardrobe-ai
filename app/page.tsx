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
    title: "Photo scan that tags consistently",
    description:
      "Turn closet photos into structured items with category, season, color, and occasion metadata.",
    image: "https://images.pexels.com/photos/2112651/pexels-photo-2112651.jpeg",
  },
  {
    title: "Suggestions from your real wardrobe",
    description:
      "Outfit ideas use pieces you own, with weather, occasion, and profile context.",
    image: "https://images.pexels.com/photos/4857762/pexels-photo-4857762.jpeg",
  },
  {
    title: "Weekly planning",
    description: "Plan outfits ahead to cut down on daily decision time.",
    image: "https://images.pexels.com/photos/8400600/pexels-photo-8400600.jpeg",
  },
];

const flow = [
  {
    step: "01",
    title: "Catalog items",
    description: "Upload or scan clothing once. Metadata stays searchable in your closet.",
    image: "https://images.pexels.com/photos/1148957/pexels-photo-1148957.jpeg",
  },
  {
    step: "02",
    title: "Generate outfits",
    description: "Choose an occasion and review AI-suggested combinations from your items.",
    image: "https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg",
  },
  {
    step: "03",
    title: "Schedule the week",
    description: "Assign looks to days in the planner for a clearer morning routine.",
    image: "https://images.pexels.com/photos/9393922/pexels-photo-9393922.jpeg",
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

const primaryBtn =
  "inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover";
const secondaryBtn =
  "inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-6 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground";

export default function Home() {
  const [landingWeather, setLandingWeather] = useState<LandingWeather>({
    locationLabel: "Detecting location…",
    weatherLabel: "Loading weather…",
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
          region?: string | null;
        };

        if (!response.ok || typeof json.temp_c !== "number") {
          throw new Error("Unable to load weather");
        }

        const location = json.city
          ? [json.city, json.region || json.country_code].filter(Boolean).join(", ")
          : "";
        setLandingWeather({
          locationLabel: location || "Nearby",
          weatherLabel: `${Math.round(json.temp_c)}°C · ${json.conditions ?? "—"}`,
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
        weatherLabel: "Allow location for live weather",
      });
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 300000,
    });
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <section className="grid items-start gap-12 pb-16 pt-6 lg:grid-cols-[1.05fr_0.95fr] lg:pb-20">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Wardrobe intelligence</p>
            <h1 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              Plan outfits with less guesswork.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Catalog what you own, get structured suggestions, and align looks with weather and schedule.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/signup" className={primaryBtn}>
                Create account
              </Link>
              <Link href="#how-it-works" className={secondaryBtn}>
                How it works
              </Link>
            </div>
            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-3 border-t border-border pt-8 text-sm">
              <div>
                <dt className="text-muted-foreground">Setup</dt>
                <dd className="mt-1 font-medium">Minutes</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Weather</dt>
                <dd className="mt-1 font-medium">Aware</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Suggestions</dt>
                <dd className="mt-1 font-medium">Daily</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <Image
              src="https://images.pexels.com/photos/250290/pexels-photo-250290.jpeg"
              alt="Clothing on hangers"
              width={560}
              height={240}
              className="aspect-[21/9] w-full rounded-md border border-border object-cover"
            />
            <div className="mt-4 rounded-md border border-border bg-muted/40 px-4 py-3">
              <p className="text-xs font-medium text-muted-foreground">Current conditions</p>
              <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm text-foreground">{landingWeather.locationLabel}</p>
                <p className="text-sm font-medium tabular-nums">{landingWeather.weatherLabel}</p>
              </div>
            </div>
            <ul className="mt-4 space-y-2">
              {[
                "Office: oxford shirt, tailored trousers, leather shoes",
                "Evening: knit top, dark denim, light jacket",
                "Rain: overshirt, tee, water-resistant footwear",
              ].map((item) => (
                <li
                  key={item}
                  className="rounded-md border border-border bg-background px-4 py-3 text-sm leading-snug text-foreground"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <p className="text-center text-sm font-medium text-muted-foreground">Built for everyday wardrobes</p>
          <div className="mt-4 grid grid-cols-2 gap-2 text-center text-sm sm:grid-cols-4">
            {["Outfit history", "Weather context", "Profile", "Planner"].map((label) => (
              <div key={label} className="rounded-md border border-border bg-background px-3 py-2.5 font-medium">
                {label}
              </div>
            ))}
          </div>
        </section>

        <section id="highlights" className="mt-10 grid gap-4 md:grid-cols-3">
          {highlights.map((highlight) => (
            <article
              key={highlight.title}
              className="overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-colors hover:border-foreground/15"
            >
              <Image
                src={highlight.image}
                alt=""
                width={400}
                height={180}
                className="aspect-[20/9] w-full border-b border-border object-cover"
              />
              <div className="p-5">
                <h2 className="text-base font-semibold leading-snug">{highlight.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{highlight.description}</p>
              </div>
            </article>
          ))}
        </section>

        <section id="how-it-works" className="mt-16 rounded-lg border border-border bg-card p-6 shadow-sm sm:p-8">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Workflow</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Three steps</h3>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {flow.map((item) => (
              <article key={item.step} className="overflow-hidden rounded-lg border border-border bg-background">
                <Image
                  src={item.image}
                  alt=""
                  width={400}
                  height={160}
                  className="aspect-[5/2] w-full border-b border-border object-cover"
                />
                <div className="p-4">
                  <p className="text-xs font-medium text-muted-foreground">{item.step}</p>
                  <h4 className="mt-1 text-base font-semibold">{item.title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-lg border border-border bg-primary px-6 py-10 text-center text-primary-foreground sm:px-10">
          <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">Start with your closet</h3>
          <p className="mx-auto mt-2 max-w-lg text-sm text-primary-foreground/85 sm:text-base">
            Use what you already own; improve planning without replacing your wardrobe first.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex h-10 items-center justify-center rounded-md border border-primary-foreground/25 bg-primary-foreground px-6 text-sm font-medium text-primary shadow-sm transition-colors hover:bg-primary-foreground/95"
            >
              Get started
            </Link>
            <Link
              href="/login"
              className="inline-flex h-10 items-center justify-center rounded-md border border-primary-foreground/40 px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-foreground/10"
            >
              Log in
            </Link>
          </div>
        </section>

        <footer className="mt-14 border-t border-border pt-10">
          <div className="grid gap-10 md:grid-cols-[1fr_1.2fr]">
            <div>
              <p className="text-base font-semibold">WardrobeAI</p>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                Assistant for cataloging clothes, suggesting outfits, and weekly planning.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              {footerGroups.map((group) => (
                <div key={group.title}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{group.title}</p>
                  <ul className="mt-3 space-y-2 text-sm">
                    {group.links.map((link) => (
                      <li key={link.label}>
                        <Link href={link.href} className="text-muted-foreground transition-colors hover:text-foreground">
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-10 border-t border-border py-6 text-xs text-muted-foreground">
            © {new Date().getFullYear()} WardrobeAI
          </p>
        </footer>
      </div>
    </main>
  );
}
