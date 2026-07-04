'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { DevRoleSwitcher } from '@/components/DevRoleSwitcher';

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-bold text-blue-600">
          Nebula
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/programs" className="text-sm text-gray-600 hover:text-gray-900">
            Programs
          </Link>
          {session?.user ? (
            <>
              {session.user.profileName === 'student' && (
                <Link href="/my-programs" className="text-sm text-gray-600 hover:text-gray-900">
                  My Programs
                </Link>
              )}
              {session.user.profileName === 'coach' && (
                <Link href="/coach/programs" className="text-sm text-gray-600 hover:text-gray-900">
                  My Programs (Coach)
                </Link>
              )}
              {session.user.profileName === 'admin' && (
                <Link href="/admin" className="text-sm text-gray-600 hover:text-gray-900">
                  Admin
                </Link>
              )}
              <span className="text-xs text-gray-400">
                {session.user.name} · {session.user.profileName}
              </span>
              <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: '/login' })}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="secondary" size="sm">Sign in</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Register</Button>
              </Link>
            </>
          )}
        </div>
      </div>
      {process.env.NODE_ENV === 'development' && <DevRoleSwitcher />}
    </nav>
  );
}
