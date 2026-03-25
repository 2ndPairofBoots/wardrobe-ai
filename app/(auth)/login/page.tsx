import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/server";
import { GoogleSignInButton } from "../GoogleSignInButton";

type LoginPageProps = {
  searchParams?: {
    error?: string;
    message?: string;
  };
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  const error = searchParams?.error;
  const message = searchParams?.message;

  async function login(formData: FormData) {
    "use server";

    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
      redirect("/login?error=Email%20and%20password%20are%20required.");
    }

    try {
      const supabase = createClient();
      const result = await supabase.auth.signInWithPassword({ email, password });

      if (result.error) {
        redirect("/login?error=Invalid%20email%20or%20password.");
      }
    } catch {
      redirect("/login?error=Unable%20to%20sign%20in.%20Please%20try%20again.");
    }

    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-background px-4 py-12 text-foreground">
      <div className="mx-auto w-full max-w-5xl">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_420px]">
          <div className="hidden lg:block">
            <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">WardrobeAI</p>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight">Welcome back.</h1>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                Sign in to your account to manage your wardrobe, plan outfits, and get suggestions that match the
                weather.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-foreground">
                {[
                  { title: "Your wardrobe, organized", desc: "Searchable items with consistent tags." },
                  { title: "Outfits that fit the day", desc: "Weather-aware suggestions and planning." },
                  { title: "Fast daily workflow", desc: "Less guessing, more getting ready." },
                ].map((item) => (
                  <li key={item.title} className="rounded-lg border border-border bg-background p-4">
                    <p className="font-medium">{item.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="w-full rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Sign in</h2>
                <p className="mt-2 text-sm text-muted-foreground">Access your WardrobeAI account.</p>
              </div>
              <Link
                href="/"
                className="mt-1 text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Home
              </Link>
            </div>

            {error ? (
              <p className="mt-5 rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm text-danger">{error}</p>
            ) : null}
            {message ? (
              <p className="mt-5 rounded-lg border border-success/40 bg-success/10 p-3 text-sm text-success">
                {message}
              </p>
            ) : null}

            <div className="mt-6">
              <GoogleSignInButton redirectTo="/dashboard" flow="login" />
            </div>

            <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" />
              <span>or</span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <form action={login} className="space-y-4">
              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium text-muted-foreground">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  required
                  className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-muted-foreground">
                    Password
                  </label>
                  <span className="text-xs text-muted-foreground">Forgot password?</span>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Your password"
                  required
                  className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <Button type="submit" variant="primary" size="lg" loading={false} className="w-full">
                Sign in
              </Button>
            </form>

            <p className="mt-5 text-sm text-muted-foreground">
              No account yet?{" "}
              <Link href="/signup" className="font-medium text-foreground underline-offset-4 hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
