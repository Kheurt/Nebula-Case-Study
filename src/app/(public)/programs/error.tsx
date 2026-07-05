'use client';

import { PageShell } from '@/components/layout/PageShell';
import { Button } from '@/components/ui/Button';

export default function ProgramsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageShell>
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to load programs</h2>
        <p className="text-gray-500 text-sm mb-6">{error.message}</p>
        <Button onClick={reset} variant="secondary">Try again</Button>
      </div>
    </PageShell>
  );
}
