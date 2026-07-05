# Data Model: Nebula Job Immersion Program Platform

**Phase**: 1 — Design
**Date**: 2026-07-04

---

## Entity Relationship Overview

```
User ──── UserProfile ──── Profile ──── ProfilePermission ──── Permission
 │                                                                        
 ├── (as coach) ──── Program ──── Cohort ──── Session
 │                              │
 │                              └── Enrollment ──── User (as student)
 │                              │
 │                              └── Exploration (via Program or Session)
 │                                      └── ExplorationSubmission ──── User (as student)
 └── (as admin) manages Users
```

---

## Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// ─── RBAC ────────────────────────────────────────────────────────────────────

model User {
  id             String    @id @default(cuid())
  name           String
  email          String    @unique
  hashedPassword String
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  // NextAuth adapter relations
  accounts       Account[]
  sessions       Session[]

  // RBAC
  userProfile    UserProfile?

  // Domain relations
  programs       Program[]    // coach's programs
  enrollments    Enrollment[]
  submissions    ExplorationSubmission[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

model Profile {
  id          String              @id @default(cuid())
  name        String              @unique  // 'student' | 'coach' | 'admin'
  userProfile UserProfile[]
  permissions ProfilePermission[]
}

model Permission {
  id      String              @id @default(cuid())
  action  String              @unique  // e.g. 'program:create', 'enrollment:create', 'admin:read'
  profiles ProfilePermission[]
}

model UserProfile {
  id        String  @id @default(cuid())
  userId    String  @unique  // enforces one profile per user
  profileId String

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  profile Profile @relation(fields: [profileId], references: [id])
}

model ProfilePermission {
  profileId    String
  permissionId String

  profile    Profile    @relation(fields: [profileId], references: [id])
  permission Permission @relation(fields: [permissionId], references: [id])

  @@id([profileId, permissionId])
}

// ─── DOMAIN ──────────────────────────────────────────────────────────────────

model Program {
  id                   String        @id @default(cuid())
  title                String
  description          String
  domain               Domain
  targetAudience       String
  difficultyLevel      DifficultyLevel
  sessionCount         Int           // 2–4
  recommendedCohortSize Int          @default(3)
  maxCohortSize        Int           // 1–20
  learningOutcomes     String        // JSON array stored as text
  status               ProgramStatus @default(DRAFT)
  coachId              String
  createdAt            DateTime      @default(now())
  updatedAt            DateTime      @updatedAt

  coach        User          @relation(fields: [coachId], references: [id])
  cohorts      Cohort[]
  explorations Exploration[] @relation("ProgramExplorations")
}

model Cohort {
  id               String           @id @default(cuid())
  programId        String
  startDate        DateTime
  endDate          DateTime
  maxParticipants  Int              // 1–20
  enrollmentStatus EnrollmentStatus @default(OPEN)
  createdAt        DateTime         @default(now())
  updatedAt        DateTime         @updatedAt

  program     Program      @relation(fields: [programId], references: [id])
  sessions    CohortSession[]
  enrollments Enrollment[]
}

model CohortSession {
  id              String   @id @default(cuid())
  cohortId        String
  title           String
  description     String
  scheduledAt     DateTime
  durationMinutes Int      @default(45)
  orderIndex      Int      // 1-based
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  cohort       Cohort        @relation(fields: [cohortId], references: [id], onDelete: Cascade)
  explorations Exploration[] @relation("SessionExplorations")

  @@unique([cohortId, orderIndex])
}

model Enrollment {
  id         String   @id @default(cuid())
  studentId  String
  cohortId   String
  enrolledAt DateTime @default(now())

  student User   @relation(fields: [studentId], references: [id])
  cohort  Cohort @relation(fields: [cohortId], references: [id])

  @@unique([studentId, cohortId])  // prevents duplicate enrollment + race condition safety net
}

model Exploration {
  id          String    @id @default(cuid())
  title       String
  description String
  dueDate     DateTime?
  programId   String?
  sessionId   String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  program     Program?       @relation("ProgramExplorations", fields: [programId], references: [id])
  session     CohortSession? @relation("SessionExplorations", fields: [sessionId], references: [id])
  submissions ExplorationSubmission[]
}

model ExplorationSubmission {
  id            String   @id @default(cuid())
  explorationId String
  studentId     String
  responseText  String
  coachFeedback String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  exploration Exploration @relation(fields: [explorationId], references: [id])
  student     User        @relation(fields: [studentId], references: [id])

  @@unique([explorationId, studentId])  // one submission per student per exploration
}

// ─── ENUMS ───────────────────────────────────────────────────────────────────

enum ProgramStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

enum Domain {
  FINANCE
  CONSULTING
  DATA
  PRODUCT
  SOFTWARE
  MARKETING
  ENTREPRENEURSHIP
}

enum DifficultyLevel {
  BEGINNER
  INTERMEDIATE
  ADVANCED
}

enum EnrollmentStatus {
  OPEN
  FULL
  CLOSED
}
```

> **Note on SQLite enums**: Prisma maps enums to `TEXT` with CHECK constraints in SQLite. This is transparent — the developer-facing API is identical to PostgreSQL.

---

## Key Constraints Summary

| Model | Constraint | Purpose |
|---|---|---|
| `User.email` | `@unique` | No duplicate accounts |
| `UserProfile.userId` | `@unique` | One profile per user |
| `ProfilePermission` | `@@id([profileId, permissionId])` | No duplicate profile-permission pairs |
| `CohortSession` | `@@unique([cohortId, orderIndex])` | No two sessions with same order in a cohort |
| `Enrollment` | `@@unique([studentId, cohortId])` | No duplicate enrollment (race condition safety net) |
| `ExplorationSubmission` | `@@unique([explorationId, studentId])` | One submission per student per exploration |
| `Permission.action` | `@unique` | No duplicate permission codes |

---

## Status Transition Rules (Program)

```
DRAFT ──────────────────────────────► PUBLISHED
  ▲                                       │
  │  (only if no cohorts exist)           ▼
  └───────────────────────────────── PUBLISHED ──► ARCHIVED
                                          │         (blocked if any cohort has active enrollments)
                                          ▼
                                       PUBLISHED
```

| From | To | Allowed if |
|---|---|---|
| DRAFT | PUBLISHED | Always |
| PUBLISHED | DRAFT | No cohorts created yet |
| PUBLISHED | ARCHIVED | No cohort has active enrollments |
| ARCHIVED | any | ❌ Never (terminal state) |

---

## Seed Data Structure

Three fixed profiles with their permissions:

| Profile | Permissions |
|---|---|
| `student` | `program:read`, `cohort:read`, `enrollment:create`, `exploration:read`, `submission:create` |
| `coach` | `program:create`, `program:edit`, `cohort:create`, `cohort:manage`, `session:create`, `exploration:create`, `enrollment:read` |
| `admin` | `admin:read`, `user:create`, `user:read`, all coach permissions |

Seeded test accounts:

| Email | Password | Profile |
|---|---|---|
| `student@nebula.dev` | `student123!` | student |
| `coach@nebula.dev` | `coach123!` | coach |
| `admin@nebula.dev` | `admin123!` | admin |
