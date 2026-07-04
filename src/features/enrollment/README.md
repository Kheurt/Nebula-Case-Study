# Enrollment Feature

## Purpose

Manages student enrollment in cohorts with capacity enforcement.

## Permissions

| Action              | Permission Required  |
|---------------------|----------------------|
| `enrollInCohort`    | `enrollment:create`  |
| `getMyEnrollments`  | `enrollment:create`  |

## Transaction Pattern

`enrollInCohort` uses `prisma.$transaction` to prevent race conditions:

1. Re-fetch cohort **inside** transaction (fresh count)
2. Check status is `OPEN`
3. Check `enrolledCount < maxParticipants`
4. Create `Enrollment` row
5. If `enrolledCount + 1 >= maxParticipants`, update cohort to `FULL`

## Duplicate Prevention

`@@unique([studentId, cohortId])` constraint on the `Enrollment` model. Duplicate enrollments return `DUPLICATE_ENROLLMENT` code.

## Auto-FULL Transition

When the last available slot is taken, the cohort status is automatically updated to `FULL` within the same transaction.

## How to Test

```bash
npx vitest run src/features/enrollment/__tests__/
```
