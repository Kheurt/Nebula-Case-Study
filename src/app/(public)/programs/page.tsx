import { getPublishedPrograms } from '@/features/programs/actions/get-published-programs';
import { ProgramCard } from '@/features/programs/components/ProgramCard';
import { PageShell } from '@/components/layout/PageShell';
import { ProgramFilters } from '@/features/programs/components/ProgramFilters';
import { DOMAINS } from '@/features/programs/schemas';

type Domain = typeof DOMAINS[number];

interface ProgramsPageProps {
  searchParams: Promise<{ domain?: string; search?: string; coachId?: string }>;
}

export default async function ProgramsPage({ searchParams }: ProgramsPageProps) {
  const params = await searchParams;

  const domainParam = DOMAINS.includes(params.domain as Domain)
    ? (params.domain as Domain)
    : undefined;

  const result = await getPublishedPrograms({
    domain: domainParam,
    search: params.search,
    coachId: params.coachId,
  });

  const programs = result.success ? result.data : [];

  const coaches = Array.from(
    new Map(programs.map((p) => [p.coachId, p.coachName])).entries(),
  ).map(([id, name]) => ({ id, name }));

  return (
    <PageShell>
      <div className="mb-10">
        <span className="text-sm font-semibold uppercase tracking-widest text-blue-600">
          Programs Catalog
        </span>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">Job Immersion Programs</h1>
        <p className="mt-2 text-gray-600 max-w-2xl">
          Discover programs led by industry professionals and start your career journey.
          Each program offers hands-on, expert-led immersion experiences.
        </p>
      </div>

      <ProgramFilters coaches={coaches} currentParams={params} />

      {programs.length === 0 ? (
        <div className="mt-16 text-center py-16 bg-gray-50 rounded-2xl border border-gray-200">
          <div className="h-16 w-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <p className="text-lg font-medium text-gray-900">No programs found</p>
          <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
            Try adjusting your filters or check back later for new programs.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((program) => (
            <ProgramCard key={program.id} {...program} />
          ))}
        </div>
      )}
    </PageShell>
  );
}
