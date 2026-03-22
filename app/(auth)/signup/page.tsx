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
    <main className="min-h-screen bg-background px-4 py-10 text-text-primary">
      <div className="mx-auto w-full max-w-md rounded-xl border border-border bg-surface p-6">
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
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-text-primary outline-none ring-primary/50 focus:ring-2"
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
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-text-primary outline-none ring-primary/50 focus:ring-2"
            />
          </div>
          <Button variant="primary" size="md" loading={false} className="w-full">
            Sign up
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
