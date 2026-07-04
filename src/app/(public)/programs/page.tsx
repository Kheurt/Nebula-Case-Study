import { getPublishedPrograms } from '@/features/programs/actions/get-published-programs';
import { ProgramCard } from '@/features/programs/components/ProgramCard';
import { PageShell } from '@/components/layout/PageShell';
import { ProgramFilters } from '@/features/programs/components/ProgramFilters';

interface ProgramsPageProps {
  searchParams: Promise<{ domain?: string; search?: string; coachId?: string }>;
}

export default async function ProgramsPage({ searchParams }: ProgramsPageProps) {
  const params = await searchParams;
  const result = await getPublishedPrograms({
    domain: params.domain as string | undefined,
    search: params.search,
    coachId: params.coachId,
  });

  const programs = result.success ? result.data : [];

  // Derive unique coaches from programs list
  const coaches = Array.from(
    new Map(programs.map((p) => [p.coachId, p.coachName])).entries(),
  ).map(([id, name]) => ({ id, name }));

  return (
    <PageShell>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Job Immersion Programs</h1>
        <p className="mt-2 text-gray-600">
          Discover programs led by industry professionals and start your career journey.
        </p>
      </div>

      <ProgramFilters coaches={coaches} currentParams={params} />

      {programs.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-lg text-gray-500">No programs found matching your criteria.</p>
          <p className="mt-2 text-sm text-gray-400">
            Try adjusting your filters or check back later.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((program) => (
            <ProgramCard key={program.id} {...program} />
          ))}
        </div>
      )}
    </PageShell>
  );
}
