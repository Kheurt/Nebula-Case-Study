# Tasks: Nebula Job Immersion Program Platform

**Branch**: `001-nebula-job-immersion-platform` | **Date**: 2026-07-04
**Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

**Organization**: Tasks are grouped by user story. Each phase is independently implementable and testable.

**Tests**: Unit tests (Vitest) and Playwright E2E are **mandatory** per the constitution. Test tasks are included in every story phase.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (operates on different files, no unresolved dependencies)
- **[Story]**: User story scope (US1…US5). Setup/Foundation tasks carry no story label.

---

## Phase 1: Setup — Project Scaffold & Infrastructure

**Purpose**: Initialize the project, install dependencies, configure tooling. No business logic yet.

- [ ] T001 Scaffold Next.js 14+ project with App Router, TypeScript strict, pnpm, Tailwind CSS (`create-next-app` preset) in repository root
- [ ] T002 Configure TypeScript (`tsconfig.json`): strict mode, path aliases `@/*` → `./src/*`, target ES2022
- [ ] T003 [P] Configure Tailwind CSS (`tailwind.config.ts`), PostCSS, and global styles in `src/app/globals.css`
- [ ] T004 [P] Configure ESLint (Next.js recommended + typescript rules) and Prettier in `.eslintrc.json` and `.prettierrc`
- [ ] T005 Initialize Prisma: `prisma init --datasource-provider sqlite`; replace generated schema with full schema from `data-model.md` in `prisma/schema.prisma`
- [ ] T006 Run initial Prisma migration: `npx prisma migrate dev --name init` to create `prisma/migrations/` and `dev.db`
- [ ] T007 [P] Create PrismaClient singleton in `src/lib/prisma.ts` (global caching pattern for Next.js hot-reload)
- [ ] T008 [P] Create NextAuth configuration in `src/lib/auth.ts`: `CredentialsProvider` with bcryptjs, `@next-auth/prisma-adapter`, `jwt` callback enriching token with `profileName` + `permissions[]` from DB, `session` callback copying to `session.user`
- [ ] T009 [P] Implement permission helpers in `src/lib/permissions.ts`: `hasPermission(session, action)` and `requirePermission(session, action)` (throws on denial with structured log)
- [ ] T010 [P] Create structured JSON logger in `src/lib/logger.ts`: methods `info`, `warn`, `error` emitting `{ level, timestamp, message, ...context }`
- [ ] T011 [P] Create session scheduling utility in `src/lib/session-scheduling.ts`: `suggestSessionDates(startDate, endDate, count)` using `addDays(startDate, Math.round((i * totalDays) / (n - 1)))` (date-fns)
- [ ] T012 Implement Next.js middleware in `src/middleware.ts`: protect `(student)`, `(coach)`, `(admin)` route groups using `getToken()`; redirect to `/login` if unauthenticated
- [ ] T013 [P] Augment next-auth types in `src/types/next-auth.d.ts`: extend `Session.user` with `profileName: string` and `permissions: string[]`
- [ ] T014 [P] Create `.env.example` with `DATABASE_URL=file:./dev.db`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- [ ] T015 [P] Create shared UI primitives in `src/components/ui/`: `Button.tsx`, `Input.tsx`, `Select.tsx`, `Badge.tsx`, `Card.tsx`, `Toast.tsx`, `Skeleton.tsx`
- [ ] T016 [P] Create layout components in `src/components/layout/`: `Navbar.tsx` (shows active user + role, DevRoleSwitcher mount point), `PageShell.tsx` (max-width wrapper + padding)
- [ ] T017 [P] Create root layout in `src/app/layout.tsx` (SessionProvider wrapper, Navbar, Tailwind base)
- [ ] T018 [P] Create `DevRoleSwitcher.tsx` in `src/components/`: rendered only when `process.env.NODE_ENV === 'development'`; renders one button per seeded role; calls `signIn('credentials', { email, password })` on click
- [ ] T019 Configure Vitest in `vitest.config.ts` and `src/test-utils/` (setup file, mock helpers for Prisma)
- [ ] T020 Configure Playwright in `playwright.config.ts`; create `e2e/global-setup.ts` that authenticates as student, coach, and admin and saves `storageState` to `e2e/fixtures/{student,coach,admin}.json`

**Checkpoint**: Project compiles (`pnpm build` passes), DB migrated, auth skeleton in place, test runners configured.

---

## Phase 2: Foundational — Seed & Auth Feature

**Purpose**: Seed the database with profiles/permissions/accounts; implement the complete auth feature (register, login). Required before any user story can be tested independently.

**⚠️ CRITICAL**: No user story work can begin until the seed is functional and auth actions are working.

- [ ] T021 Create Prisma seed script in `prisma/seed.ts`: seed `Profile` (student/coach/admin), `Permission` (program:create, program:edit, program:read, cohort:create, cohort:manage, cohort:read, enrollment:create, exploration:create, exploration:read, admin:read, user:create), `ProfilePermission` links, three `User` accounts (student@nebula.dev/student123!, coach@nebula.dev/coach123!, admin@nebula.dev/admin123!) with bcryptjs-hashed passwords and `UserProfile` assignments
- [ ] T022 [P] Create sample seed data in `data/seed-programs.json`: one published program with one cohort, three sessions, to support independent testing
- [ ] T023 [P] Create dev shell scripts: `scripts/dev-setup.sh` (install + prisma generate + migrate + seed), `scripts/seed.sh` (seed only), `scripts/reset-db.sh` (drop + migrate + seed)
- [ ] T024 [P] Create auth Zod schemas in `src/features/auth/schemas/index.ts`: `registerSchema` (name min 2, email valid, password min 8), `loginSchema`, `createUserSchema`
- [ ] T025 Implement `registerStudent` server action in `src/features/auth/actions/register.ts`: hash password with bcryptjs, create `User` + `UserProfile` → student profile, catch unique email violation, log attempt
- [ ] T026 [P] Implement `/register` page in `src/app/(public)/register/page.tsx`: public; `RegisterForm` component in `src/features/auth/components/RegisterForm.tsx` using react-hook-form + zodResolver; on success redirect to `/login`
- [ ] T027 [P] Implement `/login` page in `src/app/(public)/login/page.tsx`: `LoginForm` component in `src/features/auth/components/LoginForm.tsx`; calls `signIn('credentials', ...)` from next-auth/react
- [ ] T028 Create NextAuth API route in `src/app/api/auth/[...nextauth]/route.ts` (re-exports handler from `src/lib/auth.ts`)
- [ ] T029 Unit tests in `src/features/auth/__tests__/register.test.ts`: schema validation (invalid email, short password), duplicate email error handling, password never stored in plaintext
- [ ] T030 Playwright E2E auth fixtures: extend `e2e/global-setup.ts` to use the seeded accounts; verify `storageState` files generated for student, coach, admin

**Checkpoint**: `pnpm db:seed` runs; three test accounts exist; `/register` and `/login` work; Playwright auth fixtures ready; unit tests pass.

---

## Phase 3: User Story 1 — Student Browses and Enrolls (Priority: P1) 🎯 MVP

**Goal**: A student logs in, browses published programs (with domain filter), views program detail with cohort availability, enrolls in an open cohort, and lands on My Programs.

**Independent Test**: Seed one published program with one open cohort + student account. Student can browse, enroll, and see cohort on My Programs — no coach or admin interaction needed.

### Implementation — Programs (Read side)

- [ ] T031 [P] [US1] Create program Zod schemas in `src/features/programs/schemas/index.ts`: `programFilterSchema` (domain?, search?)
- [ ] T032 [P] [US1] Implement `getPublishedPrograms(filters?)` server action in `src/features/programs/actions/get-published-programs.ts`: returns only `PUBLISHED` programs; applies domain and search filters; requires `program:read` permission (or public)
- [ ] T033 [P] [US1] Implement `getProgramDetail(programId)` server action in `src/features/programs/actions/get-program-detail.ts`: returns program + cohorts with remaining slots; hides DRAFT/ARCHIVED from non-coach callers
- [ ] T034 [US1] Implement programs catalog page in `src/app/(public)/programs/page.tsx`: lists published programs, domain filter UI, search field, empty state with CTA
- [ ] T035 [P] [US1] Implement `ProgramCard` component in `src/features/programs/components/ProgramCard.tsx`: shows title, domain badge, coach name, difficulty, session count, and "View Program" link
- [ ] T036 [US1] Implement program detail page in `src/app/(public)/programs/[id]/page.tsx`: shows full program info + list of cohorts (dates, spots remaining, enrollment status badge, EnrollButton)

### Implementation — Enrollment

- [ ] T037 [P] [US1] Create enrollment Zod schemas in `src/features/enrollment/schemas/index.ts`: `enrollSchema` (cohortId string)
- [ ] T038 [US1] Implement `enrollInCohort(cohortId)` server action in `src/features/enrollment/actions/enroll.ts`: runs inside `$transaction`; re-fetches cohort, checks `OPEN` status + remaining capacity, creates `Enrollment`, auto-updates cohort to `FULL` if capacity reached; requires `enrollment:create` permission; logs enrollment event
- [ ] T039 [US1] Implement `getMyEnrollments()` server action in `src/features/enrollment/actions/get-my-enrollments.ts`: returns enrolled cohorts with program info, coach name, session schedule (ordered by `orderIndex`), explorations
- [ ] T040 [US1] Implement `EnrollButton` component in `src/features/enrollment/components/EnrollButton.tsx`: handles loading state; surfaces typed errors (full, closed, already enrolled, unauthenticated redirect)
- [ ] T041 [US1] Implement My Programs page in `src/app/(student)/my-programs/page.tsx`: lists enrolled cohorts; per cohort shows program title, coach name, dates, session schedule (ordered), enrolled count, assigned explorations

### Tests

- [ ] T042 [US1] Unit tests in `src/features/enrollment/__tests__/enroll.test.ts`: duplicate enrollment rejection, cohort full rejection, capacity boundary (maxParticipants - 1, maxParticipants, maxParticipants + 1 attempt), `CLOSED` cohort rejection, auto-FULL transition
- [ ] T043 [US1] Unit tests in `src/features/programs/__tests__/get-published.test.ts`: DRAFT/ARCHIVED programs excluded, domain filter, search filter
- [ ] T044 [US1] Playwright E2E in `e2e/enrollment.spec.ts`: using student storageState — browse catalog → filter by domain → open program detail → enroll → verify cohort appears on My Programs; verify enroll button disabled on full cohort; verify duplicate enrollment message

**Checkpoint**: US1 acceptance scenarios 1–5 all pass. MVP is fully functional.

---

## Phase 4: User Story 2 — Coach Creates Programs, Cohorts, and Sessions (Priority: P1)

**Goal**: A coach creates a program (Draft → Published), creates a cohort with exactly N sessions within date bounds, and views enrolled students per cohort.

**Independent Test**: Using coach account, create program → publish → create cohort with sessions. Verify program appears in catalog and cohort is enrollable.

### Implementation — Programs (Write side)

- [ ] T045 [P] [US2] Extend program Zod schemas in `src/features/programs/schemas/index.ts`: `createProgramSchema`, `updateProgramSchema`; validate sessionCount (2–4), maxCohortSize (1–20), learningOutcomes (min 1)
- [ ] T046 [P] [US2] Implement `createProgram(input)` server action in `src/features/programs/actions/create-program.ts`: creates program in `DRAFT`, assigns `coachId` from session; requires `program:create` permission; logs creation
- [ ] T047 [P] [US2] Implement `updateProgram(programId, input)` server action in `src/features/programs/actions/update-program.ts`: enforces ownership (coach can only edit own programs); delegates to `statusGuard` service for status transitions; rejects `sessionCount` changes if cohorts exist
- [ ] T048 [P] [US2] Implement status transition guard service in `src/features/programs/services/status-guard.ts`: validates `Draft→Published→Archived` flow; blocks `Published→Draft` if cohorts exist; blocks `ARCHIVED` if any cohort has active enrollments (lists blocking cohorts in error)
- [ ] T049 [US2] Implement `getCoachPrograms()` server action in `src/features/programs/actions/get-coach-programs.ts`: returns own programs (all statuses); requires `program:edit` permission
- [ ] T050 [P] [US2] Implement `ProgramForm` component in `src/features/programs/components/ProgramForm.tsx`: react-hook-form + zodResolver; fields for all FR-001 attributes; status select (coach-only); learning outcomes dynamic list
- [ ] T051 [US2] Implement coach programs list page in `src/app/(coach)/coach/programs/page.tsx`: shows own programs with status badge, edit link, create new button
- [ ] T052 [US2] Implement create program page in `src/app/(coach)/coach/programs/new/page.tsx`: wraps `ProgramForm` for creation flow
- [ ] T053 [US2] Implement coach program detail/edit page in `src/app/(coach)/coach/programs/[id]/page.tsx`: edit form pre-filled, status change controls, cohort list, create cohort link, exploration creation section

### Implementation — Cohorts & Sessions

- [ ] T054 [P] [US2] Create cohort Zod schemas in `src/features/cohorts/schemas/index.ts`: `createCohortSchema` (startDate, endDate, maxParticipants 1–20, sessions array); refine: `endDate > startDate`, sessions.length must equal program.sessionCount, each session.scheduledAt within cohort period
- [ ] T055 [P] [US2] Implement `createCohort(programId, input)` server action in `src/features/cohorts/actions/create-cohort.ts`: verifies program is `PUBLISHED` and coach owns it; validates session count and date ranges via `sessionValidator` service; creates cohort + sessions in one `$transaction`; requires `cohort:create` permission
- [ ] T056 [P] [US2] Implement `updateCohortStatus(cohortId, status)` server action in `src/features/cohorts/actions/update-cohort-status.ts`: coach manually sets `OPEN`/`CLOSED`; ownership check; requires `cohort:manage`
- [ ] T057 [P] [US2] Implement `getCohortDetail(cohortId)` server action in `src/features/cohorts/actions/get-cohort-detail.ts`: for coaches returns enrolled student list; for students returns session schedule + explorations
- [ ] T058 [P] [US2] Implement `suggestSessionDates(input)` server action in `src/features/cohorts/actions/suggest-session-dates.ts`: delegates to `src/lib/session-scheduling.ts`; requires `cohort:create`; no DB write
- [ ] T059 [P] [US2] Implement session date range validation service in `src/features/cohorts/services/session-validator.ts`: checks count matches `sessionCount`, all dates within cohort period, no duplicate `orderIndex`
- [ ] T060 [US2] Implement `CohortForm` component with `SessionScheduler` UI in `src/features/cohorts/components/CohortForm.tsx`: date pickers for start/end; "Suggest Dates" button calling `suggestSessionDates`; session rows (editable date, title, description, duration)
- [ ] T061 [US2] Implement coach cohort detail page in `src/app/(coach)/coach/cohorts/[id]/page.tsx`: session schedule display, enrolled students table (name + enrolled date), enrollment status badge, open/close toggle

### Auth — Admin User Creation

- [ ] T062 [P] [US2] Implement `createUser(input)` server action in `src/features/auth/actions/create-user.ts`: admin-only (`user:create` permission); creates user with specified profile (student/coach/admin); bcryptjs hash; duplicate email guard
- [ ] T063 [P] [US2] Create `scripts/create-user.sh`: accepts `--name`, `--email`, `--password`, `--profile`; calls `prisma db execute` or ts-node seed helper

### Tests

- [ ] T064 [US2] Unit tests in `src/features/programs/__tests__/status-guard.test.ts`: all FR-003 transitions (Draft→Published ✅, Published→Draft with no cohorts ✅, Published→Draft with cohorts ❌, Published→Archived with active enrollments ❌, Archived→Published ❌), FR-004 sessionCount change rejection
- [ ] T065 [US2] Unit tests in `src/features/cohorts/__tests__/session-validator.test.ts`: session count mismatch, date out of range, auto-suggest algorithm correctness (3 sessions, uneven period)
- [ ] T066 [US2] Playwright E2E in `e2e/coach-programs.spec.ts`: using coach storageState — create program → publish → create cohort (use suggest dates) → verify program visible in student catalog → verify cohort enrollable; test FR-004b (archive blocked by active enrollment)

**Checkpoint**: US2 acceptance scenarios 1–6 all pass. Full supply-side (coach) and demand-side (student) flow working end-to-end.

---

## Phase 5: User Story 3 — Coach Adds Explorations (Priority: P2)

**Goal**: A coach attaches take-home tasks (Explorations) to a program or session. Enrolled students can view them on My Programs.

**Independent Test**: Create an Exploration linked to a published program; enroll a student; verify the student sees the Exploration on their My Programs page.

- [ ] T067 [P] [US3] Create exploration Zod schemas in `src/features/explorations/schemas/index.ts`: `createExplorationSchema` (title, description, optional dueDate, optional programId XOR sessionId)
- [ ] T068 [P] [US3] Implement `createExploration(input)` server action in `src/features/explorations/actions/create-exploration.ts`: verifies coach owns the linked program/session; requires `exploration:create` permission; logs creation
- [ ] T069 [P] [US3] Implement `getExplorationsForEnrolled(cohortId)` server action in `src/features/explorations/actions/get-explorations.ts`: verifies student is enrolled in cohort; returns explorations linked to cohort's program and its sessions; requires `exploration:read`
- [ ] T070 [US3] Implement `ExplorationForm` component in `src/features/explorations/components/ExplorationForm.tsx`: react-hook-form + zodResolver; program vs. session link toggle; optional due date picker
- [ ] T071 [US3] Integrate exploration creation UI into coach program detail page `src/app/(coach)/coach/programs/[id]/page.tsx`: expandable section listing existing explorations + add button
- [ ] T072 [US3] Display assigned explorations on student My Programs page `src/app/(student)/my-programs/page.tsx`: per cohort section lists explorations (title, description, due date if set, linked session label)
- [ ] T073 [US3] Unit tests in `src/features/explorations/__tests__/explorations.test.ts`: coach ownership check (another coach's program rejected), enrollment gate (non-enrolled student denied), both `programId` and `sessionId` null rejected

**Checkpoint**: US3 acceptance scenarios 1–3 all pass. Coach can manage Explorations; students see them on enrollment-gated pages.

---

## Phase 6: User Story 4 — Admin Views Platform Dashboard (Priority: P2)

**Goal**: Admin sees live metrics on `/admin`, a full cohorts view on `/admin/cohorts`, and user management on `/admin/users`.

**Independent Test**: Seed programs, cohorts (upcoming/active/past), enrollments. Verify each metric matches seeded counts; verify `/admin/cohorts` lists all cohorts with correct period classification.

- [ ] T074 [P] [US4] Define admin service types in `src/features/admin/services/types.ts`: `DashboardStats`, `CohortRow` (with period: `UPCOMING | ACTIVE | PAST`), `UserRow`
- [ ] T075 [P] [US4] Implement `getDashboardStats()` server action in `src/features/admin/actions/get-dashboard-stats.ts`: single multi-model query for total programs, published programs, active cohorts (`startDate<=today<=endDate`), total enrollments, total students, total coaches, upcoming sessions (next 7 days), latest 10 enrollments; requires `admin:read`
- [ ] T076 [P] [US4] Implement `getAllCohorts()` server action in `src/features/admin/actions/get-all-cohorts.ts`: returns all cohorts across all programs; computes period classification per row; includes program name, coach name, enrollment status, participant count; requires `admin:read`
- [ ] T077 [P] [US4] Implement `listUsers()` server action in `src/features/admin/actions/list-users.ts`: returns all users with profile name; requires `admin:read`
- [ ] T078 [US4] Implement admin dashboard page in `src/app/(admin)/admin/page.tsx`: stat cards grid (`DashboardStats`), upcoming sessions list, latest enrollments table, link to `/admin/cohorts` and `/admin/users`
- [ ] T079 [P] [US4] Implement `DashboardStats` component in `src/features/admin/components/DashboardStats.tsx`: renders metric cards with label + value + optional icon
- [ ] T080 [US4] Implement admin cohorts page in `src/app/(admin)/admin/cohorts/page.tsx`: sortable table showing all cohorts; columns: program, coach, dates, enrollment status badge, period badge, participant count
- [ ] T081 [P] [US4] Implement `CohortTable` component in `src/features/admin/components/CohortTable.tsx`: client component with column sort; period badge colours (Upcoming=blue, Active=green, Past=gray)
- [ ] T082 [US4] Implement admin users page in `src/app/(admin)/admin/users/page.tsx`: list all users (name, email, profile, created date); inline create user form using `createUser` action
- [ ] T083 [US4] Unit tests in `src/features/admin/__tests__/dashboard.test.ts`: active cohort definition edge cases (startDate = today ✅, endDate = today ✅, endDate = yesterday ❌, startDate = tomorrow ❌), period classification for all three states, stat count accuracy
- [ ] T084 [US4] Playwright E2E in `e2e/admin.spec.ts`: admin storageState — access `/admin` and verify metric cards present; navigate to `/admin/cohorts` and verify all seeded cohorts listed with correct period; using student/coach storageState verify `/admin` redirects (permission boundary)

**Checkpoint**: US4 acceptance scenarios 1–4 all pass. Admin has full operational visibility.

---

## Phase 7: User Story 5 — Exploration Submission & Coach Feedback (Priority: P3 — Bonus)

**Goal**: Student submits a text response to an Exploration; coach adds feedback on the submission.

**Independent Test**: Submit a response as a student; add feedback as coach; verify student can read the feedback.

*Implement only after P1 and P2 flows are stable.*

- [ ] T085 [P] [US5] Extend exploration Zod schemas with `submitResponseSchema` (responseText min 1, max 2000) and `addFeedbackSchema` (coachFeedback min 1, max 1000) in `src/features/explorations/schemas/index.ts`
- [ ] T086 [P] [US5] Implement `submitExplorationResponse(explorationId, input)` server action in `src/features/explorations/actions/submit-response.ts`: requires `exploration:read` (enrolled student only); creates `ExplorationSubmission`; prevents duplicate submission (one per student per exploration)
- [ ] T087 [P] [US5] Implement `addCoachFeedback(submissionId, input)` server action in `src/features/explorations/actions/add-feedback.ts`: requires `exploration:create`; coach must own the linked program; updates `ExplorationSubmission.coachFeedback`
- [ ] T088 [US5] Implement `SubmissionForm` component in `src/features/explorations/components/SubmissionForm.tsx`: textarea + submit button; shows existing submission text if already submitted; hides form after submission
- [ ] T089 [US5] Implement `FeedbackForm` component in `src/features/explorations/components/FeedbackForm.tsx`: coach-only textarea; shows existing feedback; inline save
- [ ] T090 [US5] Integrate student submission UI into `src/app/(student)/my-programs/page.tsx`: per-exploration `SubmissionForm`; display coach feedback below if present
- [ ] T091 [US5] Integrate coach feedback UI into `src/app/(coach)/coach/cohorts/[id]/page.tsx`: per student per exploration row, `FeedbackForm`
- [ ] T092 [US5] Unit tests in `src/features/explorations/__tests__/submissions.test.ts`: duplicate submission rejection, coach feedback ownership check, non-enrolled student blocked

**Checkpoint**: US5 bonus scenarios 1–2 pass. Submission → feedback loop fully functional.

---

## Final Phase: Polish & Deliverables

**Purpose**: Loading/error states, remaining E2E coverage, required case study documents, deployment.

- [ ] T093 Add `loading.tsx` files (Skeleton fallback) to all data-fetching route segments: `(public)/programs/`, `(student)/my-programs/`, `(coach)/coach/programs/`, `(coach)/coach/cohorts/[id]/`, `(admin)/admin/`, `(admin)/admin/cohorts/`
- [ ] T094 [P] Add `error.tsx` files per route group to catch server component errors and display user-friendly messages
- [ ] T095 [P] Add empty state components: programs catalog (no published programs), coach programs list (no programs yet), admin cohorts (no cohorts), My Programs (not enrolled anywhere)
- [ ] T096 Playwright E2E in `e2e/programs.spec.ts`: program status transition guards — verify Draft program not in catalog, verify ARCHIVED program not in catalog, verify Published→Draft blocked when cohort exists (coach UI shows error)
- [ ] T097 Extend `e2e/coach-programs.spec.ts`: add test for sessionCount mismatch rejection (submit cohort with wrong session count), date out-of-range rejection
- [ ] T098 Verify `pnpm test:ci` single command runs Vitest unit tests + Playwright E2E; update `package.json` scripts: `"test:unit"`, `"test:e2e"`, `"test:ci"` (unit + e2e sequential)
- [ ] T099 Write `README.md` at repo root: project overview, local setup (`sh scripts/dev-setup.sh`), architecture overview, test commands (`pnpm test:ci`), seed accounts, deployment
- [ ] T100 [P] Write `AI_USAGE.md` at repo root (required by case study): document which AI tools were used, for which tasks, what was accepted/modified
- [ ] T101 [P] Write `PRODUCT_NOTES.md` at repo root (required by case study): product decisions, trade-offs, what would be different in a production system
- [ ] T102 [P] Create `scripts/deploy-vercel.sh`: `vercel env pull`, `prisma migrate deploy`, `vercel --prod` (with pre-flight checks)
- [ ] T103 Security review: audit enrollment route (capacity race condition under load), auth callbacks (token injection), all `requirePermission()` call sites, Zod coverage on every server action input; document findings in `docs/security-review.md`

---

## Dependencies

```
Phase 1 (Setup)
    └── Phase 2 (Foundation/Auth)
            └── Phase 3 (US1 — Student Enrollment) 🎯 MVP
            └── Phase 4 (US2 — Coach Programs/Cohorts)
                    └── Phase 3 fully usable end-to-end (real published programs)
                            ├── Phase 5 (US3 — Explorations)
                            └── Phase 6 (US4 — Admin Dashboard)
                                    └── Phase 7 (US5 — Bonus Submissions/Feedback)
                                                └── Final Phase (Polish & Deliverables)
```

**Phase 3 and Phase 4 share a dependency**: Phase 3 (read side) can be developed against seeded data; Phase 4 (write side) must complete before full end-to-end flows without seed data are possible.

**Phase 5 and Phase 6 can be developed in parallel** once Phase 4 is complete.

---

## Parallel Execution

Tasks marked `[P]` within the same phase can be executed concurrently (they target different files with no cross-task dependencies):

| Phase | Parallelizable task groups |
|---|---|
| Phase 1 | T003, T004 (config) \| T007, T008, T009, T010, T011 (lib files) \| T015, T016, T018 (components) |
| Phase 2 | T022, T023, T024 (scripts + schemas) after T021 (seed) |
| Phase 3 | T031, T032, T033, T037 (read actions + schemas) \| T035 (ProgramCard) |
| Phase 4 | T045, T046 (schemas + create action) \| T054, T055, T056, T057, T058, T059 (cohort actions) |
| Phase 5 | T067, T068, T069 (schemas + actions) |
| Phase 6 | T074, T075, T076, T077 (actions + types) \| T079, T081 (UI components) |
| Phase 7 | T085, T086, T087 (bonus schemas + actions) |
| Final   | T100, T101, T102 (docs + deploy script) |

---

## Implementation Strategy

| Milestone | Scope | Deliverable |
|---|---|---|
| **MVP** | Phase 1 + 2 + 3 | Student can browse and enroll; core auth works |
| **Full P1** | + Phase 4 | Coach can create; full supply+demand cycle |
| **P2** | + Phase 5 + 6 | Explorations + Admin dashboard |
| **P3 Bonus** | + Phase 7 | Submission/feedback loop |
| **Ship** | + Final Phase | Polish, docs, deployment |

---

## Summary

| Metric | Value |
|---|---|
| **Total tasks** | 103 |
| **Setup (Phases 1–2)** | 30 tasks |
| **US1 — Student enrollment (P1)** | 14 tasks |
| **US2 — Coach programs/cohorts (P1)** | 23 tasks |
| **US3 — Explorations (P2)** | 7 tasks |
| **US4 — Admin dashboard (P2)** | 11 tasks |
| **US5 — Submissions/feedback (P3)** | 8 tasks |
| **Polish & deliverables** | 11 tasks |
| **Parallelizable tasks** | 53 tasks (`[P]`) |
| **MVP scope** | Phases 1–3 (T001–T044) |
