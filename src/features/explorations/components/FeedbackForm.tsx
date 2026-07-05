'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addFeedbackSchema, AddFeedbackInput } from '@/features/explorations/schemas';
import { addCoachFeedback } from '@/features/explorations/actions/add-feedback';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/ToastProvider';

interface FeedbackFormProps {
  submissionId: string;
  existingFeedback?: string | null;
  onSuccess?: () => void;
}

export function FeedbackForm({ submissionId, existingFeedback, onSuccess }: FeedbackFormProps) {
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddFeedbackInput>({
    resolver: zodResolver(addFeedbackSchema),
    defaultValues: { coachFeedback: existingFeedback ?? '' },
  });

  async function onSubmit(data: AddFeedbackInput) {
    setError(null);
    const result = await addCoachFeedback(submissionId, data);
    if (result.success) {
      toast('Feedback saved.', 'success');
      setDone(true);
      onSuccess?.();
    } else {
      toast(result.error, 'error');
      setError(result.error);
    }
  }

  if (done) {
    return <p className="text-sm text-green-600">Feedback saved.</p>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      {error && <div className="rounded-md bg-red-50 p-2 text-sm text-red-700">{error}</div>}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Coach Feedback</label>
        <textarea
          {...register('coachFeedback')}
          rows={4}
          placeholder="Provide feedback to the student… (max 1000 characters)"
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        {errors.coachFeedback && (
          <p className="text-xs text-red-600">{errors.coachFeedback.message}</p>
        )}
      </div>
      <Button type="submit" isLoading={isSubmitting} size="sm">
        Save Feedback
      </Button>
    </form>
  );
}
