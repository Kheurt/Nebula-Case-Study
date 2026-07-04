import { notFound } from 'next/navigation';
import { getProgramDetail } from '@/features/programs/actions/get-program-detail';
import { EnrollButton } from '@/features/enrollment/components/EnrollButton';
import { PageShell } from '@/components/layout/PageShell';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { format } from 'date-fns';

interface ProgramDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProgramDetailPage({ params }: ProgramDetailPageProps) {
  const { id } = await params;
  const result = await getProgramDetail(id);

  if (!result.success) notFound();
  const program = result.data;

  return (
    <PageShell>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="blue">{program.domain}</Badge>
              <Badge variant="gray">{program.difficultyLevel}</Badge>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{program.title}</h1>
            <p className="mt-1 text-gray-500">Coach: {program.coachName}</p>
          </div>

          <p className="text-gray-700 leading-relaxed">{program.description}</p>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Learning Outcomes</h2>
            <ul className="space-y-2">
              {program.learningOutcomes.map((outcome, i) => (
                <li key={i} className="flex gap-2 text-gray-700">
                  <span className="text-blue-500 font-bold">✓</span>
                  {outcome}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-4 text-sm text-gray-600">
            <span>{program.sessionCount} sessions</span>
            <span>Target: {program.targetAudience}</span>
            <span>Max {program.maxCohortSize} per cohort</span>
          </div>
        </div>

        {/* Cohorts sidebar */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Available Cohorts</h2>
          {program.cohorts.length === 0 ? (
            <p className="text-sm text-gray-500">No cohorts available yet.</p>
          ) : (
            program.cohorts.map((cohort) => (
              <Card key={cohort.id} className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="text-sm">
                    <p className="font-medium">
                      {format(new Date(cohort.startDate), 'MMM d')} –{' '}
                      {format(new Date(cohort.endDate), 'MMM d, yyyy')}
                    </p>
                    <p className="text-gray-500 mt-0.5">
                      {cohort.remainingSlots} / {cohort.maxParticipants} spots remaining
                    </p>
                  </div>
                  <Badge
                    variant={
                      cohort.enrollmentStatus === 'OPEN'
                        ? 'green'
                        : cohort.enrollmentStatus === 'FULL'
                          ? 'red'
                          : 'gray'
                    }
                  >
                    {cohort.enrollmentStatus}
                  </Badge>
                </div>
                <EnrollButton cohortId={cohort.id} enrollmentStatus={cohort.enrollmentStatus} />
              </Card>
            ))
          )}
        </div>
      </div>
    </PageShell>
  );
}
