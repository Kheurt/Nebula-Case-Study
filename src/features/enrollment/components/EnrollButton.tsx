'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { enrollInCohort } from '@/features/enrollment/actions/enroll';
import { Button } from '@/components/ui/Button';

interface EnrollButtonProps {
  cohortId: string;
  enrollmentStatus: string;
}

const ERROR_MESSAGES: Record<string, string> = {
  COHORT_NOT_OPEN: 'This cohort is no longer open for enrollment.',
  COHORT_FULL: 'This cohort is full.',
  ALREADY_ENROLLED: 'You are already enrolled in this cohort.',
  PERMISSION_DENIED: 'You must be logged in as a student to enroll.',
  INTERNAL_ERROR: 'Something went wrong. Please try again.',
};

export function EnrollButton({ cohortId, enrollmentStatus }: EnrollButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const disabled = enrollmentStatus !== 'OPEN';

  async function handleEnroll() {
    if (!session) {
      router.push('/login');
      return;
    }
    setLoading(true);
    setMessage(null);
    const result = await enrollInCohort(cohortId);
    setLoading(false);

    if (result.success) {
      setMessage({ text: 'Enrolled! Check My Programs.', type: 'success' });
      router.refresh();
    } else {
      setMessage({ text: ERROR_MESSAGES[result.code] ?? result.error, type: 'error' });
    }
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleEnroll}
        isLoading={loading}
        disabled={disabled || loading}
        className="w-full"
        size="sm"
      >
        {disabled
          ? enrollmentStatus === 'FULL'
            ? 'Cohort Full'
            : 'Closed'
          : 'Enroll'}
      </Button>
      {message && (
        <p
          className={`text-xs ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
