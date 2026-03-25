import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

function getOrigin(request: NextRequest): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost ?? request.headers.get("host");
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const proto = forwardedProto ?? request.nextUrl.protocol.replace(":", "");

  return host ? `${proto}://${host}` : process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const flow = searchParams.get("flow") === "signup" ? "signup" : "login";

  const next = searchParams.get("next") ?? "/dashboard";
  const safeNext = next.startsWith("/") ? next : "/dashboard";

  const origin = getOrigin(request);
  const callbackUrl = `${origin}/auth/callback?next=${encodeURIComponent(safeNext)}&flow=${encodeURIComponent(flow)}`;

  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl,
      },
    });

    if (error || !data?.url) {
      return NextResponse.json(
        {
          error: error?.message ?? error?.name ?? "Unable to start Google OAuth.",
        },
        { status: 400 }
      );
    }

    return NextResponse.redirect(data.url);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unable to start Google OAuth.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

