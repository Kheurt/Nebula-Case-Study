'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { DevRoleSwitcher } from '@/components/DevRoleSwitcher';

interface NavbarProps {
  transparent?: boolean;
}

export function Navbar({ transparent = false }: NavbarProps) {
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!transparent) return;
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [transparent]);

  const isOverlay = transparent && !scrolled;

  return (
    <>
      <nav
        className={`${
          transparent
            ? 'fixed top-0 left-0 right-0 z-50 transition-all duration-300'
            : 'sticky top-0 z-50'
        } ${
          isOverlay
            ? 'bg-transparent'
            : 'bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className={`text-xl font-bold transition-colors ${
              isOverlay ? 'text-white' : 'text-blue-600'
            }`}
          >
            Nebula
          </Link>

          <div className="flex items-center gap-6">
            <Link
              href="/programs"
              className={`text-sm font-medium transition-colors ${
                isOverlay
                  ? 'text-white/80 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Programs
            </Link>

            {session?.user ? (
              <>
                {session.user.profileName === 'student' && (
                  <Link
                    href="/my-programs"
                    className={`text-sm font-medium transition-colors ${
                      isOverlay
                        ? 'text-white/80 hover:text-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    My Programs
                  </Link>
                )}
                {session.user.profileName === 'coach' && (
                  <Link
                    href="/coach/programs"
                    className={`text-sm font-medium transition-colors ${
                      isOverlay
                        ? 'text-white/80 hover:text-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Coach Dashboard
                  </Link>
                )}
                {session.user.profileName === 'admin' && (
                  <Link
                    href="/admin"
                    className={`text-sm font-medium transition-colors ${
                      isOverlay
                        ? 'text-white/80 hover:text-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Admin
                  </Link>
                )}
                <span
                  className={`hidden sm:inline text-xs ${
                    isOverlay ? 'text-white/60' : 'text-gray-400'
                  }`}
                >
                  {session.user.name}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className={isOverlay ? 'text-white/80 hover:text-white hover:bg-white/10' : ''}
                >
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant={isOverlay ? 'ghost' : 'secondary'}
                    size="sm"
                    className={isOverlay ? 'text-white border-white/30 hover:bg-white/10' : ''}
                  >
                    Sign in
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    size="sm"
                    className={
                      isOverlay
                        ? 'bg-white text-blue-700 hover:bg-blue-50'
                        : ''
                    }
                  >
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
      {!transparent && process.env.NODE_ENV === 'development' && <DevRoleSwitcher />}
    </>
  );
}
