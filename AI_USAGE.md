# AI Usage — Nebula Job Immersion Platform

This document describes how AI tools were used throughout the development of this project.

## Tools Used

- **GitHub Copilot** (Claude Sonnet 4.6): Full implementation assistance via the SpecKit implementation mode

## AI-Assisted Work

### Architecture & Planning
- Setup a prompt to prepare the main AI agent with rules that the ai model must follow to archive the delivery
- Setup Speckit with specifications of the Nebula Case Study, I implement software solutions with the SDD approach
- Clarified ambiguous features until everything in the feature is clear for implementations, but also clarified rules/behaviours of the environment, which are development contrainsts
- Generated the data model, API contracts, and task breakdown from the initial specification
- Build a development plan and implementations tasks with speckit
- Suggested the RBAC model (profile-based permissions stored in DB, enriched into JWT)
- Designed the `ActionResult<T>` pattern for consistent server action responses
- Choosed frontend layout by absorbing opensource templates of NextJs: https://nextjs-demo.tailadmin.com/ and https://e-learning-tailwind-nextjs-free.vercel.app/
 
### Code Generation
- **Server Actions**: All `features/*/actions/*.ts` files were generated with AI assistance, following the permission-check → business-logic → error-handling pattern
- **Prisma Schema**: Generated the full schema with all models, relationships, and SQLite-compatible types
- **UI Components**: Generated all shared components (Button, Input, Select, Badge, Card, Toast, Skeleton) and feature components
- **Test Files**: Generated unit tests using Vitest with `vi.mock()` for Prisma client isolation

### Problem Solving
- **Prisma 7 Migration**: Identified and resolved a breaking change in Prisma 7 (datasource URL moved to `prisma.config.ts`, `PrismaClient` now requires an adapter). Adapted the codebase to use `@prisma/adapter-better-sqlite3`
- **Mock hoisting**: Resolved Vitest mock hoisting issues by moving `vi.mock()` calls directly into test files
- **Fixing**: Fix unspecified behaviours for a better User Experience at the end of the main implementations

### Examples where AI helped me move fast
- Generate code/layout
- Fill the data models object quick
- Structure an incremental implementation plan
- Choose Design System
- Setup Design Pattern

### Example where AI gave you something wrong, incomplete, or risky
- Date format: ISO 8601 date instead of datetime-local
- Design system issues: white text over white background, dark text over dark background
- KPIs count issues on dashboard (probably not calculated than wrong calcul)

### Reviews and validations
- Fist, checked the data models to ensure compliance with the requirements
- Then I setup e2e tests with playwright, but as the time to review each use case was short, I decided not to care about them and perform tests myself directly
- The design pattern was reviewed by review folder structure and architecture diagrams

### Parts of the implementation checked most carefully
- The architecture
- The data models
- The e2e tests' results


## Limitations

- E2E tests are stub implementations that require a running server
- The metrics endpoint uses in-process counters (no persistent metrics storage)