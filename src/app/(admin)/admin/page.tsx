import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDashboardStats } from '@/features/admin/actions/get-dashboard-stats';
import { DashboardStatsGrid } from '@/features/admin/components/DashboardStats';
import { PageShell } from '@/components/layout/PageShell';
import Link from 'next/link';

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.profileName !== 'admin') redirect('/');

  const result = await getDashboardStats();

  return (
    <PageShell>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex gap-4 text-sm">
          <Link href="/admin/cohorts" className="text-blue-600 hover:underline">Cohorts →</Link>
          <Link href="/admin/users" className="text-blue-600 hover:underline">Users →</Link>
        </div>
      </div>

      {result.success ? (
        <DashboardStatsGrid stats={result.data} />
      ) : (
        <p className="text-red-600 text-sm">{result.error}</p>
      )}
    </PageShell>
  );
}
