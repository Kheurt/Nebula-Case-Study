import { PageShell } from '@/components/layout/PageShell';
import { CohortForm } from '@/features/cohorts/components/CohortForm';
import { getProgramDetail } from '@/features/programs/actions/get-program-detail';
import { notFound } from 'next/navigation';

export default async function NewCohortPage({ params }: { params: { id: string } }) {
  const result = await getProgramDetail(params.id);
  if (!result.success) notFound();

  return (
    <PageShell>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add Cohort — {result.data.title}</h1>
      <CohortForm programId={params.id} sessionCount={result.data.sessionCount} />
    </PageShell>
  );
}
