# Cohorts Feature

## Purpose

Manages cohort creation, session scheduling, and enrollment status updates.

## Permissions

| Action                | Permission Required |
|-----------------------|---------------------|
| `createCohort`        | `cohort:create`     |
| `updateCohortStatus`  | `cohort:manage`     |
| `getCohortDetail`     | `cohort:read`       |
| `suggestSessionDates` | `cohort:create`     |

## Session Validation Rules

1. `sessions.length` must equal `program.sessionCount` (2–4)
2. All `scheduledAt` dates must be within `[startDate, endDate]`
3. No duplicate `orderIndex` values

## Auto-Suggest Algorithm

```
date_i = startDate + round((i * totalDays) / (n - 1))
```

Where `totalDays = (endDate - startDate)` in days and `n = sessionCount`.

## Note: CohortSession vs NextAuth Session

`CohortSession` is a domain entity (a scheduled session in an immersion program). It is unrelated to NextAuth's `Session` model (which stores auth state). Both exist in the Prisma schema; naming is intentional.

## How to Test

```bash
npx vitest run src/features/cohorts/__tests__/
```
