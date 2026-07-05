import { redirect, notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCohortDetail } from '@/features/cohorts/actions/get-cohort-detail';
import { getExplorationsForCoach } from '@/features/explorations/actions/get-explorations';
import { PageShell } from '@/components/layout/PageShell';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FeedbackForm } from '@/features/explorations/components/FeedbackForm';
import { CohortStatusToggle } from '@/features/cohorts/components/CohortStatusToggle';
import { formatDateRange, formatDate } from '@/lib/date-format';
import Link from 'next/link';

export default async function CoachCohortDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const result = await getCohortDetail(id);
  if (!result.success) notFound();

  const cohort = result.data;
  const explorationsResult = await getExplorationsForCoach(id);
  const explorations = explorationsResult.success ? explorationsResult.data : [];
  const now = new Date();
  const isActive =
    new Date(cohort.startDate) <= now && now <= new Date(cohort.endDate);

  return (
    <PageShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">{cohort.programTitle}</h1>
            <Badge variant={cohort.enrollmentStatus === 'OPEN' ? 'green' : 'gray'}>
              {cohort.enrollmentStatus}
            </Badge>
            {isActive && <Badge variant="blue">ACTIVE</Badge>}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {formatDateRange(cohort.startDate, cohort.endDate)}
          </p>
          <div className="mt-2">
            <CohortStatusToggle cohortId={cohort.id} currentStatus={cohort.enrollmentStatus} />
          </div>
        </div>
        <Link href={`/coach/programs/${cohort.programId}`} className="text-sm text-blue-600 hover:underline">
          ← Back to Program
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="divide-y">
                {cohort.sessions.map((s) => (
                  <li key={s.id} className="py-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">{s.title}</p>
                        <p className="text-xs text-gray-500">{s.description}</p>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <p>{formatDate(s.scheduledAt)}</p>
                        <p>{s.durationMinutes} min</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {explorations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Explorations & Student Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {explorations.map((exp) => (
                    <div key={exp.id} className="border rounded-md p-4">
                      <p className="font-semibold text-gray-800">{exp.title}</p>
                      <p className="text-sm text-gray-500 mt-1">{exp.description}</p>
                      {exp.submissions && exp.submissions.length > 0 ? (
                        <div className="mt-3 space-y-4">
                          {exp.submissions.map((sub) => (
                            <div key={sub.id} className="bg-gray-50 rounded p-3">
                              <p className="text-xs font-medium text-gray-700">{sub.studentName}</p>
                              <p className="text-sm mt-1 text-gray-600">{sub.responseText}</p>
                              <div className="mt-3">
                                <FeedbackForm submissionId={sub.id} existingFeedback={sub.coachFeedback} />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 mt-2">No submissions yet.</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>
                Enrolled Students ({cohort.enrollments?.length ?? 0}/{cohort.maxParticipants})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!cohort.enrollments || cohort.enrollments.length === 0 ? (
                <p className="text-sm text-gray-500">No students enrolled yet.</p>
              ) : (
                <ul className="space-y-2">
                  {cohort.enrollments.map((e) => (
                    <li key={e.id} className="text-sm">
                      <p className="font-medium">{e.studentName}</p>
                      <p className="text-gray-500">{e.studentEmail}</p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
