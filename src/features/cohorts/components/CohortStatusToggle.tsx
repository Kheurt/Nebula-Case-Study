'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateCohortStatus } from '../actions/update-cohort-status';
import { useToast } from '@/components/ui/ToastProvider';

interface CohortStatusToggleProps {
  cohortId: string;
  currentStatus: string;
}

export function CohortStatusToggle({ cohortId, currentStatus }: CohortStatusToggleProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (currentStatus === 'FULL') {
    return <p className="text-xs text-gray-400 italic">Cohort is full.</p>;
  }

  const targetStatus = currentStatus === 'OPEN' ? 'CLOSED' : 'OPEN';
  const label = currentStatus === 'OPEN' ? 'Close Enrollment' : 'Reopen Enrollment';
  const color = currentStatus === 'OPEN'
    ? 'bg-red-600 hover:bg-red-700 text-white'
    : 'bg-emerald-600 hover:bg-emerald-700 text-white';

  async function handleToggle() {
    setError(null);
    startTransition(async () => {
      const result = await updateCohortStatus(cohortId, targetStatus);
      if (!result.success) {
        toast(result.error, 'error');
        setError(result.error);
      } else {
        toast(`Enrollment ${targetStatus === 'OPEN' ? 'reopened' : 'closed'} successfully.`, 'success');
        router.refresh();
      }
    });
  }

  return (
    <div>
      {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
      <button
        type="button"
        disabled={isPending}
        onClick={handleToggle}
        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${color}`}
      >
        {isPending ? 'Updating…' : label}
      </button>
    </div>
  );
}
