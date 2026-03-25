import Link from "next/link";
import { headers } from "next/headers";
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

  function buildCallbackUrl() {
    const headerList = headers();
    const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
    const proto = headerList.get("x-forwarded-proto") ?? "http";
    const origin = host ? `${proto}://${host}` : process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

    return `${origin}/auth/callback?next=/dashboard&flow=signup`;
  }

  async function signupWithGoogle() {
    "use server";

    const supabase = createClient();
    const callbackUrl = buildCallbackUrl();
    const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl,
        // When the user is already logged into Google, this makes the sign-in happen without an extra Google prompt.
        queryParams: { prompt: "none" },
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
    <main className="min-h-screen bg-background px-4 py-12 text-foreground">
      <div className="mx-auto w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-semibold tracking-tight">Sign up</h1>
          <p className="mt-2 text-sm text-muted-foreground">Create your WardrobeAI account.</p>

          {error ? (
            <p className="mt-4 rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
              {error}
            </p>
          ) : null}

          <form action={signup} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-muted-foreground">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-muted-foreground">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                minLength={8}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <Button type="submit" variant="primary" size="md" loading={false} className="w-full">
              Sign up
            </Button>
          </form>

          <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            <span>or</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <form action={signupWithGoogle}>
            <Button type="submit" variant="secondary" size="md" loading={false} className="w-full">
              Continue with Google
            </Button>
          </form>

          <p className="mt-4 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
              Log in
            </Link>
          </p>
      </div>
    </main>
  );
}
