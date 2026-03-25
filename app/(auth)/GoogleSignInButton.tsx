"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: {
            client_id: string;
            auto_select?: boolean;
            callback: (response: { credential?: string }) => void;
          }) => void;
          prompt: () => void;
        };
      };
    };
  }
}

type GoogleSignInButtonProps = {
  redirectTo: string;
  flow?: "login" | "signup";
};

function GoogleGIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303C33.652 32.658 29.219 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.026 6.053 29.277 4 24 4 12.954 4 4 12.954 4 24s8.954 20 20 20 20-8.954 20-20c0-1.341-.138-2.65-.389-3.917Z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691 12.88 19.51C14.657 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.026 6.053 29.277 4 24 4 16.318 4 9.656 8.33 6.306 14.691Z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.176 0 9.84-1.977 13.399-5.193l-6.19-5.238C29.155 35.091 26.715 36 24 36c-5.197 0-9.617-3.317-11.283-7.946l-6.525 5.025C9.505 39.556 16.227 44 24 44Z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a11.95 11.95 0 0 1-4.094 5.569h.001l6.19 5.238C36.961 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917Z"
      />
    </svg>
  );
}

function getClientId(): string | undefined {
  return process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
}

export function GoogleSignInButton({ redirectTo, flow = "login" }: GoogleSignInButtonProps) {
  const supabase = useMemo(() => createClient(), []);
  const [error, setError] = useState<string | null>(null);
  const googleClientId = getClientId();
  const oauthFallbackUrl = `/api/auth/google-oauth/start?next=${encodeURIComponent(redirectTo)}&flow=${encodeURIComponent(flow)}`;
  const label = flow === "signup" ? "Sign up with Google" : "Sign in with Google";

  useEffect(() => {
    if (!googleClientId) return;

    const maybeInit = () => {
      if (!window.google?.accounts?.id) return false;
      const googleId = window.google.accounts.id;

      // Initialize Google Identity Services.
      googleId.initialize({
        client_id: googleClientId,
        auto_select: true,
        callback: async (response: { credential?: string }) => {
          const token = response?.credential;
          if (!token) {
            setError("Google did not return a sign-in token.");
            return;
          }

          // Exchange Google ID token for a Supabase session.
          const authWithIdToken = supabase.auth as unknown as {
            signInWithIdToken: (args: { provider: "google"; token: string }) => Promise<{
              error: { message?: string } | null;
            }>;
          };

          const { error: signInError } = await authWithIdToken.signInWithIdToken({
            provider: "google",
            token,
          });

          if (signInError) {
            setError(signInError.message ?? "Unable to sign in with Google.");
            return;
          }

          window.location.href = redirectTo;
        },
      });

      // Triggers automatic sign-in if the user already has a Google session.
      googleId.prompt();
      return true;
    };

    // Load GIS script if needed.
    const existing = document.querySelector<HTMLScriptElement>('script[data-gis="true"]');
    if (!existing) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.setAttribute("data-gis", "true");
      script.onload = () => maybeInit();
      script.onerror = () => setError("Unable to load Google sign-in library.");
      document.head.appendChild(script);
    }

    // If the script was already loaded, try initializing immediately.
    maybeInit();
  }, [googleClientId, redirectTo, supabase]);

  return (
    <div>
      {googleClientId ? null : (
        <p className="mb-3 rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
          Google sign-in is not configured. Set `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in your environment.
        </p>
      )}
      {error ? (
        <p className="mb-3 rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm text-danger">{error}</p>
      ) : null}

      <button
        type="button"
        className="group relative flex w-full items-center justify-center gap-3 rounded-full border border-border bg-background px-5 py-3 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        onClick={() => {
          try {
            if (!googleClientId) {
              window.location.href = oauthFallbackUrl;
              return;
            }

            if (window.google?.accounts?.id) {
              // Show the One Tap / account chooser.
              window.google.accounts.id.prompt();
            }
          } catch {
            setError("Unable to start Google sign-in.");
          }
        }}
      >
        <span className="absolute left-4 inline-flex h-7 w-7 items-center justify-center rounded-full bg-background">
          <GoogleGIcon className="h-5 w-5" />
        </span>
        <span className="text-[15px]">{label}</span>
      </button>
    </div>
  );
}

