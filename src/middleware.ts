import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ---------------------------------------------------------------------------
// In-memory rate limiter (replace with @upstash/ratelimit for production)
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
        console.warn(JSON.stringify({ level: 'warn', message: 'Rate limit exceeded', ip, pathname }));
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
// Middleware
// ---------------------------------------------------------------------------

export default withAuth(
  function middleware(req) {
    const rateLimitResponse = applyRateLimit(req);
    if (rateLimitResponse) return rateLimitResponse;
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ token, req }) {
        const { pathname } = req.nextUrl;

        // Public routes — always allowed
        if (
          pathname.startsWith('/login') ||
          pathname.startsWith('/register') ||
          pathname.startsWith('/programs') ||
          pathname.startsWith('/api/auth') ||
          pathname === '/'
        ) {
          return true;
        }

        // Protected routes — must be authenticated
        if (
          pathname.startsWith('/my-programs') ||
          pathname.startsWith('/coach') ||
          pathname.startsWith('/admin')
        ) {
          return !!token;
        }

        return true;
      },
    },
    pages: {
      signIn: '/login',
    },
  },
);

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};

