import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAllCohorts } from '@/features/admin/actions/get-all-cohorts';
import { CohortTable } from '@/features/admin/components/CohortTable';

export default async function AdminCohortsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.profileName !== 'admin') redirect('/');

  const result = await getAllCohorts();
  const cohorts = result.success ? result.data : [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Cohorts</h1>
        <p className="text-sm text-gray-500 mt-1">Manage and monitor all cohorts across programs.</p>
      </div>
      {!result.success && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 mb-4">
          <p className="text-red-700 text-sm">{result.error}</p>
        </div>
      )}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <CohortTable cohorts={cohorts} />
      </div>
    </div>
  );
}
