import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getMyEnrollments } from '@/features/enrollment/actions/get-my-enrollments';
import { PageShell } from '@/components/layout/PageShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SubmissionForm } from '@/features/explorations/components/SubmissionForm';
import { format } from 'date-fns';

export default async function MyProgramsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const result = await getMyEnrollments();
  const enrollments = result.success ? result.data : [];

  return (
    <PageShell>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">My Programs</h1>

      {enrollments.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">You are not enrolled in any programs yet.</p>
          <a href="/programs" className="mt-3 inline-block text-blue-600 hover:underline text-sm">
            Browse programs →
          </a>
        </div>
      ) : (
        <div className="space-y-8">
          {enrollments.map((e) => (
            <Card key={e.enrollmentId} className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{e.programTitle}</h2>
                  <p className="text-sm text-gray-500">Coach: {e.coachName}</p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(e.startDate), 'MMM d')} –{' '}
                    {format(new Date(e.endDate), 'MMM d, yyyy')} ·{' '}
                    {e.enrolledCount} enrolled
                  </p>
                </div>
                <Badge
                  variant={
                    e.enrollmentStatus === 'OPEN'
                      ? 'green'
                      : e.enrollmentStatus === 'FULL'
                        ? 'red'
                        : 'gray'
                  }
                >
                  {e.enrollmentStatus}
                </Badge>
              </div>

              {/* Sessions */}
              {e.sessions.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Session Schedule</h3>
                  <div className="space-y-1">
                    {e.sessions.map((s) => (
                      <div key={s.id} className="flex gap-3 text-sm text-gray-600">
                        <span className="font-medium w-24 shrink-0">
                          {format(new Date(s.scheduledAt), 'MMM d')}
                        </span>
                        <span>{s.title}</span>
                        <span className="text-gray-400">{s.durationMinutes}min</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Explorations */}
              {e.explorations.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Explorations</h3>
                  <div className="space-y-2">
                    {e.explorations.map((exp) => (
                      <div key={exp.id} className="rounded-md bg-blue-50 p-3">
                        <p className="text-sm font-medium text-blue-800">{exp.title}</p>
                        <p className="text-xs text-blue-600 mt-0.5">{exp.description}</p>
                        {exp.dueDate && (
                          <p className="text-xs text-gray-500 mt-1">
                            Due: {format(new Date(exp.dueDate), 'MMM d, yyyy')}
                          </p>
                        )}
                        <div className="mt-3">
                          <SubmissionForm explorationId={exp.id} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
}
