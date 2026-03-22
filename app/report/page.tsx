"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { PublicHeader } from "@/components/site/PublicHeader";

type ReportFormState = {
  name: string;
  email: string;
  category: string;
  pageUrl: string;
  message: string;
  reproSteps: string;
};

const initialForm: ReportFormState = {
  name: "",
  email: "",
  category: "Bug",
  pageUrl: "",
  message: "",
  reproSteps: "",
};

const issueCategories = ["Bug", "UI/UX", "Account", "Performance", "Feature request", "Other"];

export default function ReportPage() {
  const [form, setForm] = useState<ReportFormState>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const messageRemaining = useMemo(() => Math.max(0, 15 - form.message.trim().length), [form.message]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessId(null);

    try {
      const response = await fetch("/api/report-issue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          category: form.category,
          page_url: form.pageUrl,
          message: form.message,
          repro_steps: form.reproSteps,
        }),
      });

      const payload = (await response.json()) as { issue_id?: string; error?: string };

      if (!response.ok) {
        setError(payload.error ?? "Unable to submit issue right now.");
        return;
      }

      setSuccessId(payload.issue_id ?? "");
      setForm(initialForm);
    } catch {
      setError("Network issue while submitting. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f6f2e9] text-[#1f1b16]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-16 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[#f9c784]/35 blur-3xl" />
        <div className="absolute bottom-[-8rem] right-[-5rem] h-72 w-72 rounded-full bg-[#8ab0ab]/25 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 pb-16 pt-10 sm:px-8 lg:px-10">
        <PublicHeader />

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-3xl border border-[#1f1b16]/10 bg-white/80 p-6 shadow-[0_26px_60px_-45px_rgba(31,27,22,0.55)] backdrop-blur sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[#6a5d4f]">Support</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Report an issue</h1>
            <p className="mt-3 max-w-2xl text-sm text-[#5d5043] sm:text-base">
              Found a bug, broken flow, or confusing behavior? Send details and we will triage it quickly.
            </p>

            <form className="mt-6 space-y-4" onSubmit={onSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-[#2f2922]">
                  Name
                  <input
                    type="text"
                    value={form.name}
                    onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                    className="mt-1 w-full rounded-xl border border-[#1f1b16]/15 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#1f1b16]/35"
                    placeholder="Your name"
                  />
                </label>

                <label className="text-sm font-medium text-[#2f2922]">
                  Email
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                    className="mt-1 w-full rounded-xl border border-[#1f1b16]/15 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#1f1b16]/35"
                    placeholder="you@example.com"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-[#2f2922]">
                  Category
                  <select
                    value={form.category}
                    onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
                    className="mt-1 w-full rounded-xl border border-[#1f1b16]/15 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#1f1b16]/35"
                  >
                    {issueCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-sm font-medium text-[#2f2922]">
                  Affected page (optional)
                  <input
                    type="text"
                    value={form.pageUrl}
                    onChange={(event) => setForm((prev) => ({ ...prev, pageUrl: event.target.value }))}
                    className="mt-1 w-full rounded-xl border border-[#1f1b16]/15 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#1f1b16]/35"
                    placeholder="/wardrobe or full URL"
                  />
                </label>
              </div>

              <label className="block text-sm font-medium text-[#2f2922]">
                What happened?
                <textarea
                  value={form.message}
                  onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
                  className="mt-1 min-h-28 w-full rounded-xl border border-[#1f1b16]/15 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#1f1b16]/35"
                  placeholder="Describe the issue and expected behavior"
                  required
                />
                <span className="mt-1 block text-xs text-[#6a5d4f]">
                  {messageRemaining > 0 ? `Please add ${messageRemaining} more characters.` : "Looks good."}
                </span>
              </label>

              <label className="block text-sm font-medium text-[#2f2922]">
                Reproduction steps (optional)
                <textarea
                  value={form.reproSteps}
                  onChange={(event) => setForm((prev) => ({ ...prev, reproSteps: event.target.value }))}
                  className="mt-1 min-h-24 w-full rounded-xl border border-[#1f1b16]/15 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#1f1b16]/35"
                  placeholder="1) Go to ... 2) Click ... 3) Observe ..."
                />
              </label>

              {error ? (
                <p className="rounded-xl border border-[#b54040]/25 bg-[#fff1f1] px-3 py-2 text-sm text-[#8c2d2d]">{error}</p>
              ) : null}

              {successId ? (
                <p className="rounded-xl border border-[#2f6f5d]/25 bg-[#ecfbf5] px-3 py-2 text-sm text-[#1f5d4b]">
                  Issue submitted successfully. Reference ID: <strong>{successId}</strong>
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting || form.message.trim().length < 15}
                className="rounded-xl bg-[#1f1b16] px-5 py-3 text-sm font-semibold text-[#fff6e8] transition duration-300 hover:bg-[#2f2922] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Submitting..." : "Submit issue"}
              </button>
            </form>
          </div>

          <aside className="space-y-4">
            <section className="rounded-2xl border border-[#1f1b16]/12 bg-[#fff9ef] p-5">
              <h2 className="text-lg font-semibold tracking-tight">What helps us fix faster</h2>
              <ul className="mt-3 space-y-2 text-sm text-[#5d5043]">
                <li>- Exact page where the issue occurred</li>
                <li>- What you expected vs what happened</li>
                <li>- Browser/device details when relevant</li>
                <li>- Steps to reproduce the issue</li>
              </ul>
            </section>

            <section className="rounded-2xl border border-[#1f1b16]/12 bg-white p-5">
              <h2 className="text-lg font-semibold tracking-tight">Need immediate access links?</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href="/pricing" className="rounded-lg border border-[#1f1b16]/20 px-3 py-2 text-sm font-medium text-[#1f1b16] transition hover:bg-[#f5ece0]">
                  Pricing
                </Link>
                <Link href="/ai-features" className="rounded-lg border border-[#1f1b16]/20 px-3 py-2 text-sm font-medium text-[#1f1b16] transition hover:bg-[#f5ece0]">
                  AI features
                </Link>
                <Link href="/signup" className="rounded-lg bg-[#1f1b16] px-3 py-2 text-sm font-medium text-[#fff6e8] transition hover:bg-[#2f2922]">
                  Start free
                </Link>
              </div>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}
