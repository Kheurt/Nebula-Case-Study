import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { listUsers } from '@/features/admin/actions/list-users';
import { PageShell } from '@/components/layout/PageShell';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

const profileColors: Record<string, 'blue' | 'green' | 'purple'> = {
  student: 'blue',
  coach: 'green',
  admin: 'purple',
};

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.profileName !== 'admin') redirect('/');

  const result = await listUsers();
  const users = result.success ? result.data : [];

  return (
    <PageShell>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <Link href="/admin" className="text-sm text-blue-600 hover:underline">← Dashboard</Link>
      </div>
      {!result.success && <p className="text-red-600 text-sm mb-4">{result.error}</p>}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="py-2 pr-4 font-medium">Name</th>
              <th className="py-2 pr-4 font-medium">Email</th>
              <th className="py-2 pr-4 font-medium">Role</th>
              <th className="py-2 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="py-2 pr-4 font-medium">{u.name}</td>
                <td className="py-2 pr-4 text-gray-600">{u.email}</td>
                <td className="py-2 pr-4">
                  <Badge variant={profileColors[u.profileName] ?? 'default'}>{u.profileName}</Badge>
                </td>
                <td className="py-2 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <p className="text-gray-500 py-4">No users found.</p>}
      </div>
    </PageShell>
  );
}
