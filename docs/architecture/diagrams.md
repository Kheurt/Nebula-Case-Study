# Context Diagram — Nebula Job Immersion Platform

```mermaid
C4Context
    title System Context — Nebula Job Immersion Platform

    Person(student, "Student", "Browses programs, enrolls in cohorts, submits explorations")
    Person(coach, "Coach", "Creates programs/cohorts, adds explorations, provides feedback")
    Person(admin, "Administrator", "Monitors platform activity via dashboard")

    System(nebula, "Nebula Platform", "Next.js App Router application with SQLite database")

    Rel(student, nebula, "Uses", "HTTPS")
    Rel(coach, nebula, "Uses", "HTTPS")
    Rel(admin, nebula, "Uses", "HTTPS")
```

---

# Sequence — Enrollment Flow

```mermaid
sequenceDiagram
    participant S as Student Browser
    participant E as EnrollButton
    participant A as enrollInCohort()
    participant DB as SQLite (Prisma $transaction)

    S->>E: click "Enroll"
    E->>A: enrollInCohort(cohortId)
    A->>A: requirePermission(session, 'enrollment:create')
    A->>DB: BEGIN TRANSACTION
    DB-->>A: cohort (fresh count)
    A->>A: check status === OPEN
    A->>A: check enrolledCount < maxParticipants
    A->>DB: INSERT Enrollment
    A->>DB: UPDATE Cohort → FULL (if last slot)
    DB-->>A: COMMIT
    A-->>E: { success: true, data: { enrollmentId } }
    E->>S: redirect to /my-programs
```

---

# Sequence — Program Creation (Coach)

```mermaid
sequenceDiagram
    participant C as Coach Browser
    participant F as ProgramForm
    participant A as createProgram()
    participant DB as SQLite (Prisma)

    C->>F: fill form (title, description, domain, …)
    F->>F: Zod validate (createProgramSchema)
    F->>A: createProgram(input)
    A->>A: requirePermission(session, 'program:create')
    A->>A: Zod safeParse(input)
    A->>DB: INSERT Program (status = DRAFT, coachId)
    DB-->>A: program
    A-->>F: { success: true, data: { programId } }
    F->>C: redirect to /coach/programs/{id}
```

---

# Sequence — Cohort Creation (Coach)

```mermaid
sequenceDiagram
    participant C as Coach Browser
    participant F as CohortForm
    participant A as createCohort()
    participant V as validateSessions()
    participant DB as SQLite (Prisma)

    C->>F: fill dates, capacity, sessions
    F->>F: Zod validate (createCohortSchema)
    F->>A: createCohort(programId, input)
    A->>A: requirePermission(session, 'cohort:create')
    A->>DB: findUnique(programId)
    DB-->>A: program
    A->>A: check status === PUBLISHED
    A->>A: check coachId === session.user.id
    A->>V: validateSessions(sessions, sessionCount, start, end)
    V-->>A: null (valid)
    A->>DB: INSERT Cohort (enrollmentStatus = OPEN) + INSERT CohortSessions[]
    DB-->>A: cohort
    A-->>F: { success: true, data: { cohortId } }
    F->>C: redirect to /coach/programs/{programId}
```

---

# Sequence — Exploration Creation (Coach)

```mermaid
sequenceDiagram
    participant C as Coach Browser
    participant F as ExplorationForm
    participant A as createExploration()
    participant DB as SQLite (Prisma)

    C->>F: fill title, description, dueDate, link to Program OR Session
    F->>F: Zod validate (programId XOR sessionId required)
    F->>A: createExploration(input)
    A->>A: requirePermission(session, 'exploration:create')

    alt linked to Program
        A->>DB: findUnique(programId)
        DB-->>A: program
        A->>A: check program.coachId === session.user.id
    else linked to Session
        A->>DB: findUnique(sessionId) + cohort → program
        DB-->>A: cohortSession
        A->>A: check cohort.program.coachId === session.user.id
    end

    A->>DB: INSERT Exploration (programId | sessionId)
    DB-->>A: exploration
    A-->>F: { success: true, data: { explorationId } }
    F->>C: toast "Exploration created" + redirect
```

---

# Sequence — Exploration Submission & Coach Feedback

```mermaid
sequenceDiagram
    participant S as Student Browser
    participant SF as SubmissionForm
    participant SA as submitExplorationResponse()
    participant DB as SQLite (Prisma)
    participant C as Coach Browser
    participant FF as FeedbackForm
    participant FA as addCoachFeedback()

    Note over S,DB: Phase 1 — Student submits response

    S->>SF: write response text
    SF->>SF: Zod validate (responseText 1-2000 chars)
    SF->>SA: submitExplorationResponse(explorationId, input)
    SA->>SA: requirePermission(session, 'exploration:submit')
    SA->>DB: findUnique(explorationId)
    DB-->>SA: exploration

    alt linked to Program
        SA->>DB: find Cohort where programId + studentId enrolled
    else linked to Session
        SA->>DB: find CohortSession → Cohort → Enrollment(studentId)
    end

    SA->>SA: check isEnrolled === true
    SA->>DB: INSERT ExplorationSubmission (unique: explorationId + studentId)
    DB-->>SA: submission
    SA-->>SF: { success: true, data: { submissionId } }
    SF->>S: toast "Response submitted" + show submitted state

    Note over C,DB: Phase 2 — Coach provides feedback

    C->>FF: open /coach/explorations/{id}, view student response
    FF->>FF: Zod validate (coachFeedback 1-1000 chars)
    C->>FF: write feedback
    FF->>FA: addCoachFeedback(submissionId, input)
    FA->>FA: requirePermission(session, 'exploration:create')
    FA->>DB: findUnique(submissionId) + exploration → program/session → coachId
    DB-->>FA: submission with ownership chain
    FA->>FA: check programCoachId === session.user.id
    FA->>DB: UPDATE ExplorationSubmission SET coachFeedback
    DB-->>FA: updated
    FA-->>FF: { success: true }
    FF->>C: toast "Feedback saved"

    Note over S,C: Phase 3 — Student sees feedback

    S->>S: visit /explorations
    S->>DB: getMyEnrollments() → submissions with coachFeedback
    DB-->>S: exploration + submission { coachFeedback }
    S->>S: display feedback in amber box under submitted response
```

---

# Sequence — Auth JWT Callback

```mermaid
sequenceDiagram
    participant C as Client
    participant NA as NextAuth
    participant DB as Prisma

    C->>NA: credentials login
    NA->>DB: findUnique(email)
    DB-->>NA: user
    NA->>NA: bcrypt.compare(password, hash)
    NA-->>C: JWT token with {id, email}

    Note over NA,DB: On each request (token refresh)
    NA->>DB: userProfile → profile → permissions
    DB-->>NA: profileName, permissions[]
    NA-->>C: enriched JWT {id, profileName, permissions[]}
```
