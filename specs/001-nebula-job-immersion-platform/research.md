# Research: Nebula Job Immersion Program Platform

**Phase**: 0 — Pre-design research
**Date**: 2026-07-04
**Feature**: 001-nebula-job-immersion-platform

---

## 1. NextAuth v4 + @next-auth/prisma-adapter + SQLite

**Decision**: Use **next-auth v4** (`next-auth@4.x`) with `@next-auth/prisma-adapter`.

**Rationale**:
- Auth.js v5 (next-auth v5) is still in beta as of mid-2026 and has breaking changes in the Prisma adapter API.
- next-auth v4 is stable, fully documented for Next.js App Router via `getServerSession(authOptions)`, and the Prisma adapter is production-ready.
- SQLite is fully supported via Prisma `provider = "sqlite"` — no known limitations for this use case.

**PrismaClient singleton** (required for Next.js hot-reload in dev):
```ts
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';
declare global { var prisma: PrismaClient | undefined; }
export const prisma = globalThis.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
```

**Alternatives considered**:
- Auth.js v5 (beta) — rejected: unstable, incomplete adapter documentation.
- Lucia Auth — rejected: less community support, no official Prisma adapter.

---

## 2. RBAC Session Enrichment via JWT Callback

**Decision**: Enrich the NextAuth JWT token with `profileName` and `permissions[]` at login time via the `jwt` callback. Read from DB only on initial sign-in (`user` is defined); subsequent requests use the cached token.

**Pattern**:
```ts
// lib/auth.ts (inside authOptions)
callbacks: {
  async jwt({ token, user }) {
    if (user) {
      const userProfile = await prisma.userProfile.findUnique({
        where: { userId: user.id },
        include: {
          profile: {
            include: { permissions: { include: { permission: true } } }
          }
        }
      });
      token.profileName = userProfile?.profile.name ?? 'student';
      token.permissions = userProfile?.profile.permissions.map(p => p.permission.action) ?? [];
    }
    return token;
  },
  async session({ session, token }) {
    if (session.user) {
      session.user.id = token.sub!;
      session.user.profileName = token.profileName as string;
      session.user.permissions = token.permissions as string[];
    }
    return session;
  }
}
```

**Permission check helper**:
```ts
// lib/permissions.ts
export function hasPermission(session: Session | null, action: string): boolean {
  return session?.user?.permissions?.includes(action) ?? false;
}
```

**Rationale**: DB is queried once per login, not on every request. Token is signed/encrypted — permissions cannot be tampered with client-side. Permission changes take effect on next login (acceptable for v1).

---

## 3. Concurrent Enrollment — Prisma $transaction + UNIQUE Constraint

**Decision**: `@@unique([studentId, cohortId])` on `Enrollment` model + capacity check inside `prisma.$transaction`.

**Pattern**:
```ts
// features/enrollment/services/enrollmentService.ts
export async function enrollStudent(studentId: string, cohortId: string) {
  return prisma.$transaction(async (tx) => {
    const cohort = await tx.cohort.findUniqueOrThrow({
      where: { id: cohortId },
      include: { _count: { select: { enrollments: true } } }
    });

    if (cohort.enrollmentStatus !== 'OPEN') throw new EnrollmentError('COHORT_NOT_OPEN');
    if (cohort._count.enrollments >= cohort.maxParticipants) throw new EnrollmentError('COHORT_FULL');

    const enrollment = await tx.enrollment.create({
      data: { studentId, cohortId }
    });

    // Auto-close cohort if now full
    if (cohort._count.enrollments + 1 >= cohort.maxParticipants) {
      await tx.cohort.update({ where: { id: cohortId }, data: { enrollmentStatus: 'FULL' } });
    }

    return enrollment;
  });
}
```

**SQLite note**: SQLite uses `SERIALIZABLE` isolation by default — transactions are safe from concurrent write races. The `@@unique` constraint is the final DB-level safety net if two transactions slip through simultaneously.

---

## 4. Feature-Driven Architecture — Next.js App Router Layout

**Decision**: Feature modules under `src/features/`, App Router pages under `src/app/`, shared infrastructure under `src/lib/`.

**Rationale**: Keeps each domain (programs, cohorts, enrollment, etc.) self-contained. App Router pages are thin wrappers that import from feature modules. This aligns with the constitution's Feature-Driven Architecture principle.

**Route group strategy**:
- `(public)` — unauthenticated routes: `/programs`, `/programs/[id]`, `/register`, `/login`
- `(student)` — authenticated, Student permission: `/my-programs`
- `(coach)` — authenticated, Coach permission: `/coach/**`
- `(admin)` — authenticated, Admin permission: `/admin/**`

Middleware (`src/middleware.ts`) checks session and redirects unauthenticated users to `/login`. Permission-level checks happen inside server actions and page-level `getServerSession` calls.

---

## 5. Playwright Auth Setup — storageState per Role

**Decision**: `globalSetup` script authenticates each seeded test account and saves `storageState` JSON files. Each test spec declares which role it uses via `test.use({ storageState })`.

**Pattern**:
```ts
// e2e/global-setup.ts
async function globalSetup() {
  for (const role of ['student', 'coach', 'admin']) {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto('/login');
    await page.fill('[name=email]', SEED_ACCOUNTS[role].email);
    await page.fill('[name=password]', SEED_ACCOUNTS[role].password);
    await page.click('[type=submit]');
    await page.waitForURL('/');
    await page.context().storageState({ path: `e2e/fixtures/${role}.json` });
    await browser.close();
  }
}
```

**Rationale**: Each E2E test runs with a pre-authenticated session — no repeated login sequences. Fast, deterministic.

---

## 6. Zod Shared Validation — Client + Server

**Decision**: Zod schemas defined in `features/[name]/schemas/` are imported by both server actions (validation) and client forms (`zodResolver` from `react-hook-form`).

**Pattern**:
```ts
// features/programs/schemas/programSchema.ts
export const createProgramSchema = z.object({
  title: z.string().min(3).max(120),
  domain: z.enum(['FINANCE', 'CONSULTING', 'DATA', 'PRODUCT', 'SOFTWARE', 'MARKETING', 'ENTREPRENEURSHIP']),
  sessionCount: z.number().int().min(2).max(4),
  maxCohortSize: z.number().int().min(1).max(20),
  // ...
});
export type CreateProgramInput = z.infer<typeof createProgramSchema>;
```

**Rationale**: Single source of truth. Validation rules cannot drift between client (UX) and server (security).

---

## 7. Auto Session Scheduling Algorithm

**Decision**: Evenly distribute `n` session dates between `startDate` and `endDate` (inclusive). Offered as editable suggestions, not forced.

**Algorithm**:
```ts
export function suggestSessionDates(startDate: Date, endDate: Date, n: number): Date[] {
  if (n === 1) return [startDate];
  const totalDays = differenceInDays(endDate, startDate);
  return Array.from({ length: n }, (_, i) =>
    addDays(startDate, Math.round((i * totalDays) / (n - 1)))
  );
}
```

Uses `date-fns` (`addDays`, `differenceInDays`) — no additional dependencies beyond what Next.js projects typically use.

---

## 8. Structured Logging

**Decision**: Thin wrapper around `console` that outputs JSON in non-dev environments, human-readable in dev.

**Pattern**:
```ts
// lib/logger.ts
const isDev = process.env.NODE_ENV === 'development';
export const logger = {
  info: (msg: string, ctx?: object) => log('INFO', msg, ctx),
  warn: (msg: string, ctx?: object) => log('WARN', msg, ctx),
  error: (msg: string, ctx?: object) => log('ERROR', msg, ctx),
};
function log(level: string, msg: string, ctx?: object) {
  const entry = { timestamp: new Date().toISOString(), level, message: msg, ...ctx };
  isDev ? console.log(`[${level}]`, msg, ctx ?? '') : console.log(JSON.stringify(entry));
}
```

---

## Summary of Decisions

| Topic | Decision | Library/Pattern |
|---|---|---|
| Auth | next-auth v4 + @next-auth/prisma-adapter | CredentialsProvider, jwt/session callbacks |
| RBAC session | JWT enrichment at login | prisma.userProfile + token.permissions |
| Concurrent enrollment | $transaction + @@unique constraint | Prisma |
| Feature structure | src/features/ + src/app/ | Next.js App Router |
| Playwright auth | globalSetup + storageState | @playwright/test |
| Shared validation | Zod schemas in features/[name]/schemas/ | zod + react-hook-form/zodResolver |
| Session scheduling | Even distribution algorithm | date-fns |
| Logging | JSON logger wrapper | native console |
| Dev role switcher | DevRoleSwitcher component (NODE_ENV=dev) | signIn() NextAuth |
