import { redirect, notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getProgramDetail } from '@/features/programs/actions/get-program-detail';
import { getCoachPrograms } from '@/features/programs/actions/get-coach-programs';
import { ProgramForm } from '@/features/programs/components/ProgramForm';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { DOMAINS, DIFFICULTY_LEVELS } from '@/features/programs/schemas';
import Link from 'next/link';

export default async function CoachProgramDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const [detailResult, coachResult] = await Promise.all([
    getProgramDetail(params.id),
    getCoachPrograms(),
  ]);

  if (!detailResult.success) notFound();
  const program = detailResult.data;

  if (program.coachId !== session.user?.id) {
    redirect('/coach/programs');
  }

  const statusStyles: Record<string, string> = {
    DRAFT: 'bg-amber-50 text-amber-700',
    PUBLISHED: 'bg-emerald-50 text-emerald-700',
    ARCHIVED: 'bg-gray-100 text-gray-600',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">{program.title}</h1>
          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[program.status] ?? 'bg-gray-100 text-gray-600'}`}>
            {program.status}
          </span>
        </div>
        <Link href="/coach/programs">
          <Button variant="ghost" size="sm">← Back</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Edit form */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Edit Program</h2>
            </div>
            <div className="p-6">
              <ProgramForm
                programId={program.id}
                defaultValues={{
                  title: program.title,
                  description: program.description,
                  domain: program.domain as typeof DOMAINS[number],
                  difficultyLevel: program.difficultyLevel as typeof DIFFICULTY_LEVELS[number],
                  targetAudience: program.targetAudience,
                  sessionCount: program.sessionCount,
                  maxCohortSize: program.maxCohortSize,
                  learningOutcomes: program.learningOutcomes,
                }}
              />
            </div>
          </div>
        </div>

        {/* Cohorts sidebar */}
        <div>
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Cohorts</h2>
            </div>
            <div className="p-6">
              {program.cohorts.length === 0 ? (
                <div className="text-center py-6">
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500">No cohorts yet.</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {program.cohorts.map((c) => (
                    <li key={c.id} className="flex justify-between items-center rounded-lg bg-gray-50 px-4 py-3 text-sm">
                      <div>
                        <p className="font-medium text-gray-900">{new Date(c.startDate).toLocaleDateString()}</p>
                        <p className="text-xs text-gray-500">{c.enrolledCount}/{c.maxParticipants} enrolled</p>
                      </div>
                      <Link href={`/coach/cohorts/${c.id}`} className="text-blue-600 hover:text-blue-700 text-xs font-medium">
                        View →
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              {program.status === 'PUBLISHED' && (
                <Link
                  href={`/coach/programs/${program.id}/cohorts/new`}
                  className="mt-4 inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Add cohort
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
