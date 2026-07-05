# Nebula Job Immersion Platform

A Next.js 14+ application for managing job immersion programs, cohorts, and student explorations.

## Quick Start

Requires Node.js v24+
```bash
npm install
npm run db:migrate   # Apply schema + generate client
npm run db:seed      # Seed with demo data
npm run dev          # Start dev server at http://localhost:3000
```

## Demo Credentials

| Role    | Email                  | Password          |
|---------|------------------------|-------------------|
| Student | student@nebula.dev     | devpassword123!   |
| Coach   | coach@nebula.dev       | devpassword123!   |
| Admin   | admin@nebula.dev       | devpassword123!   |

## Tech Stack

- **Framework**: Next.js 14 (App Router, Server Components)
- **Auth**: next-auth v4 (CredentialsProvider, JWT + RBAC)
- **ORM**: Prisma 7 + better-sqlite3 adapter (SQLite)
- **Validation**: Zod (shared client/server)
- **Styling**: Tailwind CSS v4
- **Testing**: Vitest (unit) + Playwright (E2E)

## Scripts

| Command           | Description                        |
|-------------------|------------------------------------|
| `npm run dev`     | Start dev server                   |
| `npm run build`   | Production build                   |
| `npm run db:migrate` | Run Prisma migrations           |
| `npm run db:seed` | Seed demo data                     |
| `npm run db:reset`| Reset DB + re-seed                 |
| `npm run test:unit` | Run vitest unit tests            |
| `npm run test:e2e`  | Run Playwright E2E tests         |
| `npm run test:ci`   | Run unit + E2E sequentially      |

## Architecture

See [docs/architecture/](docs/architecture/) for system design and entity diagrams.

## RBAC

Access is controlled via profile-based permissions:
- **student**: browse programs, enroll, submit responses
- **coach**: create programs/cohorts, add explorations, give feedback
- **admin**: view dashboard stats, list all cohorts and users

## Project Structure

```
src/
├── app/           # Next.js App Router pages and API routes
│   ├── (public)/  # Public routes (programs, login, register)
│   ├── (student)/ # Protected student routes (/my-programs)
│   ├── (coach)/   # Protected coach routes (/coach/*)
│   └── (admin)/   # Protected admin routes (/admin/*)
├── features/      # Feature modules (auth, programs, cohorts, etc.)
│   └── {feature}/
│       ├── actions/    # Server actions
│       ├── schemas/    # Zod schemas
│       ├── services/   # Business logic
│       ├── components/ # Feature-specific UI
│       └── __tests__/  # Unit tests
├── components/    # Shared UI components
├── lib/           # Shared utilities (auth, prisma, logger, etc.)
└── hooks/         # Custom React hooks
```
