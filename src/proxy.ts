import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ---------------------------------------------------------------------------
// In-memory rate limiter (replace with @upstash/ratelimit for production)
// Edge-compatible: no Node.js built-ins used.
// ---------------------------------------------------------------------------

type RateLimitEntry = { count: number; resetAt: number };
const rateLimitStore = new Map<string, RateLimitEntry>();

function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  entry.count += 1;
  if (entry.count > maxRequests) {
    const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

const RATE_LIMIT_RULES = [
  { pattern: /^\/api\/auth\/callback\/credentials/, maxRequests: 10, windowMs: 60_000 },
  { pattern: /^\/register/, maxRequests: 5, windowMs: 60_000 },
];

function applyRateLimit(req: NextRequest): NextResponse | null {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    '127.0.0.1';

  const pathname = req.nextUrl.pathname;

  for (const rule of RATE_LIMIT_RULES) {
    if (rule.pattern.test(pathname)) {
      const key = `${pathname}::${ip}`;
      const { allowed, retryAfterSeconds } = checkRateLimit(key, rule.maxRequests, rule.windowMs);

      if (!allowed) {
        console.warn(`[rate-limit] 429 ${pathname} ip=${ip}`);
        return new NextResponse('Too Many Requests', {
          status: 429,
          headers: { 'Retry-After': String(retryAfterSeconds), 'Content-Type': 'text/plain' },
        });
      }
      break;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Auth guard — checks NextAuth session cookie (Edge-compatible, no jwt verify)
// ---------------------------------------------------------------------------

const PROTECTED_PREFIXES = ['/my-programs', '/coach', '/admin'];

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function hasSessionCookie(req: NextRequest): boolean {
  // NextAuth sets __Secure-next-auth.session-token in prod, next-auth.session-token in dev
  return (
    !!req.cookies.get('next-auth.session-token') ||
    !!req.cookies.get('__Secure-next-auth.session-token')
  );
}

// ---------------------------------------------------------------------------
// Proxy handler
// ---------------------------------------------------------------------------

export default function proxy(req: NextRequest) {
  // Rate limiting
  const rateLimitResponse = applyRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  const { pathname } = req.nextUrl;

  // Auth guard for protected routes
  if (isProtectedRoute(pathname) && !hasSessionCookie(req)) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};

