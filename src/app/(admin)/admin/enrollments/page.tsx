import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAllEnrollments } from '@/features/admin/actions/get-all-enrollments';
import { formatDate } from '@/lib/date-format';

export default async function AdminEnrollmentsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.profileName !== 'admin') redirect('/');

  const result = await getAllEnrollments();
  const enrollments = result.success ? result.data : [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Enrollments</h1>
        <p className="text-sm text-gray-500 mt-1">Monitor student enrollments across all cohorts.</p>
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
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Program</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cohort Start</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Enrolled At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {enrollments.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-400">
                  No enrollments yet.
                </td>
              </tr>
            ) : (
              enrollments.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                        {e.studentName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{e.studentName}</p>
                        <p className="text-xs text-gray-500">{e.studentEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{e.programTitle}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(e.cohortStartDate)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(e.enrolledAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
