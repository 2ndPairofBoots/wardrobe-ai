import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { PublicHeader } from "@/components/site/PublicHeader";
import { createClient } from "@/lib/supabase/server";

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
    <main className="relative min-h-screen overflow-hidden bg-background px-4 py-10 text-text-primary">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-14 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#f9c784]/30 blur-3xl" />
        <div className="absolute bottom-[-6rem] right-[-3rem] h-64 w-64 rounded-full bg-[#8ab0ab]/20 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl">
        <PublicHeader />

        <div className="mx-auto mt-8 w-full max-w-md rounded-2xl border border-border bg-surface/90 p-6 shadow-[0_30px_60px_-36px_rgba(31,27,22,0.55)] backdrop-blur sm:p-7">
          <h1 className="text-2xl font-semibold">Log in</h1>
          <p className="mt-2 text-sm text-text-secondary">Access your wardrobe account.</p>

          {error ? (
            <p className="mt-4 rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
              {error}
            </p>
          ) : null}
          {message ? (
            <p className="mt-4 rounded-lg border border-success/40 bg-success/10 p-3 text-sm text-success">
              {message}
            </p>
          ) : null}

          <form action={login} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm text-text-secondary">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-text-primary outline-none ring-primary/50 focus:ring-2"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1 block text-sm text-text-secondary">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-text-primary outline-none ring-primary/50 focus:ring-2"
              />
            </div>
            <Button type="submit" variant="primary" size="md" loading={false} className="w-full">
              Log in
            </Button>
          </form>

          <p className="mt-4 text-sm text-text-secondary">
            No account yet?{" "}
            <Link href="/signup" className="text-primary hover:text-primary-hover">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
