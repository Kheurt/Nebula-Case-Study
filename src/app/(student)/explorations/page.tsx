import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getMyEnrollments } from '@/features/enrollment/actions/get-my-enrollments';
import { SubmissionForm } from '@/features/explorations/components/SubmissionForm';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/date-format';

export default async function StudentExplorationsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const result = await getMyEnrollments();
  const enrollments = result.success ? result.data : [];

  const allExplorations = enrollments.flatMap((e) =>
    e.explorations.map((exp) => ({ ...exp, coachName: e.coachName })),
  );

  const pending = allExplorations.filter((exp) => !exp.submission);
  const submitted = allExplorations.filter((exp) => !!exp.submission);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Explorations</h1>
        <p className="text-sm text-gray-500 mt-1">
          View and complete exploration exercises from your enrolled programs and sessions.
        </p>
      </div>

      {allExplorations.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <div className="h-16 w-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <p className="text-gray-900 font-medium mb-1">No explorations yet</p>
          <p className="text-sm text-gray-500">Explorations will appear here once your coach assigns them.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Pending explorations */}
          {pending.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
                  {pending.length}
                </span>
                Pending
              </h2>
              <div className="grid gap-4">
                {pending.map((exp) => (
                  <div key={exp.id} className="rounded-xl border border-amber-200 bg-white shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{exp.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={exp.source === 'program' ? 'blue' : 'default'}>
                              {exp.source === 'program' ? `Program: ${exp.programTitle}` : `Session: ${exp.sessionTitle}`}
                            </Badge>
                            <span className="text-xs text-gray-400">by {exp.coachName}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {exp.dueDate && (
                            <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-200">
                              Due: {formatDate(exp.dueDate)}
                            </span>
                          )}
                          <Badge variant="yellow">Pending</Badge>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mt-2">{exp.description}</p>
                    </div>
                    <div className="px-5 py-4 bg-gray-50/50">
                      <SubmissionForm explorationId={exp.id} existingSubmission={null} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Submitted explorations */}
          {submitted.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">
                  {submitted.length}
                </span>
                Submitted
              </h2>
              <div className="grid gap-4">
                {submitted.map((exp) => (
                  <div key={exp.id} className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <div className="px-5 py-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{exp.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={exp.source === 'program' ? 'blue' : 'default'}>
                              {exp.source === 'program' ? `Program: ${exp.programTitle}` : `Session: ${exp.sessionTitle}`}
                            </Badge>
                            <span className="text-xs text-gray-400">by {exp.coachName}</span>
                          </div>
                        </div>
                        <Badge variant={exp.submission?.coachFeedback ? 'green' : 'gray'}>
                          {exp.submission?.coachFeedback ? 'Reviewed' : 'Awaiting Review'}
                        </Badge>
                      </div>
                      <div className="mt-3">
                        <SubmissionForm explorationId={exp.id} existingSubmission={exp.submission} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
