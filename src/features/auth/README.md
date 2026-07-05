# Auth Feature

## Purpose

Handles user registration, login, and admin-created user accounts.

## Permissions

| Action         | Permission Required |
|----------------|---------------------|
| `/register`    | Public              |
| `/login`       | Public              |
| `createUser`   | `user:create` (admin only) |

## Server Actions

- `registerStudent(input)` — Creates a user with the `student` profile. Hashes password with bcryptjs (rounds: 12). Returns `DUPLICATE_EMAIL` on conflict.
- `createUser(input)` — Admin action to create a user with any profile.

## Rate Limiting

- `/api/auth/callback/credentials`: max 10 req/min per IP
- `/register`: max 5 req/min per IP

## Dev Role Switcher

`DevRoleSwitcher` is rendered only in `NODE_ENV=development`. It uses credentials from `NEXT_PUBLIC_DEV_*` env vars to simulate role switching.

## How to Test

```bash
# Unit tests
npx vitest run src/features/auth/__tests__/

# Manual: register a new student
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"password123!"}'
```
