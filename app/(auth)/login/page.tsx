import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/Button";
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

    redirect("/");
  }

  return (
    <main className="min-h-screen bg-background px-4 py-10 text-text-primary">
      <div className="mx-auto w-full max-w-md rounded-xl border border-border bg-surface p-6">
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
              required
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-text-primary outline-none ring-primary/50 focus:ring-2"
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
    </main>
  );
}
