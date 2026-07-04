import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getMyEnrollments } from '@/features/enrollment/actions/get-my-enrollments';
import { Badge } from '@/components/ui/Badge';
import { SubmissionForm } from '@/features/explorations/components/SubmissionForm';
import { format } from 'date-fns';
import Link from 'next/link';
import { StatCard } from '@/components/dashboard/StatCard';

export default async function MyProgramsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const result = await getMyEnrollments();
  const enrollments = result.success ? result.data : [];

  const totalSessions = enrollments.reduce((sum, e) => sum + e.sessions.length, 0);
  const totalExplorations = enrollments.reduce((sum, e) => sum + e.explorations.length, 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Programs</h1>
        <p className="text-sm text-gray-500 mt-1">Track your enrolled programs, sessions, and explorations.</p>
      </div>

      {/* Quick stats */}
      {enrollments.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard
            label="Enrolled Programs"
            value={enrollments.length}
            color="blue"
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
              </svg>
            }
          />
          <StatCard
            label="Total Sessions"
            value={totalSessions}
            color="violet"
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            }
          />
          <StatCard
            label="Explorations"
            value={totalExplorations}
            color="amber"
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            }
          />
        </div>
      )}

      {enrollments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <div className="h-16 w-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
            </svg>
          </div>
          <p className="text-gray-900 font-medium mb-1">No enrollments yet</p>
          <p className="text-sm text-gray-500 mb-4">Browse available programs and enroll in a cohort.</p>
          <Link
            href="/programs"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Browse programs →
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {enrollments.map((e) => (
            <div key={e.enrollmentId} className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{e.programTitle}</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Coach: {e.coachName} · {format(new Date(e.startDate), 'MMM d')} – {format(new Date(e.endDate), 'MMM d, yyyy')} · {e.enrolledCount} enrolled
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

              <div className="p-6 space-y-6">
                {/* Sessions */}
                {e.sessions.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                      </svg>
                      Session Schedule
                    </h3>
                    <div className="grid gap-2">
                      {e.sessions.map((s) => (
                        <div key={s.id} className="flex items-center gap-4 rounded-lg bg-gray-50 px-4 py-2.5 text-sm">
                          <span className="font-semibold text-blue-600 w-20 shrink-0">
                            {format(new Date(s.scheduledAt), 'MMM d')}
                          </span>
                          <span className="text-gray-900 flex-1">{s.title}</span>
                          <span className="text-gray-400 text-xs">{s.durationMinutes} min</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Explorations */}
                {e.explorations.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                      Explorations
                    </h3>
                    <div className="grid gap-3">
                      {e.explorations.map((exp) => (
                        <div key={exp.id} className="rounded-lg border border-blue-100 bg-blue-50/50 p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{exp.title}</p>
                              <p className="text-xs text-gray-600 mt-0.5">{exp.description}</p>
                            </div>
                            {exp.dueDate && (
                              <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-md border border-gray-200 shrink-0">
                                Due: {format(new Date(exp.dueDate), 'MMM d, yyyy')}
                              </span>
                            )}
                          </div>
                          <div className="mt-3">
                            <SubmissionForm explorationId={exp.id} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
