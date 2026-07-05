import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCoachExplorations } from '@/features/explorations/actions/get-coach-explorations';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/date-format';
import Link from 'next/link';

export default async function CoachExplorationsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.profileName !== 'coach') redirect('/');

  const result = await getCoachExplorations();
  const explorations = result.success ? result.data : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Explorations</h1>
          <p className="text-sm text-gray-500 mt-1">Manage exploration exercises for your programs.</p>
        </div>
        <Link
          href="/coach/explorations/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Exploration
        </Link>
      </div>
      {!result.success && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 mb-4">
          <p className="text-red-700 text-sm">{result.error}</p>
        </div>
      )}
      {explorations.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-12 text-center">
          <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500">No explorations yet.</p>
          <p className="text-xs text-gray-400 mt-1">Click &quot;New Exploration&quot; to create one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {explorations.map((exp) => (
            <Link
              key={exp.id}
              href={`/coach/explorations/${exp.id}`}
              className="rounded-xl border border-gray-200 bg-white shadow-sm p-5 hover:shadow-md hover:border-blue-200 transition-all block"
            >
              <div className="flex items-start justify-between">
                <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600">{exp.title}</h3>
                <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                  {exp.submissionCount} submission{exp.submissionCount !== 1 ? 's' : ''}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{exp.description}</p>
              <div className="flex items-center gap-2 mt-3">
                {exp.programTitle && <Badge variant="blue">Program: {exp.programTitle}</Badge>}
                {exp.sessionTitle && <Badge variant="default">Session: {exp.sessionTitle}</Badge>}
              </div>
              {exp.dueDate && (
                <p className="text-xs text-gray-400 mt-2">Due: {formatDate(exp.dueDate)}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
