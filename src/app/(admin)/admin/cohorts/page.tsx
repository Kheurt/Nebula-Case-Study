import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAllCohorts } from '@/features/admin/actions/get-all-cohorts';
import { CohortTable } from '@/features/admin/components/CohortTable';
import { PageShell } from '@/components/layout/PageShell';
import Link from 'next/link';

export default async function AdminCohortsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.profileName !== 'admin') redirect('/');

  const result = await getAllCohorts();
  const cohorts = result.success ? result.data : [];

  return (
    <PageShell>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Cohorts</h1>
        <Link href="/admin" className="text-sm text-blue-600 hover:underline">← Dashboard</Link>
      </div>
      {!result.success && <p className="text-red-600 text-sm mb-4">{result.error}</p>}
      <CohortTable cohorts={cohorts} />
    </PageShell>
  );
}
