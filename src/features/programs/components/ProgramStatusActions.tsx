'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateProgram } from '../actions/update-program';
import { useToast } from '@/components/ui/ToastProvider';

interface ProgramStatusActionsProps {
  programId: string;
  currentStatus: string;
  hasCohorts: boolean;
  hasActiveEnrollments: boolean;
}

const TRANSITIONS: Record<string, { label: string; target: string; color: string; icon: string }[]> = {
  DRAFT: [
    { label: 'Publish', target: 'PUBLISHED', color: 'bg-emerald-600 hover:bg-emerald-700 text-white', icon: '🚀' },
  ],
  PUBLISHED: [
    { label: 'Back to Draft', target: 'DRAFT', color: 'bg-amber-500 hover:bg-amber-600 text-white', icon: '✏️' },
    { label: 'Archive', target: 'ARCHIVED', color: 'bg-gray-600 hover:bg-gray-700 text-white', icon: '📦' },
  ],
  ARCHIVED: [],
};

export function ProgramStatusActions({
  programId,
  currentStatus,
  hasCohorts,
  hasActiveEnrollments,
}: ProgramStatusActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const actions = TRANSITIONS[currentStatus] ?? [];

  if (actions.length === 0) {
    return (
      <p className="text-xs text-gray-400 italic">This program is archived and cannot be modified.</p>
    );
  }

  function getDisabledReason(target: string): string | null {
    if (target === 'DRAFT' && hasCohorts) return 'Cannot revert to draft: cohorts already exist.';
    if (target === 'ARCHIVED' && hasActiveEnrollments) return 'Cannot archive: close all cohorts first.';
    return null;
  }

  async function handleStatusChange(target: string) {
    setError(null);
    startTransition(async () => {
      const result = await updateProgram(programId, { status: target as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' });
      if (!result.success) {
        toast(result.error, 'error');
        setError(result.error);
      } else {
        toast(`Program ${target.toLowerCase()} successfully.`, 'success');
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-2">
      {error && (
        <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}
      <div className="flex flex-wrap gap-2">
        {actions.map(({ label, target, color, icon }) => {
          const disabledReason = getDisabledReason(target);
          const isDisabled = !!disabledReason || isPending;
          return (
            <div key={target} className="relative group">
              <button
                type="button"
                disabled={isDisabled}
                onClick={() => handleStatusChange(target)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${color}`}
              >
                <span>{icon}</span>
                {isPending ? 'Saving…' : label}
              </button>
              {disabledReason && (
                <div className="absolute bottom-full left-0 mb-1 hidden group-hover:block z-10 w-56 rounded-lg bg-gray-900 px-3 py-2 text-xs text-white shadow-lg">
                  {disabledReason}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
