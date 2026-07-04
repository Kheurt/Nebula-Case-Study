# Server Action Contracts

**Date**: 2026-07-04
**Feature**: 001-nebula-job-immersion-platform

This document defines the server action signatures exposed by each feature module.
Server actions are the primary interface between client components and the database in this Next.js App Router application.
Each action validates input with a Zod schema, checks the caller's session permission, then delegates to the feature's service layer.

---

## Convention

```ts
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code: string };
```

All actions return `ActionResult<T>`. They never throw to the client — errors are caught and returned as typed objects.

Required permission is noted in `[permission: xxx]` for each action.

---

## Auth Feature (`features/auth/`)

### `registerStudent(input)`
```ts
// [permission: public]
registerStudent(input: {
  name: string;        // min 2, max 80
  email: string;       // valid email, unique
  password: string;    // min 8 chars
}): ActionResult<{ userId: string }>
```
Creates a `User` with hashed password + `UserProfile` → `student` profile.

### `createUser(input)` *(admin only)*
```ts
// [permission: user:create]
createUser(input: {
  name: string;
  email: string;
  password: string;
  profileName: 'student' | 'coach' | 'admin';
}): ActionResult<{ userId: string }>
```
Admin interface to create Coach or Admin accounts.

---

## Programs Feature (`features/programs/`)

### `createProgram(input)`
```ts
// [permission: program:create]
createProgram(input: {
  title: string;           // min 3, max 120
  description: string;     // min 10
  domain: Domain;
  targetAudience: string;
  difficultyLevel: DifficultyLevel;
  sessionCount: number;    // 2–4
  recommendedCohortSize: number;  // default 3
  maxCohortSize: number;   // 1–20
  learningOutcomes: string[];  // min 1 item
}): ActionResult<{ programId: string }>
```
Creates a program in `DRAFT` status, assigned to the calling coach.

### `updateProgram(programId, input)`
```ts
// [permission: program:edit] + coach owns program
updateProgram(programId: string, input: {
  title?: string;
  description?: string;
  learningOutcomes?: string[];
  status?: ProgramStatus;
}): ActionResult<{ programId: string }>
```
Business rules enforced:
- `status: DRAFT` only allowed if no cohorts exist yet.
- `status: ARCHIVED` blocked if any cohort has active enrollments.
- `sessionCount` changes are rejected server-side (not in input type — omitted intentionally).

### `getPublishedPrograms(filters?)`
```ts
// [permission: program:read] — available to students and public
getPublishedPrograms(filters?: {
  domain?: Domain;
  search?: string;    // matches title or coach name
  coachId?: string;
}): ActionResult<ProgramSummary[]>
```

### `getProgramDetail(programId)`
```ts
// [permission: program:read]
// Coach: sees own draft/archived programs too
// Student/public: only PUBLISHED
getProgramDetail(programId: string): ActionResult<ProgramDetail>
```

### `getCoachPrograms()`
```ts
// [permission: program:edit] — returns only own programs
getCoachPrograms(): ActionResult<ProgramSummary[]>
```

---

## Cohorts Feature (`features/cohorts/`)

### `createCohort(programId, input)`
```ts
// [permission: cohort:create] + coach owns program + program is PUBLISHED
createCohort(programId: string, input: {
  startDate: string;        // ISO date
  endDate: string;          // ISO date, must be > startDate
  maxParticipants: number;  // 1–20
  sessions: Array<{
    title: string;
    description: string;
    scheduledAt: string;    // ISO datetime, within cohort period
    durationMinutes?: number; // default 45
    orderIndex: number;     // 1-based, must match program.sessionCount
  }>;
}): ActionResult<{ cohortId: string }>
```
Validates: session count matches `program.sessionCount`, all session dates within cohort period.

### `updateCohortStatus(cohortId, status)`
```ts
// [permission: cohort:manage] + coach owns program
updateCohortStatus(cohortId: string, status: 'OPEN' | 'CLOSED'): ActionResult<void>
```
Coach can manually open or close a cohort. `FULL` is set automatically by the enrollment service.

### `getCohortDetail(cohortId)`
```ts
// [permission: cohort:read]
getCohortDetail(cohortId: string): ActionResult<CohortDetail>
```
For coaches: includes enrolled student list. For students: includes session schedule and assigned explorations.

### `suggestSessionDates(input)`
```ts
// [permission: cohort:create] — helper, no DB write
suggestSessionDates(input: {
  startDate: string;
  endDate: string;
  sessionCount: number;  // 2–4
}): ActionResult<string[]>  // ISO date strings
```

---

## Enrollment Feature (`features/enrollment/`)

### `enrollInCohort(cohortId)`
```ts
// [permission: enrollment:create]
enrollInCohort(cohortId: string): ActionResult<{ enrollmentId: string }>
```
Executed inside a `$transaction`:
1. Re-fetches cohort with current enrollment count.
2. Checks `enrollmentStatus === OPEN` and count < `maxParticipants`.
3. Creates `Enrollment` row (DB unique constraint prevents duplicates).
4. Auto-updates cohort to `FULL` if capacity reached.

### `getMyEnrollments()`
```ts
// [permission: enrollment:create] — own enrollments only
getMyEnrollments(): ActionResult<EnrollmentWithDetails[]>
```
Returns enrolled cohorts with program info, coach name, session schedule, and explorations.

---

## Explorations Feature (`features/explorations/`)

### `createExploration(input)`
```ts
// [permission: exploration:create] + coach owns the linked program/session
createExploration(input: {
  title: string;
  description: string;
  dueDate?: string;     // ISO date, optional
  programId?: string;   // one of programId or sessionId required
  sessionId?: string;
}): ActionResult<{ explorationId: string }>
```

### `getExplorationsForEnrolled(cohortId)`
```ts
// [permission: exploration:read] + student enrolled in cohort
getExplorationsForEnrolled(cohortId: string): ActionResult<Exploration[]>
```
Returns explorations linked to the cohort's program and its sessions.

### `submitExplorationResponse(explorationId, responseText)` *(Bonus)*
```ts
// [permission: submission:create] + student enrolled in related cohort
submitExplorationResponse(explorationId: string, responseText: string): ActionResult<{ submissionId: string }>
```

### `addCoachFeedback(submissionId, feedback)` *(Bonus)*
```ts
// [permission: exploration:create] + coach owns the exploration's program
addCoachFeedback(submissionId: string, feedback: string): ActionResult<void>
```

---

## Admin Feature (`features/admin/`)

### `getDashboardStats()`
```ts
// [permission: admin:read]
getDashboardStats(): ActionResult<{
  totalPrograms: number;
  publishedPrograms: number;
  activeCohortsCount: number;    // startDate <= today <= endDate
  totalEnrollments: number;
  totalStudents: number;
  totalCoaches: number;
  upcomingSessions: SessionSummary[];   // next 7 days
  latestEnrollments: EnrollmentSummary[]; // most recent 10
}>
```

### `getAllCohorts()`
```ts
// [permission: admin:read]
getAllCohorts(): ActionResult<CohortAdminView[]>
// Each item includes: programTitle, coachName, startDate, endDate,
// enrollmentStatus, periodClassification (UPCOMING | ACTIVE | PAST),
// enrolledCount
```

### `listUsers()`
```ts
// [permission: user:read]
listUsers(): ActionResult<UserSummary[]>
```

### `createUser(input)`
```ts
// [permission: user:create]
// (same as Auth feature createUser — re-exported from auth feature)
```

---

## Shared Type Definitions

```ts
// Key return types (defined in features/[name]/types.ts)

type ProgramSummary = {
  id: string; title: string; domain: Domain;
  difficultyLevel: DifficultyLevel; coachName: string;
  sessionCount: number; openCohortsCount: number;
};

type ProgramDetail = ProgramSummary & {
  description: string; targetAudience: string;
  learningOutcomes: string[]; status: ProgramStatus;
  cohorts: CohortSummary[];
};

type CohortSummary = {
  id: string; startDate: string; endDate: string;
  maxParticipants: number; enrolledCount: number;
  enrollmentStatus: EnrollmentStatus;
};

type CohortDetail = CohortSummary & {
  sessions: SessionDetail[];
  enrolledStudents?: { id: string; name: string; enrolledAt: string }[]; // coach only
};

type SessionDetail = {
  id: string; title: string; description: string;
  scheduledAt: string; durationMinutes: number; orderIndex: number;
  explorations: ExplorationSummary[];
};

type EnrollmentWithDetails = {
  enrollmentId: string; enrolledAt: string;
  program: { id: string; title: string; coachName: string };
  cohort: CohortDetail;
};
```
