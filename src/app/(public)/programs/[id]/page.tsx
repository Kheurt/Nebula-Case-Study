import { notFound } from 'next/navigation';
import { getProgramDetail } from '@/features/programs/actions/get-program-detail';
import { EnrollButton } from '@/features/enrollment/components/EnrollButton';
import { PageShell } from '@/components/layout/PageShell';
import { Badge } from '@/components/ui/Badge';
import { formatDateRange } from '@/lib/date-format';

function getCohortDisplayStatus(enrollmentStatus: string, startDate: string | Date, endDate: string | Date) {
  const now = new Date();
  const end = new Date(endDate);
  const start = new Date(startDate);

  if (end < now) return { label: 'ENDED', variant: 'gray' as const };
  if (enrollmentStatus === 'FULL') return { label: 'FULL', variant: 'red' as const };
  if (start > now && enrollmentStatus === 'OPEN') return { label: 'UPCOMING', variant: 'blue' as const };
  if (enrollmentStatus === 'OPEN') return { label: 'OPEN', variant: 'green' as const };
  return { label: enrollmentStatus, variant: 'gray' as const };
}

const DOMAIN_GRADIENTS: Record<string, string> = {
  FINANCE: 'from-emerald-500 to-teal-600',
  CONSULTING: 'from-blue-500 to-cyan-600',
  DATA: 'from-violet-500 to-purple-600',
  PRODUCT: 'from-amber-500 to-orange-600',
  SOFTWARE: 'from-slate-600 to-gray-800',
  MARKETING: 'from-rose-500 to-pink-600',
  ENTREPRENEURSHIP: 'from-indigo-500 to-blue-600',
};

const DOMAIN_ICONS: Record<string, string> = {
  FINANCE: '💹',
  CONSULTING: '🤝',
  DATA: '📊',
  PRODUCT: '🎯',
  SOFTWARE: '💻',
  MARKETING: '📣',
  ENTREPRENEURSHIP: '🚀',
};

interface ProgramDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProgramDetailPage({ params }: ProgramDetailPageProps) {
  const { id } = await params;
  const result = await getProgramDetail(id);

  if (!result.success) notFound();
  const program = result.data;

  return (
    <>
      {/* Hero header */}
      <div className={`bg-gradient-to-br ${DOMAIN_GRADIENTS[program.domain] ?? 'from-gray-500 to-gray-700'} py-16 px-4 sm:px-6 lg:px-8`}>
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="inline-flex items-center rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-white border border-white/20">
              {program.domain}
            </span>
            <span className="inline-flex items-center rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-white border border-white/20">
              {program.difficultyLevel}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">{program.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
            <span className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">
                {program.coachName.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              Coach: {program.coachName}
            </span>
            <span>·</span>
            <span>{program.sessionCount} sessions</span>
            <span>·</span>
            <span>Max {program.maxCohortSize} per cohort</span>
          </div>
        </div>
      </div>

      <PageShell>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 -mt-2">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-3">About this Program</h2>
              <p className="text-gray-700 leading-relaxed">{program.description}</p>
              <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                  Target: {program.targetAudience}
                </span>
              </div>
            </div>

            {/* Learning Outcomes */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Learning Outcomes</h2>
              <ul className="space-y-3">
                {program.learningOutcomes.map((outcome, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <div className="mt-0.5 h-5 w-5 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                      <svg className="h-3 w-3 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-700 text-sm leading-relaxed">{outcome}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Cohorts sidebar */}
          <div className="space-y-4">
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-base font-semibold text-gray-900">Available Cohorts</h2>
              </div>
              <div className="p-4">
                {program.cohorts.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                      <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-500">No cohorts available yet.</p>
                    <p className="text-xs text-gray-400 mt-1">Check back later for new dates.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {program.cohorts.map((cohort) => {
                      const status = getCohortDisplayStatus(cohort.enrollmentStatus, cohort.startDate, cohort.endDate);
                      return (
                      <div key={cohort.id} className="rounded-lg border border-gray-200 p-4 space-y-3 hover:border-blue-200 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {formatDateRange(cohort.startDate, cohort.endDate)}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {cohort.remainingSlots} / {cohort.maxParticipants} spots remaining
                            </p>
                          </div>
                          <Badge variant={status.variant}>
                            {status.label}
                          </Badge>
                        </div>
                        {/* Progress bar */}
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${
                              cohort.enrollmentStatus === 'FULL' ? 'bg-red-500' : 'bg-blue-500'
                            }`}
                            style={{
                              width: `${Math.min(100, ((cohort.maxParticipants - cohort.remainingSlots) / cohort.maxParticipants) * 100)}%`,
                            }}
                          />
                        </div>
                        <EnrollButton cohortId={cohort.id} enrollmentStatus={cohort.enrollmentStatus} startDate={cohort.startDate.toString()} endDate={cohort.endDate.toString()} />
                      </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </PageShell>
    </>
  );
}
