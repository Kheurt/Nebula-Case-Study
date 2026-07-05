'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { enrollInCohort } from '@/features/enrollment/actions/enroll';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/ToastProvider';

interface EnrollButtonProps {
  cohortId: string;
  enrollmentStatus: string;
  startDate: string | Date;
  endDate: string | Date;
}

const ERROR_MESSAGES: Record<string, string> = {
  COHORT_NOT_OPEN: 'This cohort is not open for enrollment.',
  COHORT_FULL: 'This cohort is full.',
  COHORT_ENDED: 'This cohort has already ended.',
  ALREADY_ENROLLED: 'You are already enrolled in this cohort.',
  PERMISSION_DENIED: 'You must be logged in as a student to enroll.',
  SESSION_INVALID: 'Your session is invalid. Please sign out and sign back in.',
  INTERNAL_ERROR: 'Something went wrong. Please try again.',
};

function getDaysUntil(date: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function EnrollButton({ cohortId, enrollmentStatus, startDate, endDate }: EnrollButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  const isUpcoming = start > now;
  const isPast = end < now;
  const daysUntil = isUpcoming ? getDaysUntil(start) : 0;

  const isOpen = enrollmentStatus === 'OPEN' && !isPast;
  const disabled = !isOpen || loading;

  function getButtonLabel(): string {
    if (loading) return 'Enrolling…';
    if (enrollmentStatus === 'FULL') return 'Cohort Full';
    if (enrollmentStatus === 'CLOSED') return 'Enrollment Closed';
    if (isPast) return 'Cohort Ended';
    if (isUpcoming) {
      return daysUntil === 1
        ? 'Enroll Now — starts tomorrow'
        : `Enroll Now — starts in ${daysUntil} days`;
    }
    return 'Enroll Now';
  }

  async function handleEnroll() {
    if (!session) {
      router.push('/login');
      return;
    }
    setLoading(true);
    const result = await enrollInCohort(cohortId);
    setLoading(false);

    if (result.success) {
      toast('Successfully enrolled! Check My Programs.', 'success');
      router.refresh();
    } else {
      toast(ERROR_MESSAGES[result.code ?? ''] ?? result.error, 'error');
    }
  }

  return (
    <Button
      onClick={handleEnroll}
      isLoading={loading}
      disabled={disabled}
      className="w-full"
      size="sm"
    >
      {getButtonLabel()}
    </Button>
  );
}
