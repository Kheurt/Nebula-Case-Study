import Link from 'next/link';
import { getPublishedPrograms } from '@/features/programs/actions/get-published-programs';
import { ProgramCard } from '@/features/programs/components/ProgramCard';

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

export default async function HomePage() {
  const result = await getPublishedPrograms();
  const programs = result.success ? result.data.slice(0, 3) : [];
  const domains = Object.keys(DOMAIN_ICONS);

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white py-24 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-block bg-white/15 text-white text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-6">
            Nebula Immersion Platform
          </span>
          <h1 className="text-5xl font-extrabold leading-tight mb-6">
            Discover real-world<br />
            professional programs
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-10">
            Short, intensive immersions led by expert coaches in Finance, Data, Software,
            Marketing and more. Learn by doing — not just watching.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/programs"
              className="inline-block rounded-full bg-white text-blue-700 font-semibold px-8 py-3 text-base hover:bg-blue-50 transition-colors shadow-lg"
            >
              Browse all programs
            </Link>
            <Link
              href="/register"
              className="inline-block rounded-full border border-white/50 text-white font-semibold px-8 py-3 text-base hover:bg-white/10 transition-colors"
            >
              Create a free account
            </Link>
          </div>
        </div>
      </section>

      {/* Domain grid */}
      <section className="bg-gray-50 py-16 px-6">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-sm font-semibold uppercase tracking-widest text-gray-400 mb-8">
            Explore by domain
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {domains.map((domain) => (
              <Link
                key={domain}
                href={`/programs?domain=${domain}`}
                className="flex flex-col items-center gap-2 rounded-xl bg-white border border-gray-200 p-4 hover:border-blue-400 hover:shadow-md transition-all group"
              >
                <span className="text-2xl">{DOMAIN_ICONS[domain]}</span>
                <span className="text-xs font-medium text-gray-600 group-hover:text-blue-600 text-center leading-tight">
                  {DOMAIN_LABELS[domain]}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured programs */}
      {programs.length > 0 && (
        <section className="py-16 px-6">
          <div className="mx-auto max-w-5xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Featured programs</h2>
              <Link href="/programs" className="text-sm text-blue-600 hover:underline font-medium">
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="bg-gray-50 py-16 px-6">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-2xl font-bold text-gray-900 mb-12">How Nebula works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Find your program',
                body: 'Browse programs by domain, difficulty, or coach. Each program is a short intensive immersion of 2–4 sessions.',
              },
              {
                step: '02',
                title: 'Enroll in a cohort',
                body: 'Join a live cohort with a small group of peers. Cohorts have limited spots to ensure quality coaching.',
              },
              {
                step: '03',
                title: 'Learn & submit',
                body: 'Complete exploration exercises, get feedback from your coach, and build a portfolio of real-world work.',
              },
            ].map(({ step, title, body }) => (
              <div key={step} className="flex flex-col gap-3">
                <span className="text-3xl font-black text-blue-100">{step}</span>
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA footer */}
      <section className="py-16 px-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to immerse yourself?</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Join hundreds of students who are building real professional skills through Nebula immersions.
        </p>
        <Link
          href="/programs"
          className="inline-block rounded-full bg-blue-600 text-white font-semibold px-8 py-3 hover:bg-blue-700 transition-colors"
        >
          Explore programs
        </Link>
      </section>
    </>
  );
}

