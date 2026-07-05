<!--
Sync Impact Report

Version change: 1.1.0 -> 1.2.0

Modified principles:
- Tech Stack & Architecture: Auth bullet updated — dev-only role switcher permitted alongside NextAuth
- Authentication & Authorization (RBAC): UserPermission individual overrides demoted to optional v2;
  simplified Profile-based model (User → Profile → Permission) is now the required minimum;
  dev-only role switcher pattern documented (no official Next.js mock plugin exists)

Decision rationale:
- Q1 (auth mock): PDF requirement accepted — mocked role switcher allowed in dev/test environments.
  Implemented as a dev-only UI component (NODE_ENV === 'development') switching between seeded accounts.
  NextAuth remains mandatory in production. No official Next.js/NextAuth mock plugin exists;
  the community-standard approach (CredentialsProvider + storageState for Playwright) is used.
- Q2 (RBAC depth): PDF requirement accepted — simplified Profile-based RBAC is the required baseline.
  UserPermission individual overrides are an optional v2 feature, not required for v1.
- Q3 (testing): Constitution requirement upheld — unit tests + Playwright E2E per feature remain mandatory.
  PDF's "basic tests" guidance is explicitly overridden.

Added sections: none
Removed sections: none

Templates requiring updates:
- .specify/templates/plan-template.md ✅ updated
- .specify/templates/spec-template.md ✅ updated
- .specify/templates/tasks-template.md ✅ updated

Follow-up TODOs:
- Add .github/CODEOWNERS to codify ownership
- Define numeric SLOs and alerting playbooks (see Operational Readiness)
- Add release automation CI (recommended)
- Initialise Prisma schema with RBAC v1 entities: User, Profile, Permission, UserProfile, ProfilePermission
- Plan UserPermission override table for v2
-->

# case-study-test Constitution

## Core Principles

### Tech Stack & Architecture
The canonical tech stack for this project is:

- **Framework**: Next.js (App Router), TypeScript in strict mode.
- **Database**: SQLite.
- **ORM**: Prisma (or Drizzle if explicitly agreed upon in an RFC) — always through a typed data-access layer. Raw queries
  scattered across the codebase are FORBIDDEN.
- **Authentication**: NextAuth (Auth.js) with `@auth/prisma-adapter` — sessions, accounts, and users are persisted
  in the same SQLite database via Prisma. Sessions, providers, and callbacks MUST be explicit and auditable.
  In `production`, a credentials provider (email/password with hashed passwords) or OAuth provider MUST be used.
  In `development`/`testing`, a **dev role switcher** UI component (gated by `NODE_ENV === 'development'`) is
  permitted: it calls `signIn()` on behalf of a pre-seeded DB account with one click, switching the active role
  without re-entering credentials. This is NOT a mock — it uses real NextAuth sessions backed by the SQLite DB.
  Note: Next.js has no official mock auth plugin; the pattern above is the community-standard approach.
  For Playwright E2E tests, `storageState` is used to persist and reuse authenticated sessions across tests.
- **Styling**: Tailwind CSS. Inline styles and ad-hoc CSS files are FORBIDDEN unless justified in the PR.
- **Forms & Validation**: Zod schemas shared between client and server (single source of truth). Every form MUST be validated
  both client-side (UX) and server-side (security). The client MUST NEVER be trusted without server-side re-validation.
- **Architecture**: Feature-Driven Architecture — each business capability is a self-contained module containing UI,
  server actions/API routes, Zod schemas, services, unit tests, Playwright tests, and a feature README.

The data model (including RBAC entities) MUST be designed before writing feature code.

Rationale: A fixed, well-understood stack reduces cognitive overhead and ensures decisions are consistent across the codebase.

### Test-First & Quality
All production code MUST be accompanied by automated tests:
- **Unit tests**: verifying business logic, validation schemas, permission resolution, and service functions in isolation.
- **Playwright E2E tests**: covering the real user journey for each feature (happy path + key permission-denied/error paths),
  run against a seeded test database.

Tests SHOULD be written before implementation when feasible (TDD). Tests MUST be co-located within the feature folder or clearly
mapped to it — orphan test suites are not allowed. CI MUST be able to run the full suite (unit + Playwright) in a single command
and MUST fail on regressions. No pull request may be merged while required tests are failing.

Rationale: Automated tests prevent regressions, make reviews faster, and preserve long-term maintainability.

### Code Review & Small Changes
All changes to protected branches MUST be made through pull requests. PRs SHOULD be focused and reviewable — prefer multiple small PRs
over a single large change. Each PR MUST include a clear description, link to any related issue or RFC, and a test plan.

Approval requirements:
- Routine changes: 1 approving review from a member of the project (maintainer or experienced contributor).
- Major, security-sensitive, infra, or API/contract changes: 2 approvals, at least one from a designated maintainer.

Rationale: Review improves quality, spreads knowledge, and reduces risk.

### Semantic Versioning & Compatibility
The project follows Semantic Versioning (MAJOR.MINOR.PATCH).
- MAJOR: Breaking changes to public APIs or incompatible governance/principle removals/redefinitions.
- MINOR: Additive, backwards-compatible functionality or material expansions of guidance.
- PATCH: Typo fixes, clarifications, non-semantic refinements.

Breaking changes MUST be clearly marked in PRs, include a migration plan, and reference the version bump.

Rationale: Predictable versioning reduces friction for users and downstream integrators.

### Observability & Operational Readiness
Every feature MUST be observable by design:

- **Structured logs**: JSON-formatted, with consistent fields (`timestamp`, `level`, `requestId`/`traceId`, `userId` when
  available, `feature`/`module`, `message`, `context` payload). `console.log` with unstructured strings is FORBIDDEN in
  production code paths.
- **Metrics**: expose counters/timers for critical operations (auth attempts, permission denials, request durations, error
  rates) in a format compatible with Prometheus or OpenTelemetry.
- **Traces**: instrument critical request paths (auth, data mutations, external calls) so a single request can be followed
  end-to-end.
- **Environment-aware error visibility**:
  - In `dev`/`local`/`preprod`: all errors MUST be displayed explicitly and in detail — especially auth, authorization,
    permission, and security-related errors (clear messages, stack traces, failing permission/resource identified). Nothing
    MUST fail silently during development.
  - In `production`: error details MUST be sanitized for end users but fully preserved in structured logs/traces.

Every thrown error MUST carry enough context (who, what resource, what permission was missing, correlation id) to be traceable
without reproducing the bug manually. New services or features that affect availability or data integrity MUST include an
observable target or suggested SLO and an incident playbook.

Rationale: Observability is essential for diagnosing issues and meeting reliability commitments.

### Security & Data Protection
Security is non-negotiable. The following rules apply without exception:

- All user input MUST be treated as hostile until validated (Zod) and sanitized.
- Secrets, credentials, private keys, and connection strings MUST NOT be committed. Use environment variables; document all
  required variables in `.env.example`.
- All server actions and API routes MUST explicitly check authentication and authorization before executing any business logic.
  UI-level hiding of controls is a UX convenience, not a security boundary.
- Protect against by design: SQL injection (ORM usage only, no raw string concatenation), XSS, CSRF, IDOR, mass assignment,
  and privilege escalation via crafted payloads.
- Passwords and sensitive data MUST be hashed/encrypted with industry-standard libraries (`bcrypt`/`argon2`). Plaintext
  storage is strictly forbidden.
- Rate limiting and basic abuse protection MUST be considered for sensitive endpoints (login, password reset, registration).
- Every security-relevant decision MUST be documented in code comments or the feature README (why a permission check exists,
  why a route is protected a certain way).
- Any change touching authentication/authorization, secrets handling, or sensitive data MUST include a security review
  (see CONTRIBUTING.md) and follow responsible disclosure procedures.

Rationale: Protecting user data and credentials is a top priority.

### Authentication & Authorization (RBAC)
Authentication and authorization MUST NEVER be conflated. They serve distinct concerns:

- **Authentication** (NextAuth + `@auth/prisma-adapter`): establishes *who* the user is. User identity, sessions,
  and accounts are stored in the SQLite database. Profile and permissions are also stored in the same DB and
  attached to the NextAuth session via the `jwt` callback at login time.
- **Authorization** (RBAC): determines *what* the authenticated user can do.

The RBAC model uses Profiles and Permissions, explicitly modeled in the data layer:

- **Permission**: an atomic grant of access to a specific resource/action (e.g. `program:create`, `cohort:manage`,
  `enrollment:create`, `admin:read`).
- **Profile**: a named collection of permissions (e.g. `Student`, `Coach`, `Admin`).
- A `User` is assigned one `Profile`.
- A `Profile` owns a set of `Permission`s.
- A `User` inherits all permissions from their assigned Profile.
- **Individual permission overrides** (`UserPermission` join table) are an OPTIONAL v2 feature — not required for
  implementations with a fixed, well-defined set of profiles.

Rules:
- Every user action (UI action, server action, API call) MUST be gated by an explicit **permission** check — never by
  profile/role name directly. The check MUST resolve the user's effective permission set from their Profile before
  allowing the action.
- Permission checks MUST happen server-side, always.
- The minimum required v1 data model: `User`, `Profile`, `Permission`, `UserProfile`, `ProfilePermission`.
  The `UserPermission` join table for individual overrides is optional for v1 and planned for v2.

Rationale: A Profile-based model is sufficient for a fixed role set. Mandatory permission-level checks (rather than
role-name checks) ensure the model remains resilient when profiles are renamed or reorganised in v2.

## Engineering Standards

### Language
The entire project — code, comments, commit messages, documentation, UI copy — MUST be written in **English**, regardless of
the language used to communicate during development.

### Feature-Driven Architecture
Every new feature MUST live in a dedicated folder containing:
- UI components
- Server actions / API routes
- Zod schemas
- Service layer
- Unit tests
- Playwright E2E tests
- Feature README (purpose, permissions involved, API/actions exposed, data model touched, how to test)

No feature logic may be scattered across the codebase outside its module.

### Documentation (`docs/`)
All documentation lives in `docs/`, written in Markdown with Mermaid diagrams, in English. Required content:
- `docs/README.md` — root index/table of contents.
- Context diagram (system boundaries, external actors).
- Use-case diagrams (per feature/domain).
- Class diagrams (data model, including RBAC entities).
- Sequence diagrams — one per significant use case.
- Activity diagrams — one per key user activity/workflow.
- Functional architecture diagram (features, layers, data flow).
- Deployment diagram for a containerized environment (app container, SQLite volume, reverse proxy, env config).
- Per-feature README (see Feature-Driven Architecture above).

### Test Data (`data/`)
Realistic seed datasets MUST be provided for every feature/domain requiring test data. Seed data MUST include enough variety
to exercise RBAC edge cases: users with different profiles, and access-denied scenarios for unauthorized actions. Where
individual permission overrides exist (v2), seed data MUST also cover override scenarios.
Data files MUST be structured (JSON/SQL/seed scripts) and reproducible.

### Utility Scripts (`scripts/`)
The following shell scripts MUST be provided and maintained:
- `seed.sh` — load test data from `data/` into the database.
- `create-user.sh` — create a user with profile/permission assignment interactively or via parameters.
- `reset-db.sh` — wipe the database to a minimal state (schema + reference data only, no business/test data).
- `deploy-vercel.sh` — deploy the application to Vercel.
- `dev-setup.sh` — install deps, generate Prisma client, run migrations, bootstrap local environment.

All scripts MUST be idempotent where possible, documented with usage comments, and fail loudly with clear error messages.

## Decision-making & Roles

### Decision model
- Maintainers hold primary operational authority for repository configuration, release management, and security decisions.
- Day-to-day feature decisions are made by proposal authors and reviewers; significant changes SHOULD follow the RFC process:
  1. Open an RFC as a documented issue or file under /docs/rfcs (summary, motivation, trade-offs, migration plan).
  2. Solicit feedback for 7 calendar days (shorter with explicit maintainer approval for urgent fixes).
  3. A decision is recorded with merged RFC or an issue comment documenting the outcome.

### Roles & responsibilities
- Maintainers: Approve and merge releases, review high-risk PRs, manage repository settings and CODEOWNERS, and act as escalation points.
- Reviewers: Provide timely, constructive reviews and check Constitution compliance in PRs.
- Contributors: Open issues, submit PRs, write tests, and help triage defects.
- Release manager (rotating): Prepare release notes, tag releases, and coordinate publishing.
- Security contact: Report security issues to krystedongmouo@gmail.com.

## Development Workflow & Operational Policies

### Contribution workflow & code review expectations
- Branching: work on short-lived feature branches named using: feature/short-description or fix/short-description.
- PR checklist (required):
  - [ ] Title with concise summary and linked issue (if any).
  - [ ] Description with motivation and changes.
  - [ ] Tests added/updated and passing locally.
  - [ ] Linting/formatting applied where applicable.
  - [ ] Documentation updated (quickstart, docs, or changelog) if user-visible.
  - [ ] Security considerations noted if relevant.
  - [ ] Suggested version bump (MAJOR/MINOR/PATCH) when applicable.

### Branching, CI, testing, and release policy
- Protect the main branch: require passing CI and at least the required approvals before merging.
- Naming: feature/, fix/, hotfix/, release/ prefixes.
- CI: All PRs MUST run automated tests and linters where applicable. Merge only after CI is green.
- Releases: Tag releases with semver. The release manager prepares release notes; maintainers approve for publishing.

### Security and handling secrets
- Do not commit secrets. If secrets are accidentally committed, rotate them immediately and open an incident.
- Use a vetted secrets manager for production secrets and avoid storing credentials in plaintext in repo.
- Include a security review item on PRs that touch secrets, auth, or sensitive data.

### Communication norms and meeting cadence
- Primary coordination channels: GitHub issues, PR comments, and repository discussions. Use email for confidential reports.
- Meeting cadence (recommended): weekly 30-minute triage & planning; monthly roadmap sync as needed. Keep work asynchronous when possible.

### On-call & incident response summary
- Label incidents using issue label: incident.
- Triage promptly, assign an owner, and document impact, mitigation, and next steps in the issue.
- After mitigations, produce a short postmortem within 72 hours and include actions and owners.

### Deprecation & incubation policy
- Incubation: New features may be marked experimental and gated behind a feature flag. Documentation must state the experimental
  status and migration path to stable.
- Deprecation: Announce deprecation in release notes and issue/PR descriptions and provide a migration plan. For public-facing APIs,
  allow at least 90 days' notice before removal; for internal features a 30-day notice is acceptable.

## Governance
This Constitution is the authoritative source for project governance. Amendments follow this process:

1. Propose changes via a pull request updating this document or a dedicated RFC file with rationale and migration plan.
2. Document the required version bump and reasoning (MAJOR/MINOR/PATCH) in the PR description.
3. Allow for a 7-day comment period for non-urgent changes; maintainers may fast-track urgent security fixes.
4. Approval: At least one maintainer plus one additional reviewer for MINOR/PATCH changes. MAJOR changes (breaking governance)
   require at least two maintainers' approvals and a documented migration plan.

Compliance and reviews
- All PRs with material scope MUST include a short "Constitution compliance" note describing how the change satisfies the
  Constitution and listing any gates (tests, security review, observability) required before merge.

**Version**: 1.2.0 | **Ratified**: 2026-07-04 | **Last Amended**: 2026-07-04
