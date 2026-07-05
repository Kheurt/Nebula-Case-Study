import { Skeleton } from '@/components/ui/Skeleton';

export default function AdminLoading() {
  return (
    <div>
      <Skeleton className="h-8 w-56 mb-2" />
      <Skeleton className="h-4 w-72 mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-200 bg-white p-5">
            <Skeleton className="h-11 w-11 rounded-xl mb-4" />
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
