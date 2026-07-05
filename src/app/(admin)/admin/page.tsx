import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDashboardStats } from '@/features/admin/actions/get-dashboard-stats';
import { DashboardStatsGrid } from '@/features/admin/components/DashboardStats';

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.profileName !== 'admin') redirect('/');

  const result = await getDashboardStats();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of platform activity and key metrics.</p>
      </div>

      {result.success ? (
        <DashboardStatsGrid stats={result.data} />
      ) : (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-red-700 text-sm">{result.error}</p>
        </div>
      )}
    </div>
  );
}
