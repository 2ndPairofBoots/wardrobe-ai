"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

const navLink =
  "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex h-14 items-center justify-between gap-4">
        <Link href="/" className="text-sm font-semibold tracking-tight text-foreground">
          WardrobeAI
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex">
          <Link href="/about" className={navLink}>
            About
          </Link>
          <Link href="/pricing" className={navLink}>
            Pricing
          </Link>
          <Link href="/ai-features" className={navLink}>
            AI features
          </Link>
          <Link href="/report" className={navLink}>
            Report issue
          </Link>
          <Link href="/login" className={cn(navLink, "ml-1")}>
            Log in
          </Link>
          <Link
            href="/signup"
            className="ml-2 inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover"
          >
            Get started
          </Link>
        </nav>

        <Link
          href="/signup"
          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary-hover md:hidden"
        >
          Sign up
        </Link>
      </div>

      <nav className="scrollbar-hide flex gap-1 overflow-x-auto border-t border-border py-2 md:hidden">
        <Link href="/about" className="whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground">
          About
        </Link>
        <Link href="/pricing" className="whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground">
          Pricing
        </Link>
        <Link href="/ai-features" className="whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground">
          AI features
        </Link>
        <Link href="/report" className="whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground">
          Report
        </Link>
        <Link href="/login" className="whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground">
          Log in
        </Link>
      </nav>
    </header>
  );
}
