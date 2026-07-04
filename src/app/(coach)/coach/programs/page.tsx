import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCoachPrograms } from '@/features/programs/actions/get-coach-programs';
import { PageShell } from '@/components/layout/PageShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default async function CoachProgramsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const result = await getCoachPrograms();
  const programs = result.success ? result.data : [];

  const statusColors: Record<string, 'blue' | 'green' | 'gray'> = {
    DRAFT: 'blue',
    PUBLISHED: 'green',
    ARCHIVED: 'gray',
  };

  return (
    <PageShell>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Programs</h1>
        <Link href="/coach/programs/new">
          <Button>+ New Program</Button>
        </Link>
      </div>

      {programs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">You have not created any programs yet.</p>
          <Link href="/coach/programs/new" className="mt-3 inline-block text-blue-600 hover:underline text-sm">
            Create your first program →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {programs.map((p) => (
            <Card key={p.id} className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="font-semibold text-gray-900">{p.title}</h2>
                  <Badge variant={statusColors[p.domain] ?? 'default'}>{p.domain}</Badge>
                  <Badge variant={statusColors['PUBLISHED'] ?? 'green'}>{p.domain}</Badge>
                </div>
                <p className="text-sm text-gray-500">
                  {p.sessionCount} sessions · {p.openCohortCount} open cohort(s)
                </p>
              </div>
              <Link href={`/coach/programs/${p.id}`}>
                <Button variant="secondary" size="sm">Edit →</Button>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
}
