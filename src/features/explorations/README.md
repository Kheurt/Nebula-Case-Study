# Explorations Feature

## Purpose

Manages take-home exploration tasks (Explorations), student submissions, and coach feedback.

## Permissions

| Action                       | Permission Required     |
|------------------------------|-------------------------|
| `createExploration`          | `exploration:create`    |
| `getExplorationsForEnrolled` | `exploration:read`      |
| `submitExplorationResponse`  | `exploration:submit`    |
| `addCoachFeedback`           | `exploration:create`    |

## Coach Ownership Check

When creating an exploration, the server action verifies that the requesting coach owns the linked program (via `program.coachId === session.user.id`).

## Enrollment Gate

Students can only view/submit explorations if they are enrolled in the relevant cohort. `getExplorationsForEnrolled` verifies enrollment before returning data.

## `exploration:submit` vs `exploration:read`

- `exploration:read`: coach and student — access to read exploration metadata
- `exploration:submit`: student only — submit a response to an exploration

## Duplicate Submission Prevention

`@@unique([explorationId, studentId])` constraint on `ExplorationSubmission`. Returns `DUPLICATE_SUBMISSION` code on conflict.

## How to Test

```bash
npx vitest run src/features/explorations/__tests__/
```
