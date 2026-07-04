import Link from 'next/link';
import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { PageShell } from '@/components/layout/PageShell';
import { Card } from '@/components/ui/Card';

export default function RegisterPage() {
  return (
    <PageShell className="flex items-center justify-center min-h-[70vh]">
      <Card className="w-full max-w-md">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Create your account</h1>
        <RegisterForm />
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </Card>
    </PageShell>
  );
}
