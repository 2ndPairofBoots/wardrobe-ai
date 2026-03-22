import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";

type DashboardLayoutProps = {
  children: ReactNode;
};

const navigation = [
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
    <div className="min-h-screen bg-background text-text-primary">
      <div className="mx-auto flex w-full max-w-7xl flex-col md:flex-row">
        <aside className="w-full border-b border-border bg-surface p-4 sm:p-6 md:w-64 md:border-b-0 md:border-r">
          <h2 className="mb-4 text-xl font-semibold md:mb-6">WardrobeAI</h2>
          <nav className="flex gap-2 overflow-x-auto pb-1 md:block md:space-y-2 md:overflow-visible md:pb-0">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block whitespace-nowrap rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background hover:text-text-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="min-w-0 flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
