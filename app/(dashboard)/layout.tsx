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
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:flex-row md:px-6">
        <aside className="w-full rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5 md:sticky md:top-6 md:h-[calc(100vh-3rem)] md:w-56 md:shrink-0 md:self-start lg:w-60">
          <h2 className="mb-4 text-lg font-semibold tracking-tight">WardrobeAI</h2>
          <nav className="flex gap-1 overflow-x-auto pb-1 md:block md:space-y-0.5 md:overflow-visible md:pb-0">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block whitespace-nowrap rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="min-w-0 flex-1 rounded-lg border border-border bg-card p-4 shadow-sm sm:p-6">{children}</main>
      </div>
    </div>
  );
}
