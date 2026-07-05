import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAllExplorations } from '@/features/admin/actions/get-all-explorations';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/date-format';

export default async function AdminExplorationsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.profileName !== 'admin') redirect('/');

  const result = await getAllExplorations();
  const explorations = result.success ? result.data : [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Explorations</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of all exploration exercises across programs.</p>
      </div>
      {!result.success && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 mb-4">
          <p className="text-red-700 text-sm">{result.error}</p>
        </div>
      )}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50/80">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Linked To</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Due Date</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Submissions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {explorations.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-400">
                  No explorations yet.
                </td>
              </tr>
            ) : (
              explorations.map((exp) => (
                <tr key={exp.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">{exp.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{exp.description}</p>
                  </td>
                  <td className="px-6 py-4">
                    {exp.programTitle ? (
                      <Badge variant="blue">Program: {exp.programTitle}</Badge>
                    ) : exp.sessionTitle ? (
                      <Badge variant="default">Session: {exp.sessionTitle}</Badge>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {exp.dueDate ? formatDate(exp.dueDate) : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                      {exp.submissionCount}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
