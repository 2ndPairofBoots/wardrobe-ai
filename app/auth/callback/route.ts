import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const googleError = requestUrl.searchParams.get("error");
  const googleErrorDescription = requestUrl.searchParams.get("error_description");
  const flow = requestUrl.searchParams.get("flow");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";
  const errorRedirectBase = flow === "signup" ? "/signup" : "/login";
  const safeNext = next.startsWith("/") ? next : "/dashboard";

  if (!code) {
    const detail = googleErrorDescription ? `: ${googleErrorDescription}` : "";
    const errorText = googleError
      ? `Google sign-in did not complete (${googleError}${detail}).`
      : "Missing OAuth code from Google sign-in.";
    return NextResponse.redirect(
      new URL(`${errorRedirectBase}?error=${encodeURIComponent(errorText)}`, requestUrl.origin),
    );
  }

  const supabase = createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL(`${errorRedirectBase}?error=${encodeURIComponent("Unable to sign in with Google.")}`, requestUrl.origin),
    );
  }

  return NextResponse.redirect(new URL(safeNext, requestUrl.origin));
}