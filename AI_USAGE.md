# AI Usage — Nebula Job Immersion Platform

This document describes how AI tools were used throughout the development of this project.

## Tools Used

- **GitHub Copilot** (Claude Sonnet 4.6): Full implementation assistance via the SpecKit implementation mode

## AI-Assisted Work

### Architecture & Planning
- Generated the data model, API contracts, and task breakdown from the initial specification
- Suggested the RBAC model (profile-based permissions stored in DB, enriched into JWT)
- Designed the `ActionResult<T>` pattern for consistent server action responses

### Code Generation
- **Server Actions**: All `features/*/actions/*.ts` files were generated with AI assistance, following the permission-check → business-logic → error-handling pattern
- **Prisma Schema**: Generated the full schema with all models, relationships, and SQLite-compatible types
- **UI Components**: Generated all shared components (Button, Input, Select, Badge, Card, Toast, Skeleton) and feature components
- **Test Files**: Generated unit tests using Vitest with `vi.mock()` for Prisma client isolation

### Problem Solving
- **Prisma 7 Migration**: Identified and resolved a breaking change in Prisma 7 (datasource URL moved to `prisma.config.ts`, `PrismaClient` now requires an adapter). Adapted the codebase to use `@prisma/adapter-better-sqlite3`
- **Mock hoisting**: Resolved Vitest mock hoisting issues by moving `vi.mock()` calls directly into test files

## Human Review

All AI-generated code was reviewed for:
- Security vulnerabilities (OWASP Top 10 compliance)
- Correctness of business rules (status transitions, enrollment capacity)
- Consistency with the specification contracts

## Limitations

- E2E tests are stub implementations that require a running server
- The metrics endpoint uses in-process counters (no persistent metrics storage)
