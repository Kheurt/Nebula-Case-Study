import { redirect, notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getProgramDetail } from '@/features/programs/actions/get-program-detail';
import { getCoachPrograms } from '@/features/programs/actions/get-coach-programs';
import { PageShell } from '@/components/layout/PageShell';
import { ProgramForm } from '@/features/programs/components/ProgramForm';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default async function CoachProgramDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const [detailResult, coachResult] = await Promise.all([
    getProgramDetail(params.id),
    getCoachPrograms(),
  ]);

  if (!detailResult.success) notFound();
  const program = detailResult.data;

  // Only the program coach can edit
  if (program.coachId !== session.user?.id) {
    redirect('/coach/programs');
  }

  const statusColors: Record<string, 'blue' | 'green' | 'gray'> = {
    DRAFT: 'blue',
    PUBLISHED: 'green',
    ARCHIVED: 'gray',
  };

  return (
    <PageShell>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">{program.title}</h1>
          <Badge variant={statusColors[program.status] ?? 'default'}>{program.status}</Badge>
        </div>
        <Link href="/coach/programs">
          <Button variant="ghost" size="sm">← Back</Button>
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Edit Program</CardTitle>
            </CardHeader>
            <CardContent>
              <ProgramForm
                programId={program.id}
                defaultValues={{
                  title: program.title,
                  description: program.description,
                  domain: program.domain,
                  difficultyLevel: program.difficultyLevel,
                  targetAudience: program.targetAudience,
                  sessionCount: program.sessionCount,
                  maxCohortSize: program.maxCohortSize,
                  learningOutcomes: program.learningOutcomes,
                }}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cohorts</CardTitle>
            </CardHeader>
            <CardContent>
              {program.cohorts.length === 0 ? (
                <p className="text-sm text-gray-500">No cohorts yet.</p>
              ) : (
                <ul className="space-y-2">
                  {program.cohorts.map((c) => (
                    <li key={c.id} className="flex justify-between items-center text-sm">
                      <span>{new Date(c.startDate).toLocaleDateString()}</span>
                      <span className="text-gray-500">
                        {c.enrolledCount}/{c.maxParticipants}
                      </span>
                      <Link href={`/coach/cohorts/${c.id}`} className="text-blue-600 hover:underline">
                        View
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              {program.status === 'PUBLISHED' && (
                <Link href={`/coach/programs/${program.id}/cohorts/new`} className="mt-3 inline-block text-sm text-blue-600 hover:underline">
                  + Add cohort
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
