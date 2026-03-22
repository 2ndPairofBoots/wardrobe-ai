"use client";

import Link from "next/link";

type PublicHeaderProps = {
  showLandingAnchors?: boolean;
};

export function PublicHeader({ showLandingAnchors = false }: PublicHeaderProps) {
  return (
    <div className="sticky top-4 z-20 space-y-2">
      <header className="flex items-center justify-between rounded-full border border-[#1f1b16]/10 bg-white/80 px-4 py-2 backdrop-blur sm:px-6">
        <Link href="/" className="font-semibold tracking-tight text-[#1f1b16]">
          WardrobeAI
        </Link>

        <nav className="hidden items-center gap-1 text-sm md:flex">
          {showLandingAnchors ? (
            <>
              <Link
                href="/#highlights"
                className="rounded-full px-4 py-2 text-[#3b342d] transition duration-300 hover:bg-white hover:text-[#1f1b16]"
              >
                Highlights
              </Link>
              <Link
                href="/#how-it-works"
                className="rounded-full px-4 py-2 text-[#3b342d] transition duration-300 hover:bg-white hover:text-[#1f1b16]"
              >
                How it works
              </Link>
            </>
          ) : null}

          <Link
            href="/pricing"
            className="rounded-full px-4 py-2 text-[#3b342d] transition duration-300 hover:bg-white hover:text-[#1f1b16]"
          >
            Pricing
          </Link>
          <Link
            href="/ai-features"
            className="rounded-full px-4 py-2 text-[#3b342d] transition duration-300 hover:bg-white hover:text-[#1f1b16]"
          >
            AI Features
          </Link>
          <Link
            href="/report"
            className="rounded-full px-4 py-2 text-[#3b342d] transition duration-300 hover:bg-white hover:text-[#1f1b16]"
          >
            Report Issue
          </Link>
          <Link href="/login" className="rounded-full px-4 py-2 text-[#3b342d] transition hover:bg-white">
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-[#1f1b16] px-4 py-2 font-medium text-[#fff6e8] transition duration-300 hover:-translate-y-0.5 hover:bg-[#2f2922]"
          >
            Start free
          </Link>
        </nav>

        <Link
          href="/signup"
          className="rounded-full bg-[#1f1b16] px-4 py-2 text-sm font-medium text-[#fff6e8] transition duration-300 hover:bg-[#2f2922] md:hidden"
        >
          Start
        </Link>
      </header>

      <nav className="scrollbar-hide flex items-center gap-2 overflow-x-auto rounded-full border border-[#1f1b16]/10 bg-white/80 px-2 py-2 backdrop-blur md:hidden">
        <Link href="/pricing" className="whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium text-[#3b342d] transition hover:bg-white">
          Pricing
        </Link>
        <Link href="/ai-features" className="whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium text-[#3b342d] transition hover:bg-white">
          AI Features
        </Link>
        <Link href="/report" className="whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium text-[#3b342d] transition hover:bg-white">
          Report Issue
        </Link>
        <Link href="/login" className="whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium text-[#3b342d] transition hover:bg-white">
          Log in
        </Link>
      </nav>
    </div>
  );
}
