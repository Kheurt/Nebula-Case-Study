import Link from 'next/link';
import { getPublishedPrograms } from '@/features/programs/actions/get-published-programs';
import { ProgramCard } from '@/features/programs/components/ProgramCard';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const DOMAIN_ICONS: Record<string, string> = {
  FINANCE: '💹',
  CONSULTING: '🤝',
  DATA: '📊',
  PRODUCT: '🎯',
  SOFTWARE: '💻',
  MARKETING: '📣',
  ENTREPRENEURSHIP: '🚀',
};

const DOMAIN_LABELS: Record<string, string> = {
  FINANCE: 'Finance',
  CONSULTING: 'Consulting',
  DATA: 'Data & BI',
  PRODUCT: 'Product',
  SOFTWARE: 'Software',
  MARKETING: 'Marketing',
  ENTREPRENEURSHIP: 'Entrepreneurship',
};

const DOMAIN_GRADIENTS: Record<string, string> = {
  FINANCE: 'from-emerald-500 to-teal-600',
  CONSULTING: 'from-blue-500 to-cyan-600',
  DATA: 'from-violet-500 to-purple-600',
  PRODUCT: 'from-amber-500 to-orange-600',
  SOFTWARE: 'from-slate-600 to-gray-800',
  MARKETING: 'from-rose-500 to-pink-600',
  ENTREPRENEURSHIP: 'from-indigo-500 to-blue-600',
};

export default async function HomePage() {
  const result = await getPublishedPrograms();
  const programs = result.success ? result.data.slice(0, 3) : [];
  const domains = Object.keys(DOMAIN_ICONS);

  return (
    <>
      <Navbar transparent />

      {/* ──────────── Hero ──────────── */}
      <section className="relative bg-gradient-to-br from-blue-800 via-blue-600 to-indigo-700 text-white overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-400/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-32 pb-20 lg:pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text content */}
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6 border border-white/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Nebula Immersion Platform
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] mb-6">
                Build Real-World Skills With{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-indigo-200">
                  Expert-Led
                </span>{' '}
                Immersions
              </h1>
              <p className="text-lg text-blue-100/90 leading-relaxed mb-8">
                Short, intensive programs in Finance, Data, Software, Marketing and more.
                Learn by doing — not just watching. Join small cohorts coached by industry professionals.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Link
                  href="/programs"
                  className="inline-flex items-center justify-center rounded-xl bg-white text-blue-700 font-semibold px-8 py-3.5 text-base hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl"
                >
                  Browse Programs
                  <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center rounded-xl border-2 border-white/30 text-white font-semibold px-8 py-3.5 text-base hover:bg-white/10 transition-all backdrop-blur-sm"
                >
                  Create Free Account
                </Link>
              </div>

              {/* Feature checkmarks */}
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {['Flexible Schedules', 'Expert Coaching', 'Peer Community'].map((feat) => (
                  <div key={feat} className="flex items-center gap-2">
                    <svg className="h-5 w-5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-blue-100">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Floating card composition */}
            <div className="hidden lg:block relative">
              <div className="relative w-full h-[440px]">
                {/* Main floating card */}
                <div className="absolute top-8 left-8 w-72 bg-white rounded-2xl shadow-2xl p-5 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                  <div className="h-32 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-4">
                    <span className="text-5xl">📊</span>
                  </div>
                  <p className="text-sm font-bold text-gray-900">Data Analytics Immersion</p>
                  <p className="text-xs text-gray-500 mt-1">4 sessions · Coach: Sarah Chen</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="inline-block bg-purple-100 text-purple-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">DATA</span>
                    <span className="inline-block bg-green-100 text-green-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">OPEN</span>
                  </div>
                </div>

                {/* Stats card */}
                <div className="absolute top-0 right-4 w-48 bg-white rounded-xl shadow-xl p-4 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">500+</p>
                      <p className="text-xs text-gray-500">Students enrolled</p>
                    </div>
                  </div>
                </div>

                {/* Rating card */}
                <div className="absolute bottom-12 right-0 w-44 bg-white rounded-xl shadow-xl p-4 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center gap-2 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="h-4 w-4 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm font-bold text-gray-900">4.9 / 5</p>
                  <p className="text-xs text-gray-500">Program rating</p>
                </div>

                {/* Coaching card */}
                <div className="absolute bottom-0 left-0 w-56 bg-white rounded-xl shadow-xl p-4 transform -rotate-2 hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                      SC
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Sarah Chen</p>
                      <p className="text-xs text-gray-500">Data Analytics Coach</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-xs text-emerald-600 font-medium">Available for mentoring</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────── Stats strip ──────────── */}
      <section className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '500+', label: 'Students Enrolled', icon: '🎓' },
              { value: '50+', label: 'Programs Available', icon: '📚' },
              { value: '30+', label: 'Expert Coaches', icon: '👨‍🏫' },
              { value: '7', label: 'Industry Domains', icon: '🌐' },
            ].map(({ value, label, icon }) => (
              <div key={label} className="text-center">
                <span className="text-3xl mb-2 block">{icon}</span>
                <p className="text-3xl font-extrabold text-gray-900">{value}</p>
                <p className="text-sm text-gray-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────── Domain Explorer ──────────── */}
      <section className="bg-gray-50 py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <span className="text-sm font-semibold uppercase tracking-widest text-blue-600">
              Explore by Domain
            </span>
            <h2 className="mt-3 text-3xl font-bold text-gray-900">
              Find Your Path
            </h2>
            <p className="mt-3 text-gray-500 max-w-lg mx-auto">
              Choose from 7 industry domains. Each program is crafted by professionals who live and breathe their field.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {domains.map((domain) => (
              <Link
                key={domain}
                href={`/programs?domain=${domain}`}
                className="group relative flex flex-col items-center gap-3 rounded-2xl bg-white border border-gray-200 p-6 hover:border-blue-400 hover:shadow-lg transition-all duration-300"
              >
                <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${DOMAIN_GRADIENTS[domain] ?? 'from-gray-400 to-gray-600'} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-2xl">{DOMAIN_ICONS[domain]}</span>
                </div>
                <span className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 text-center transition-colors">
                  {DOMAIN_LABELS[domain]}
                </span>
                <svg className="h-4 w-4 text-gray-300 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────── Featured Programs ──────────── */}
      {programs.length > 0 && (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="mx-auto max-w-6xl">
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="text-sm font-semibold uppercase tracking-widest text-blue-600">
                  Popular Courses
                </span>
                <h2 className="mt-3 text-3xl font-bold text-gray-900">
                  Featured Programs
                </h2>
              </div>
              <Link
                href="/programs"
                className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Browse All Programs
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {programs.map((p) => (
                <ProgramCard
                  key={p.id}
                  id={p.id}
                  title={p.title}
                  description={p.description}
                  domain={p.domain}
                  difficultyLevel={p.difficultyLevel}
                  sessionCount={p.sessionCount}
                  coachName={p.coachName}
                  openCohortCount={p.openCohortCount}
                />
              ))}
            </div>
            <div className="mt-8 text-center sm:hidden">
              <Link
                href="/programs"
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600"
              >
                Browse All Programs →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ──────────── How it works ──────────── */}
      <section className="bg-gray-50 py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <span className="text-sm font-semibold uppercase tracking-widest text-blue-600">
              Simple Process
            </span>
            <h2 className="mt-3 text-3xl font-bold text-gray-900">
              How Nebula Works
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: '🔍',
                color: 'from-blue-500 to-blue-600',
                title: 'Find Your Program',
                body: 'Browse programs by domain, difficulty, or coach. Each program is a short intensive immersion of 2–4 sessions.',
              },
              {
                step: '02',
                icon: '✍️',
                color: 'from-indigo-500 to-indigo-600',
                title: 'Enroll in a Cohort',
                body: 'Join a live cohort with a small group of peers. Cohorts have limited spots to ensure quality coaching.',
              },
              {
                step: '03',
                icon: '🚀',
                color: 'from-violet-500 to-violet-600',
                title: 'Learn & Submit',
                body: 'Complete exploration exercises, get feedback from your coach, and build a portfolio of real-world work.',
              },
            ].map(({ step, icon, color, title, body }) => (
              <div
                key={step}
                className="relative bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-5 shadow-md group-hover:scale-110 transition-transform`}>
                  <span className="text-2xl">{icon}</span>
                </div>
                <span className="absolute top-6 right-6 text-4xl font-black text-gray-100 select-none">
                  {step}
                </span>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────── Testimonials ──────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <span className="text-sm font-semibold uppercase tracking-widest text-blue-600">
              Testimonials
            </span>
            <h2 className="mt-3 text-3xl font-bold text-gray-900">
              What Our Learners Say
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: 'The immersive approach completely changed how I understand data analytics. The hands-on exercises were incredibly practical.',
                name: 'Emma Laurent',
                role: 'Data Analyst, TechCorp',
                initials: 'EL',
                gradient: 'from-blue-500 to-indigo-600',
              },
              {
                quote: 'Nebula\'s coaching model is unique. Small cohorts mean you get real attention and feedback that matters for your career.',
                name: 'Marcus Johnson',
                role: 'Product Manager, InnovateLab',
                initials: 'MJ',
                gradient: 'from-violet-500 to-purple-600',
              },
              {
                quote: 'I enrolled in the Finance immersion and landed my dream internship within two months. The portfolio exercises made all the difference.',
                name: 'Sophie Chen',
                role: 'Finance Intern, Capital Group',
                initials: 'SC',
                gradient: 'from-emerald-500 to-teal-600',
              },
            ].map(({ quote, name, role, initials, gradient }) => (
              <div
                key={name}
                className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:border-blue-200 transition-colors"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="h-4 w-4 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed mb-6 italic">&ldquo;{quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-xs font-bold shadow-md`}>
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{name}</p>
                    <p className="text-xs text-gray-500">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────── CTA ──────────── */}
      <section className="relative bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
        <div className="relative mx-auto max-w-3xl text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-5">
            Ready to Immerse Yourself?
          </h2>
          <p className="text-lg text-blue-100/90 mb-10 max-w-xl mx-auto leading-relaxed">
            Join hundreds of students who are building real professional skills through Nebula immersions.
            Your journey starts with a single enrollment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/programs"
              className="inline-flex items-center justify-center rounded-xl bg-white text-blue-700 font-semibold px-8 py-4 text-base hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl"
            >
              Explore Programs
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-xl border-2 border-white/30 text-white font-semibold px-8 py-4 text-base hover:bg-white/10 transition-all"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

