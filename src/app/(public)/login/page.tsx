import { Suspense } from 'react';
import Link from 'next/link';
import { LoginForm } from '@/features/auth/components/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-[85vh] flex">
      {/* Left: Gradient illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-400/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/3" />
        <div className="relative z-10 flex flex-col justify-center px-16">
          <h2 className="text-3xl font-bold text-white mb-4">Welcome back to Nebula</h2>
          <p className="text-blue-100/90 text-lg leading-relaxed max-w-md">
            Continue your learning journey. Access your enrolled programs, track your progress, and connect with expert coaches.
          </p>
          <div className="mt-10 flex gap-4">
            {['500+ Students', '50+ Programs', '30+ Coaches'].map((stat) => (
              <div key={stat} className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20">
                <p className="text-sm font-semibold text-white">{stat}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link href="/" className="text-2xl font-bold text-blue-600 lg:hidden">Nebula</Link>
            <h1 className="mt-4 lg:mt-0 text-2xl font-bold text-gray-900">Sign in to your account</h1>
            <p className="mt-2 text-sm text-gray-500">Enter your credentials to access your dashboard.</p>
          </div>
          <Suspense>
            <LoginForm />
          </Suspense>
          <p className="mt-6 text-center text-sm text-gray-600">
            No account yet?{' '}
            <Link href="/register" className="font-medium text-blue-600 hover:text-blue-700">
              Create one for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
