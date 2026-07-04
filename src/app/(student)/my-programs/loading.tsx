import { Skeleton } from '@/components/ui/Skeleton';
import { PageShell } from '@/components/layout/PageShell';

export default function MyProgramsLoading() {
  return (
    <PageShell>
      <div className="h-8 w-40 bg-gray-200 animate-pulse rounded mb-6" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-6 border rounded-lg">
            <Skeleton className="h-6 w-64 mb-3" />
            <Skeleton className="h-4 w-40 mb-6" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
