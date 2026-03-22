import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type RateLimitRule = {
  name: string;
  pathPrefix: string;
  limit: number;
  windowMs: number;
};

type RateLimitState = {
  count: number;
  resetAt: number;
};

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

const RATE_LIMIT_RULES: RateLimitRule[] = [
  { name: "auth-callback", pathPrefix: "/auth/callback", limit: 30, windowMs: 60_000 },
  { name: "report-issue", pathPrefix: "/api/report-issue", limit: 8, windowMs: 60_000 },
  { name: "scan", pathPrefix: "/api/wardrobe/scan", limit: 20, windowMs: 60_000 },
  { name: "suggestions", pathPrefix: "/api/suggestions", limit: 20, windowMs: 60_000 },
  { name: "api-default", pathPrefix: "/api/", limit: 120, windowMs: 60_000 },
];

const rateLimitStore = new Map<string, RateLimitState>();

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "unknown";
}

function getApplicableRule(pathname: string): RateLimitRule | null {
  for (const rule of RATE_LIMIT_RULES) {
    if (pathname.startsWith(rule.pathPrefix)) {
      return rule;
    }
  }
  return null;
}

function checkRateLimit(ip: string, rule: RateLimitRule): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const key = `${rule.name}:${ip}`;
  const state = rateLimitStore.get(key);

  if (!state || now >= state.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + rule.windowMs });
    return { allowed: true, retryAfterSeconds: Math.ceil(rule.windowMs / 1000) };
  }

  if (state.count >= rule.limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((state.resetAt - now) / 1000)),
    };
  }

  state.count += 1;
  rateLimitStore.set(key, state);
  return {
    allowed: true,
    retryAfterSeconds: Math.max(1, Math.ceil((state.resetAt - now) / 1000)),
  };
}

function isCrossSiteMutatingRequest(request: NextRequest): boolean {
  if (!MUTATING_METHODS.has(request.method)) {
    return false;
  }

  if (!request.nextUrl.pathname.startsWith("/api/")) {
    return false;
  }

  const origin = request.headers.get("origin");
  if (!origin) {
    return false;
  }

  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", "");
  const expectedOrigin = host ? `${proto}://${host}` : request.nextUrl.origin;

  return origin !== expectedOrigin;
}

function setSecurityHeaders(response: NextResponse, request: NextRequest) {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(self)");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Resource-Policy", "same-site");

  if (request.nextUrl.protocol === "https:") {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }
}

export function middleware(request: NextRequest) {
  if (isCrossSiteMutatingRequest(request)) {
    const blocked = NextResponse.json({ error: "Cross-site request blocked." }, { status: 403 });
    setSecurityHeaders(blocked, request);
    return blocked;
  }

  const rule = getApplicableRule(request.nextUrl.pathname);
  if (rule) {
    const ip = getClientIp(request);
    const { allowed, retryAfterSeconds } = checkRateLimit(ip, rule);
    if (!allowed) {
      const limited = NextResponse.json({ error: "Too many requests." }, { status: 429 });
      limited.headers.set("Retry-After", String(retryAfterSeconds));
      setSecurityHeaders(limited, request);
      return limited;
    }
  }

  const response = NextResponse.next();
  setSecurityHeaders(response, request);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};