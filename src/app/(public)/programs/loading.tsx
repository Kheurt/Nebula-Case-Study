import { SkeletonCard } from '@/components/ui/Skeleton';
import { PageShell } from '@/components/layout/PageShell';

export default function ProgramsLoading() {
  return (
    <PageShell>
      <div className="h-8 w-48 bg-gray-200 animate-pulse rounded mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </PageShell>
  );
}
