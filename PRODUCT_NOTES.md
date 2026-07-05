# Product Notes — Nebula Job Immersion Platform

## Questions Answers

### What did you prioritize and why?
- The authentication and access rules (RBAC)
- The User Experience

### What did you intentionally not build?
- Registration confirmation
- Notifications
- Admin/Coach search features in their dashboards
- Profile pages
- User management's features for Admin

### What would you improve with one more week?
One of the following options:
- Admin/Coach search features in their dashboards
- Profile pages
- User management's features for Admin

### What would you measure after launching this feature?
Which feature? The feature implemented in one week or the whole project as a feature? If it is the one week implementation, It depends on the business orientation, as the app is new, the only KPI I could measure as the Support is the failure percentage of each feature

### What would make this feature valuable for Nebula’s students and coaches?
- The value of advanced search features is that it help very well when the database has a lot of records
- User management's features help the admin to support user and troubleshooter when issues comes

## Design Decisions

### RBAC: Profile-Based Permissions

We chose a profile-based RBAC model instead of direct role assignment. Permissions are stored in the database as named strings (e.g., `program:create`) and grouped into profiles (`student`, `coach`, `admin`). This allows:
- Easy permission auditing
- Future addition of custom profiles without code changes
- JWT enrichment with actual permission strings for stateless authorization

### Server Actions over REST API

All mutations use Next.js Server Actions returning `ActionResult<T>`. This:
- Eliminates the need for a separate API layer for CRUD operations
- Provides type-safe client→server communication
- Allows progressive enhancement (forms work without JS)

### SQLite for Development

SQLite was chosen for development simplicity. The Prisma adapter pattern (`PrismaBetterSqlite3`) ensures the same ORM layer can be swapped for PostgreSQL in production by changing only the adapter and `prisma.config.ts`.

### Enrollment Capacity Management

Enrollment uses a `$transaction` to prevent race conditions:
1. Re-fetch cohort with current enrollment count inside transaction
2. Check capacity before creating enrollment
3. Auto-set cohort to `FULL` when capacity reached

This prevents double-booking even under concurrent requests.

### Program Status Machine

```
DRAFT → PUBLISHED → ARCHIVED (terminal)
PUBLISHED → DRAFT (only if no cohorts exist)
```

Archiving is blocked if any cohort has active (`OPEN`/`FULL`) enrollments.

## Known Limitations

- **SQLite only**: No connection pooling; not suitable for multi-instance production deployment
- **No email verification**: Users can register with any email
- **Dev credentials in seed**: Change all passwords before any production deployment
- **Metrics**: In-process counters reset on server restart; use Prometheus + persistent storage for production
