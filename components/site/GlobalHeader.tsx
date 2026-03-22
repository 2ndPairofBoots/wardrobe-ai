"use client";

import { usePathname } from "next/navigation";
import { PublicHeader } from "@/components/site/PublicHeader";

export function GlobalHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <div className="mx-auto w-full max-w-6xl px-6 pt-4 sm:px-8 lg:px-10">
      <PublicHeader showLandingAnchors={isHome} />
    </div>
  );
}