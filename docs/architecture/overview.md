# Architecture — Nebula Job Immersion Platform

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js App Router                       │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Public Pages│  │ Coach Pages  │  │   Admin Pages    │  │
│  │  /programs   │  │ /coach/*     │  │   /admin/*       │  │
│  │  /login      │  │              │  │                  │  │
│  │  /register   │  │              │  │                  │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
│         │                 │                   │             │
│  ┌──────▼─────────────────▼───────────────────▼──────────┐ │
│  │              Server Actions (features/*/actions/)       │ │
│  │  RBAC: requirePermission(session, 'action:resource')   │ │
│  └──────────────────────┬─────────────────────────────────┘ │
│                         │                                    │
│  ┌──────────────────────▼─────────────────────────────────┐ │
│  │              Prisma ORM (Prisma 7 + better-sqlite3)     │ │
│  └──────────────────────┬─────────────────────────────────┘ │
└─────────────────────────┼───────────────────────────────────┘
                          │
                  ┌───────▼──────┐
                  │   SQLite DB   │
                  │  (dev.db)     │
                  └──────────────┘
```

## Authentication Flow

```
User → Login → CredentialsProvider → bcrypt.compare
            → DB: User + UserProfile + Permissions
            → JWT: { id, profileName, permissions[] }
            → Session: same fields via session callback
```

## RBAC Model

```
User ──< UserProfile >── Profile ──< ProfilePermission >── Permission
                                                             (action:resource)
```

## Domain Entities

```
Program (coach)
  └──< Cohort
          ├──< CohortSession
          ├──< Enrollment (student)
          └── enrollmentStatus: OPEN | FULL | CLOSED | CANCELLED

Program ──< Exploration (program-level or session-level)
              └──< ExplorationSubmission (student response + coach feedback)
```

## Request Lifecycle

1. Browser → Next.js Middleware (auth check via withAuth)
2. Page Server Component → getServerSession()
3. Server Action → requirePermission() → Prisma query
4. Response → ActionResult<T> → Client state update
