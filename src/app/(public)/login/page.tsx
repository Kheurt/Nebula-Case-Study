import { Suspense } from 'react';
import Link from 'next/link';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { PageShell } from '@/components/layout/PageShell';
import { Card } from '@/components/ui/Card';

export default function LoginPage() {
  return (
    <PageShell className="flex items-center justify-center min-h-[70vh]">
      <Card className="w-full max-w-md">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Sign in to Nebula</h1>
        <Suspense>
          <LoginForm />
        </Suspense>
        <p className="mt-4 text-center text-sm text-gray-600">
          No account yet?{' '}
          <Link href="/register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </p>
      </Card>
    </PageShell>
  );
}
