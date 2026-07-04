import Link from 'next/link';
import { RegisterForm } from '@/features/auth/components/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="min-h-[85vh] flex">
      {/* Left: Gradient illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-700 via-blue-600 to-blue-700 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/20 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/3" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-indigo-500/20 rounded-full blur-[80px] translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10 flex flex-col justify-center px-16">
          <h2 className="text-3xl font-bold text-white mb-4">Start Your Learning Journey</h2>
          <p className="text-blue-100/90 text-lg leading-relaxed max-w-md">
            Join a community of learners. Enroll in expert-led immersion programs, work on real-world projects, and build your professional portfolio.
          </p>
          <div className="mt-10 space-y-4">
            {[
              { icon: '✓', text: 'Access to all program domains' },
              { icon: '✓', text: 'Small cohorts for quality coaching' },
              { icon: '✓', text: 'Hands-on exploration exercises' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-emerald-400/20 flex items-center justify-center">
                  <span className="text-emerald-300 text-xs font-bold">{icon}</span>
                </div>
                <span className="text-sm text-blue-100">{text}</span>
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
            <h1 className="mt-4 lg:mt-0 text-2xl font-bold text-gray-900">Create your account</h1>
            <p className="mt-2 text-sm text-gray-500">Sign up to discover and enroll in immersion programs.</p>
          </div>
          <RegisterForm />
          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
