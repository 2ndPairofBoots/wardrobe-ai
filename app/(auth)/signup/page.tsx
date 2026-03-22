import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/server";

type SignupPageProps = {
  searchParams?: {
    error?: string;
  };
};

export default function SignupPage({ searchParams }: SignupPageProps) {
  const error = searchParams?.error;

  async function signupWithGoogle() {
    "use server";

    const supabase = createClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const callbackUrl = `${siteUrl}/auth/callback?next=/dashboard`;
    const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl,
      },
    });

    if (oauthError || !data.url) {
      redirect("/signup?error=Unable%20to%20start%20Google%20sign-up.");
    }

    redirect(data.url);
  }

  async function signup(formData: FormData) {
    "use server";

    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
      redirect("/signup?error=Email%20and%20password%20are%20required.");
    }

    if (password.length < 8) {
      redirect("/signup?error=Password%20must%20be%20at%20least%208%20characters.");
    }

    try {
      const supabase = createClient();
      const result = await supabase.auth.signUp({ email, password });

      if (result.error) {
        redirect("/signup?error=Unable%20to%20create%20account.");
      }
    } catch {
      redirect("/signup?error=Unable%20to%20create%20account.%20Please%20try%20again.");
    }

    redirect("/login?message=Account%20created.%20Check%20your%20email%20to%20confirm.");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-4 py-10 text-text-primary">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-14 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#f9c784]/30 blur-3xl" />
        <div className="absolute bottom-[-6rem] right-[-3rem] h-64 w-64 rounded-full bg-[#8ab0ab]/20 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-md rounded-2xl border border-border bg-surface/90 p-6 shadow-[0_30px_60px_-36px_rgba(31,27,22,0.55)] backdrop-blur sm:p-7">
          <h1 className="text-2xl font-semibold">Sign up</h1>
          <p className="mt-2 text-sm text-text-secondary">Create your wardrobe account.</p>

          {error ? (
            <p className="mt-4 rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
              {error}
            </p>
          ) : null}

          <form action={signup} className="mt-6 space-y-4">
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
                minLength={8}
                required
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-text-primary outline-none ring-primary/50 focus:ring-2"
              />
            </div>
            <Button type="submit" variant="primary" size="md" loading={false} className="w-full">
              Sign up
            </Button>
          </form>

          <div className="my-4 flex items-center gap-3 text-xs text-text-secondary">
            <span className="h-px flex-1 bg-border" />
            <span>or</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <form action={signupWithGoogle}>
            <Button type="submit" variant="secondary" size="md" loading={false} className="w-full">
              Continue with Google
            </Button>
          </form>

          <p className="mt-4 text-sm text-text-secondary">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:text-primary-hover">
              Log in
            </Link>
          </p>
      </div>
    </main>
  );
}
