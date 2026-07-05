'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/Button';

const roles = [
  {
    label: 'Student',
    email: process.env.NEXT_PUBLIC_DEV_STUDENT_EMAIL ?? 'student@nebula.dev',
  },
  {
    label: 'Coach',
    email: process.env.NEXT_PUBLIC_DEV_COACH_EMAIL ?? 'coach@nebula.dev',
  },
  {
    label: 'Admin',
    email: process.env.NEXT_PUBLIC_DEV_ADMIN_EMAIL ?? 'admin@nebula.dev',
  },
];

const DEV_PASSWORD = process.env.NEXT_PUBLIC_DEV_SEED_PASSWORD ?? 'devpassword123!';

export function DevRoleSwitcher() {
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="flex items-center gap-2 border-t border-orange-200 bg-orange-50 px-4 py-2">
      <span className="text-xs font-semibold text-orange-600">DEV Role Switcher:</span>
      {roles.map((role) => (
        <Button
          key={role.label}
          variant="ghost"
          size="sm"
          className="text-xs text-orange-700 hover:bg-orange-100"
          onClick={() =>
            signIn('credentials', {
              email: role.email,
              password: DEV_PASSWORD,
              callbackUrl: '/',
            })
          }
        >
          {role.label}
        </Button>
      ))}
    </div>
  );
}
