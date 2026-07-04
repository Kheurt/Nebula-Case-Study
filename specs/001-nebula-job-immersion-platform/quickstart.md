# Quickstart Validation Guide

**Date**: 2026-07-04
**Feature**: 001-nebula-job-immersion-platform

---

## Prerequisites

- Node.js 20+
- pnpm (or npm)
- Git

---

## Setup

```bash
git clone <repo-url>
cd nebula-platform

# Install dependencies, generate Prisma client, run migrations, seed DB
sh scripts/dev-setup.sh
```

`dev-setup.sh` performs:
1. `pnpm install`
2. `cp .env.example .env` (skipped if `.env` already exists)
3. `pnpm prisma generate`
4. `pnpm prisma migrate dev --name init`
5. `pnpm prisma db seed` — creates profiles, permissions, and 3 test accounts

### Test Accounts

| Role | Email | Password |
|---|---|---|
| Student | `student@nebula.dev` | `student123!` |
| Coach | `coach@nebula.dev` | `coach123!` |
| Admin | `admin@nebula.dev` | `admin123!` |

### Environment Variables

See `.env.example` for the full list. Minimum required:

```bash
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="<generate with: openssl rand -base64 32>"
NEXTAUTH_URL="http://localhost:3000"
```

### Start Dev Server

```bash
pnpm dev
# App available at http://localhost:3000
```

In development, a **Dev Role Switcher** panel appears at the bottom-right of every page — use it to authenticate as Student, Coach, or Admin with one click.

---

## Validation Scenarios

### Scenario 1 — Student Enrollment Flow (P1 Core)

**Goal**: Prove a student can discover and enroll in a program cohort end-to-end.

**Setup**: The seed already includes one published program ("Investment Banking Analyst Immersion") with one open cohort.

1. Open `http://localhost:3000/programs`
   - **Expected**: Program catalog shows at least 1 card. No Draft or Archived programs visible.

2. Use the Dev Role Switcher → **Student**.

3. Filter by domain "Finance" or search "Investment".
   - **Expected**: The seeded program appears.

4. Click the program card → opens `/programs/[id]`.
   - **Expected**: Program details, coach name, available cohorts with dates and remaining spots.

5. Click **Enroll** on an open cohort.
   - **Expected**: Success toast/confirmation. Remaining spots count decreases by 1.

6. Navigate to `http://localhost:3000/my-programs`.
   - **Expected**: The enrolled program appears with: coach name, cohort dates, session schedule, enrolled participant count.

7. Try enrolling in the same cohort again.
   - **Expected**: Error message "You are already enrolled in this cohort."

### Scenario 2 — Coach Program & Cohort Creation (P1 Core)

**Goal**: Prove a coach can create a program, publish it, and create a cohort with sessions.

1. Use the Dev Role Switcher → **Coach**.
2. Navigate to `/coach/programs` → click **New Program**.
3. Fill in all fields: title "Data Analyst Bootcamp", domain "Data", session count 3, max cohort size 10, add 2 learning outcomes.
4. Submit → **Expected**: Program created in Draft status. Appears in coach's list.
5. Edit the program → change status to **Published** → save.
   - **Expected**: Program now appears in the student-facing catalog at `/programs`.
6. From the coach dashboard, click **Add Cohort**.
7. Set start date (tomorrow), end date (+14 days), max participants 8.
8. Click **Suggest session dates** → **Expected**: 3 evenly distributed dates pre-filled.
9. Fill in session titles and descriptions → submit.
   - **Expected**: Cohort created with 3 sessions. Cohort appears on the program detail page.
10. Try submitting with 2 sessions instead of 3.
    - **Expected**: Validation error "A cohort must have exactly 3 sessions (matching program setting)."
11. Try setting a session date outside the cohort period.
    - **Expected**: Validation error "Session date must be within the cohort period."

### Scenario 3 — Program Status Transition Guards (P1 Business Rules)

1. As Coach, create a new program (Draft).
2. Immediately try to move it back to Draft after publishing → **Expected**: Allowed (no cohorts yet).
3. Create a cohort for the published program.
4. Try to revert program to Draft → **Expected**: Error "Cannot revert to Draft — this program has cohorts."
5. Enroll a student in the cohort.
6. Try to Archive the program → **Expected**: Error "Cannot archive — cohort [name] has active enrollments. Close cohorts first."
7. As Coach, close the cohort (`enrollmentStatus = CLOSED`) → then Archive the program.
   - **Expected**: Program moves to Archived. Student still sees it in "My Programs" (historical access).

### Scenario 4 — Admin Dashboard (P2)

1. Use the Dev Role Switcher → **Admin**.
2. Navigate to `/admin`.
   - **Expected**: Dashboard shows correct counts (total programs, published programs, active cohorts, enrollments, students, coaches). Active cohorts = cohorts where `startDate <= today <= endDate`.
3. Navigate to `/admin/cohorts`.
   - **Expected**: Full list of all cohorts with program name, coach, dates, enrollment status, and period (Upcoming / Active / Past).
4. Navigate to `/admin/users` → click **Create User**.
   - **Expected**: Form to create a Coach or Admin account with name, email, password, and profile selection.
5. Try accessing `/admin` as a Student → **Expected**: Redirect to `/` or a permission-denied page.

### Scenario 5 — Permission Boundary Check (Security)

1. As Student, try to directly `POST` to a coach server action (e.g., create program).
   - **Expected**: Permission denied response. No data is created.
2. As Coach, try to access `/coach/programs` for a program owned by a different coach (by crafting the URL).
   - **Expected**: 403 or redirect. No data exposed.
3. As unauthenticated user, try to access `/my-programs`.
   - **Expected**: Redirect to `/login`.

### Scenario 6 — Exploration (P2)

1. As Coach, open a program → click **Add Exploration**.
2. Fill in title "Pre-reading: Case Study Basics", optional due date.
3. Link to the program (not a specific session) → save.
4. As enrolled Student, navigate to "My Programs" → open the cohort.
   - **Expected**: Exploration appears listed under the cohort/program.
5. As non-enrolled Student, attempt to access the exploration directly via URL.
   - **Expected**: Access denied.

---

## Run Tests

```bash
# Unit tests (vitest)
pnpm test

# E2E tests (Playwright) — requires dev server running
pnpm exec playwright test

# Full CI suite
pnpm test:ci   # runs unit + playwright headless
```

---

## Reset & Reseed

```bash
sh scripts/reset-db.sh   # wipes DB to schema only (no business data)
sh scripts/seed.sh       # re-seeds profiles, permissions, test accounts, and sample data
```
