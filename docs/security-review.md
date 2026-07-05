# Security Review — Nebula Job Immersion Platform

## Scope

OWASP Top 10 review of the implementation.

## Findings

### 1. Authentication — PASS

- Passwords hashed with bcryptjs (cost factor 12)
- JWT secret configured via `NEXTAUTH_SECRET` env var
- Sessions use JWT strategy (stateless)
- No password stored in plaintext

**Action**: Ensure `NEXTAUTH_SECRET` is a strong random value in production (≥32 chars).

### 2. Authorization (Broken Access Control) — PASS

- All server actions call `requirePermission(session, action)` at the start
- Permission denied throws `"PERMISSION_DENIED:{action}"` and logs warning
- Ownership checks on program/cohort update: `coachId === session.user.id`
- Admin pages redirect non-admin users at page level AND action level

### 3. Injection — PASS

- All database queries use Prisma ORM with parameterized queries
- No raw SQL executed
- User inputs validated through Zod schemas before processing

### 4. Enrollment Race Condition — MITIGATED

- `enrollInCohort` uses `prisma.$transaction` to re-fetch cohort count inside transaction
- SQLite's file-level locking prevents concurrent writes
- **Note**: For PostgreSQL in production, add `SELECT FOR UPDATE` for stronger isolation

### 5. Session Hijacking — PASS

- `secure: true` cookies recommended for production (set by NextAuth when `NEXTAUTH_URL` uses HTTPS)
- Token rotation on re-login

### 6. Sensitive Data Exposure — PASS

- No passwords, hashed or otherwise, returned in API responses
- Metrics endpoint access should be restricted (see `/api/metrics` route: IP-based or token-based)

### 7. Rate Limiting — TODO (T030b)

Rate limiting on `/api/auth/callback/credentials` and `/register` is planned but not yet implemented.

**Risk**: Brute-force attacks on login endpoint.

**Recommended fix**: Implement `next-rate-limit` middleware with 10 req/min per IP on login.

### 8. CSRF — PASS (delegated to NextAuth)

NextAuth handles CSRF protection on the credentials flow via `csrfToken`.

### 9. Security Headers — RECOMMENDED

Add security headers to `next.config.js`:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`

### 10. Dev Credentials in Seed — WARNING

Seed script contains hardcoded dev passwords. These must not be used in production.

**Action**: Change all seeded account passwords before any production deployment.
