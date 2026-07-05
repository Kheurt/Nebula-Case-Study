# Feature Specification: Nebula Job Immersion Program Platform

**Feature Branch**: `001-nebula-job-immersion-platform`

**Created**: 2026-07-04

**Status**: Draft

**Source**: Nebula Full-Stack Case Study — Job Immersion Program Platform (PDF)

---

## User Scenarios & Testing *(mandatory)*

### Constitution Compliance

| Constitution Principle | Application to this feature |
|---|---|
| Tech Stack & Architecture | Next.js App Router, TypeScript strict, SQLite, Prisma, NextAuth, Tailwind CSS, Zod, Feature-Driven Architecture |
| Authentication & Authorization (RBAC) | Three profiles (Student, Coach, Admin) with explicit permissions; RBAC entities modeled in DB |
| Security & Data Protection | All inputs validated via Zod; server actions check permissions before executing; no raw queries |
| Test-First & Quality | Unit tests for business rules (enrollment limits, session date constraints); Playwright E2E per feature |
| Observability & Operational Readiness | Structured logs for enrollment events, permission denials, auth attempts |

**Required gates before merge**: security review (enrollment route, auth callbacks), Playwright suite green, seed data present.

> ⚠️ **Conflicts resolved** — see dedicated section at the bottom of this document for decisions and rationale.

---

## Clarifications

### Session 2026-07-04

- Q: What are the allowed program status transitions, and what happens when archiving a program with active enrollments? → A: Option B — unidirectional with guard: `Draft → Published → Archived` only; `Published → Draft` is allowed only if no cohort has been created yet; archiving is blocked if any cohort has active enrollments — the coach must close all cohorts first.
- Q: How should concurrent enrollment attempts be protected against race conditions and duplicates? → A: Option A — DB-level `UNIQUE(studentId, cohortId)` constraint on `Enrollment` table + capacity check inside a Prisma `$transaction`. The DB rejects any duplicate at the constraint level; the application catches the error and surfaces a clear user message.
- Q: Is student self-registration in scope, and how are coach/admin accounts created? → A: Public `/register` page for students (email + password), account auto-assigned to Student profile. Coaches and admins are created via `create-user.sh`, seed scripts, OR through a dedicated admin interface (user management section within `/admin`).
- Q: What is the definition of "active cohort" for the admin dashboard metric? → A: `startDate <= today <= endDate` regardless of enrollment status. Additionally, the admin MUST have access to a full cohorts view (separate page or expandable section) showing all cohorts with their individual status (Open / Full / Closed) and period (upcoming / active / past).
- Q: Can a single user hold multiple profiles (e.g., be both Coach and Student)? → A: No — one profile per user, enforced by a `UNIQUE(userId)` constraint on `UserProfile`. A coach who wants to participate as a student must create a separate account. Constitution upheld.

---

### User Story 1 — Student browses and enrolls in a program cohort (Priority: P1)

A student logs in, browses the list of published Job Immersion Programs, filters by domain or coach, opens a program detail page to see available cohorts with their dates and remaining spots, and enrolls in one open cohort. After enrollment, the student lands on "My Programs" where they can see the program, the coach, cohort dates, the session schedule, and any assigned Explorations.

**Why this priority**: Core value proposition of the platform — without this flow nothing else matters.

**Independent Test**: Seed one published program with one open cohort and one student account. The student can browse, enroll, and see the cohort on "My Programs" without any coach or admin interaction.

**Acceptance Scenarios**:

1. **Given** a published program with an open cohort (slots remaining), **When** a student clicks "Enroll", **Then** the student is added to the cohort, the remaining slot count decreases by 1, and the cohort appears on "My Programs".
2. **Given** a cohort that is full (no slots remaining), **When** a student attempts to enroll, **Then** the system rejects the request with a clear message and the enrollment count remains unchanged.
3. **Given** a student already enrolled in a cohort, **When** the student attempts to enroll again in the same cohort, **Then** the system rejects the duplicate enrollment with a clear message.
4. **Given** a program with status Draft or Archived, **When** a student browses the catalog, **Then** that program does NOT appear in the list.
5. **Given** a student on the programs page, **When** the student filters by domain (e.g., "Finance"), **Then** only published programs matching that domain are shown.

---

### User Story 2 — Coach creates a program, cohorts, and sessions (Priority: P1)

A coach logs in, creates a new Job Immersion Program with all required fields (title, description, domain, target audience, difficulty, session count 2–4, recommended/max cohort size, learning outcomes), sets its status to Published. The coach then creates one or more cohorts for that program, defining start/end dates, max participants, and scheduling the exact number of sessions distributed within the cohort period (with automatic date suggestion as a bonus). The coach can view the list of students enrolled in each cohort.

**Why this priority**: Without program creation there is nothing for students to discover. Coach flow is the supply side of the platform.

**Independent Test**: Using a coach account, create a program and publish it. Create one cohort with sessions. Verify the program appears in the student catalog and the cohort is enrollable.

**Acceptance Scenarios**:

1. **Given** a coach on the "Create Program" form, **When** the coach submits with all valid fields, **Then** a new program is created in Draft status and appears in the coach's program list.
2. **Given** a program in Draft status, **When** the coach changes status to Published, **Then** the program becomes visible to students.
3. **Given** a published program with `sessionCount = 3`, **When** a coach creates a cohort and schedules sessions, **Then** the cohort must have exactly 3 sessions; submitting with 2 or 4 sessions is rejected.
4. **Given** a cohort with start date July 1 and end date July 15, **When** a coach schedules a session with date July 20, **Then** the system rejects the session with a clear error (date outside cohort period).
5. **Given** a cohort with `maxParticipants = 5` and 5 enrolled students, **When** the coach views the cohort, **Then** the enrollment status shows "Full" and no further enrollments are accepted.
6. **Given** a coach viewing a cohort detail, **When** the page loads, **Then** the coach sees the list of enrolled students (name, enrollment date).

---

### User Story 3 — Coach adds Explorations to a program or session (Priority: P2)

A coach creates optional take-home tasks ("Explorations") linked to a program or to a specific session, with an optional due date. Students enrolled in the corresponding cohort can view the assigned Explorations.

**Why this priority**: Explorations add learning depth but are explicitly optional in the spec. They do not block the core enrollment flow.

**Independent Test**: Create an Exploration linked to a published program. Enroll a student. Verify the student sees the Exploration on their program detail page.

**Acceptance Scenarios**:

1. **Given** a coach on a program detail page, **When** the coach adds an Exploration with a title and description, **Then** the Exploration is saved and linked to that program.
2. **Given** an Exploration linked to Session 2 of a cohort, **When** a student enrolled in that cohort views their session schedule, **Then** the Exploration appears linked to Session 2.
3. **Given** a student NOT enrolled in a cohort, **When** they attempt to access Explorations for that cohort, **Then** access is denied.

---

### User Story 4 — Admin views platform activity dashboard (Priority: P2)

A Nebula admin logs in and views a dashboard displaying key operational metrics: total programs, published programs, active cohorts, total enrollments, total students, total coaches, upcoming sessions (next 7 days), and latest enrollments.

**Why this priority**: Operational visibility is required but does not block student or coach workflows.

**Independent Test**: Seed the database with programs, cohorts (upcoming, active, past), enrollments. Verify each metric on the dashboard matches the seeded counts, and verify the full cohorts view at `/admin/cohorts` lists all cohorts with correct status and period classification.

**Acceptance Scenarios**:

1. **Given** an admin user, **When** they access `/admin`, **Then** they see all required metrics with correct counts, where "active cohorts" means cohorts whose `startDate <= today <= endDate`.
2. **Given** a non-admin user (student or coach), **When** they attempt to access `/admin`, **Then** they are redirected and access is denied.
3. **Given** a new enrollment just created, **When** the admin refreshes the dashboard, **Then** the enrollment appears in "Latest Enrollments" and the total count is incremented.
4. **Given** an admin on the dashboard, **When** they navigate to `/admin/cohorts`, **Then** they see all cohorts across all programs with their status (Open / Full / Closed) and period (Upcoming / Active / Past).

---

### User Story 5 — Exploration submission and coach feedback (Priority: P3 — Bonus)

A student submits a short text response to an assigned Exploration. The coach can view the response and add a short feedback comment.

**Why this priority**: Explicitly marked as a bonus in the case study. Valuable for engagement but not core.

**Independent Test**: Submit a response to an Exploration as a student. As a coach, view the response and add feedback.

**Acceptance Scenarios**:

1. **Given** a student enrolled in a cohort with an active Exploration, **When** the student submits a text response, **Then** the response is saved and the student sees a confirmation.
2. **Given** a coach viewing a student's response, **When** the coach adds a feedback comment, **Then** the comment is saved and the student can view it on their Exploration page.

---

### Edge Cases

- What happens when a cohort reaches capacity during concurrent enrollments? Resolved: a DB-level `UNIQUE(studentId, cohortId)` constraint on `Enrollment` combined with a Prisma `$transaction` that checks remaining capacity before inserting. The constraint is the final safety net; the transaction prevents over-enrollment.
- What happens when a coach tries to create a cohort for a Draft or Archived program? → must be rejected; only Published programs accept cohorts.
- What happens when a coach deletes or archives a program that has enrolled students? → Archiving is **blocked** if any cohort has active enrollments. The error message MUST list the blocking cohorts. The coach must set those cohorts to Closed before archiving the program.
- What happens when `sessionCount` is changed on a program that already has cohorts? → must be prevented or cohorts must be re-validated.
- What happens when a student tries to enroll in a Closed cohort? → rejected with status-specific message.
- What happens with an empty program catalog? → clear empty state with a call-to-action.

---

## Requirements *(mandatory)*

### Functional Requirements

**Programs**

- **FR-001**: A coach MUST be able to create a program with: title, description, domain (enum), target audience (free text or enum), difficulty level (Beginner / Intermediate / Advanced), session count (integer, 2–4), recommended cohort size (default 3), maximum cohort size (1–20), learning outcomes (list), and status (Draft / Published / Archived).
- **FR-002**: Only Published programs MUST be visible to students. Draft and Archived programs are only visible to their owning coach and admins.
- **FR-003**: A coach MUST be able to edit basic program information (title, description, outcomes). Status transitions
  follow a strict unidirectional flow: `Draft → Published → Archived`. A Published program MAY be reverted to Draft
  ONLY if no cohort has been created for it yet. Once a cohort exists, the program is locked at Published or above.
- **FR-004**: A coach MUST NOT be able to change `sessionCount` on a program that already has associated cohorts.
- **FR-004b**: A coach MUST NOT be able to Archive a program while any of its cohorts has at least one active
  enrollment. The system MUST surface a blocking error listing the cohorts that must be closed first.

**Cohorts**

- **FR-005**: A coach MUST be able to create one or more cohorts for a Published program, specifying: start date, end date, maximum participants (1–20), and sessions.
- **FR-006**: End date MUST be strictly after start date.
- **FR-007**: A cohort MUST contain exactly the same number of sessions as the program's `sessionCount`.
- **FR-008**: Each session date MUST fall within the cohort start–end date range (inclusive).
- **FR-009**: Cohort enrollment status MUST be Open / Full / Closed. Status MUST automatically shift to Full when enrollments reach `maxParticipants`.

**Sessions**

- **FR-010**: Each session MUST have: title, description, date/time, duration (default 45 min), and order index (1-based).
- **FR-011**: Sessions MUST be displayed in order to both students and coaches.
- **FR-012** *(Bonus)*: When creating a cohort, the system SHOULD propose evenly distributed session dates between start and end date.

**Enrollment**

- **FR-013**: A student MUST be able to enroll in an Open cohort (enrollment status = Open and slots remaining).
  The enrollment MUST be executed inside a Prisma `$transaction` that (1) re-checks remaining capacity and
  (2) inserts the `Enrollment` row. A DB-level `UNIQUE(studentId, cohortId)` constraint MUST exist as the
  final safety net against race conditions.
- **FR-014**: A student MUST NOT be able to enroll twice in the same cohort.
- **FR-015**: A student MUST NOT be able to enroll in a Full or Closed cohort.
- **FR-016**: After enrollment, the student MUST see on "My Programs": program title, coach name, cohort dates, session schedule, enrolled participant count, and any assigned Explorations.

**Explorations**

- **FR-017**: A coach MUST be able to create Explorations linked to a program or a specific session, with: title, description, optional due date.
- **FR-018**: Students enrolled in a cohort MUST be able to view Explorations linked to that cohort's program or sessions.
- **FR-019** *(Bonus)*: A student MUST be able to submit a short text response to an Exploration.
- **FR-020** *(Bonus)*: A coach MUST be able to add a text feedback comment on a student's Exploration submission.

**Admin Dashboard**

- **FR-021**: An admin MUST see on the main dashboard: total programs, published programs count, **active cohorts
  count** (`startDate <= today <= endDate`), total enrollments, total students, total coaches, upcoming sessions
  (next 7 days), latest enrollments (most recent 10).
- **FR-021b**: An admin MUST have access to a full cohorts view (accessible from the dashboard, e.g. `/admin/cohorts`)
  listing ALL cohorts across all programs, each showing: program name, coach name, start date, end date, enrollment
  status (Open / Full / Closed), period classification (Upcoming / Active / Past), and enrolled participant count.
- **FR-022**: Access to `/admin` MUST be restricted to users with the Admin profile.

**Authentication & Authorization**

- **FR-023**: Authentication MUST use NextAuth (Auth.js) with `@auth/prisma-adapter`. User identities, sessions,
  accounts, profiles, and permissions are ALL stored in the SQLite database. At login, the `jwt` callback queries
  the DB to attach the user's profile and permission list to the session token. No mock, no in-memory role —
  everything is DB-backed.
  In development/testing environments, a **dev role switcher** UI component (gated by `NODE_ENV === 'development'`)
  MAY be displayed: it calls `signIn()` on behalf of a pre-seeded DB account with one click, enabling fast role
  switching without re-entering credentials.
- **FR-023b**: A public `/register` page MUST allow any visitor to create a Student account (email + password).
  The account MUST be automatically assigned the Student profile upon creation. Email uniqueness MUST be enforced
  at the DB level; a clear error MUST be shown if the email is already registered.
- **FR-023c**: Coach and Admin accounts MUST NOT be self-registered publicly. They MUST be created via one of:
  (1) the `create-user.sh` script, (2) the seed script, or (3) an admin user management interface accessible
  only to users with the Admin profile (within `/admin/users`).
- **FR-024**: All server actions and API routes MUST verify the user's session and permission before executing any business logic.
- **FR-025**: Coaches MUST only be able to manage their own programs and cohorts. A coach MUST NOT access another coach's programs.
- **FR-026**: Each user MUST have exactly one profile. Multi-profile assignment MUST be rejected at the DB level
  via a `UNIQUE(userId)` constraint on `UserProfile`. A coach who wishes to participate as a student must
  register a separate student account.

### Key Entities

- **User**: base identity — id, name, email, hashed password, created/updated timestamps.
- **Profile**: named collection of permissions — id, name (Student / Coach / Admin).
- **Permission**: atomic access grant — id, resource, action (e.g. `program:create`, `cohort:manage`, `enrollment:create`, `admin:read`).
- **UserProfile**: join table linking User → Profile, with `UNIQUE(userId)` constraint enforcing one profile per user.
- **ProfilePermission**: join table linking Profile → Permission.
- **UserPermission**: join table for individual overrides (User → Permission) — **optional, planned for v2**.
- **Program**: id, title, description, domain, targetAudience, difficultyLevel, sessionCount, recommendedCohortSize, maxCohortSize, learningOutcomes (JSON array), status, coachId (FK → User), timestamps.
- **Cohort**: id, programId (FK), startDate, endDate, maxParticipants, enrollmentStatus, timestamps.
- **Session**: id, cohortId (FK), title, description, scheduledAt, durationMinutes (default 45), orderIndex, timestamps.
- **Enrollment**: id, studentId (FK → User), cohortId (FK), enrolledAt.
- **Exploration**: id, programId (FK, nullable), sessionId (FK, nullable), title, description, dueDate (nullable), timestamps.
- **ExplorationSubmission** *(Bonus)*: id, explorationId (FK), studentId (FK), responseText, coachFeedback (nullable), timestamps.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A student can discover, open, and enroll in a cohort in under 3 minutes from landing on the programs page.
- **SC-002**: A coach can create a complete program with one cohort and 3 sessions in under 5 minutes.
- **SC-003**: The system prevents duplicate enrollments in 100% of cases, including concurrent attempts.
- **SC-004**: All business rule violations (cohort full, wrong session count, dates out of range) are surfaced to the user with a clear, actionable error message — no silent failures.
- **SC-005**: The admin dashboard always reflects live data; counts match the actual state of the database without manual refresh.
- **SC-006**: A non-authenticated user attempting to access a protected route is redirected to login — 0 unauthorized data exposures.
- **SC-007**: A coach attempting to access another coach's program management pages receives a permission-denied response, never the data.

---

## Assumptions

- **Authentication**: NextAuth with `@auth/prisma-adapter`. All user data (identity, session, profile, permissions)
  lives in the SQLite DB managed by Prisma. No mock layer — the JWT callback enriches the session token from the
  DB at each login. The dev role switcher is a convenience UI that triggers a real `signIn()` for a seeded account.
  No technical limitations exist for this approach in Next.js + Prisma + SQLite.
- **RBAC v1**: Three fixed profiles — Student, Coach, Admin — seeded in DB at startup. Permission-level checks
  are used server-side (never role-name string checks). The `UserPermission` individual override table is deferred to v2.
- **Testing**: Unit tests + Playwright E2E are mandatory per the constitution (Q3). The PDF's "basic tests" guidance
  is explicitly superseded.
- **Database**: SQLite is used via Prisma, consistent with the constitution. This is fully compatible with the PDF's suggested database options.
- **Scope**: The Exploration submission/feedback flow (FR-019, FR-020) is a P3 bonus; it will be implemented only if core P1/P2 flows are complete and stable.
- **Mobile**: Responsive layout is expected (Tailwind CSS), but no native mobile app is in scope.
- **Notifications**: Email or push notifications for enrollment confirmation are out of scope for v1.
- **Program deletion**: Deleting a program that has active enrollments is out of scope for v1; the coach may Archive it instead.
- **Coach onboarding**: Coach and Admin accounts are created via `create-user.sh`, the seed script, or the admin
  user management interface (`/admin/users`). There is no public self-registration flow for coaches or admins.
- **Automatic session scheduling** (FR-012 Bonus): evenly distributed dates will be pre-calculated and offered as editable suggestions, not forced.

---

## Conflict Resolution Log

| # | Topic | Decision | Rationale |
|---|---|---|---|
| **1** | Auth mechanism | **PDF accepted** — dev-only role switcher permitted | Speeds up local development and testing; NextAuth remains mandatory in production; no security boundary is removed |
| **2** | RBAC depth | **PDF accepted** — simplified Profile-based RBAC for v1; `UserPermission` overrides deferred to v2 | Three fixed profiles with no override use cases in scope; full normalization adds complexity with no v1 benefit |
| **3** | Testing scope | **Constitution upheld** — unit tests + Playwright E2E mandatory; PDF's "basic tests" guidance overridden | Playwright coverage on enrollment, permission-denied paths, and admin access is critical for correctness and security |

*Constitution updated to v1.2.0 to reflect decisions 1 and 2.*
