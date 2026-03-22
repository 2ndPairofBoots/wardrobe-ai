import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";

type DashboardLayoutProps = {
  children: ReactNode;
};

const navigation = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/wardrobe", label: "Wardrobe" },
  { href: "/outfits", label: "Outfits" },
  { href: "/planner", label: "Planner" },
  { href: "/suggestions", label: "Suggestions" },
  { href: "/profile", label: "Profile" },
];

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      redirect("/login");
    }
  } catch {
    redirect("/login");
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-text-primary">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-16 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#f9c784]/30 blur-3xl" />
        <div className="absolute right-[-7rem] top-1/3 h-64 w-64 rounded-full bg-[#8ab0ab]/20 blur-3xl" />
      </div>

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:px-6 md:py-6">
        <aside className="w-full rounded-2xl border border-border bg-surface/90 p-4 backdrop-blur sm:p-6 md:sticky md:top-6 md:h-[calc(100vh-3rem)] md:w-64 md:self-start">
          <h2 className="mb-4 text-xl font-semibold tracking-tight md:mb-6">WardrobeAI</h2>
          <nav className="flex gap-2 overflow-x-auto pb-1 md:block md:space-y-2 md:overflow-visible md:pb-0">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block whitespace-nowrap rounded-lg px-3 py-2 text-sm text-text-secondary transition-all duration-300 hover:bg-white hover:text-text-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="min-w-0 flex-1 rounded-2xl border border-border bg-surface/70 p-4 backdrop-blur sm:p-6">{children}</main>
      </div>
    </div>
  );
}
