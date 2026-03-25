"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
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
};

function getClientId(): string | undefined {
  return process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
}

export function GoogleSignInButton({ redirectTo }: GoogleSignInButtonProps) {
  const supabase = useMemo(() => createClient(), []);
  const [error, setError] = useState<string | null>(null);
  const googleClientId = getClientId();

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

      <Button
        type="button"
        variant="secondary"
        size="md"
        loading={false}
        className="w-full"
        onClick={() => {
          try {
            if (!googleClientId) return;
            if (window.google?.accounts?.id) {
              // Show the One Tap / account chooser.
              window.google.accounts.id.prompt();
            }
          } catch {
            setError("Unable to start Google sign-in.");
          }
        }}
      >
        Continue with Google
      </Button>
    </div>
  );
}

