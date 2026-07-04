# Admin Feature

## Purpose

Provides platform-wide visibility for administrators.

## Permissions

| Action            | Permission Required |
|-------------------|---------------------|
| `getDashboardStats` | `admin:read`      |
| `getAllCohorts`    | `admin:read`        |
| `listUsers`       | `admin:read`        |
| `createUser`      | `user:create`       |

## Active Cohort Definition

A cohort is **active** when: `startDate <= today <= endDate`

```ts
const today = new Date();
today.setHours(0, 0, 0, 0);
return startDate <= today && today <= endDate;
```

## Period Classification

| Period     | Condition                         |
|------------|-----------------------------------|
| UPCOMING   | `startDate > today`               |
| ACTIVE     | `startDate <= today <= endDate`   |
| PAST       | `endDate < today`                 |

## Metrics Exposed

See `/api/metrics` for Prometheus-compatible metrics.

## How to Test

```bash
npx vitest run src/features/admin/__tests__/
```
