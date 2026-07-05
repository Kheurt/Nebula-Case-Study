'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { submitResponseSchema, SubmitResponseInput } from '@/features/explorations/schemas';
import { submitExplorationResponse } from '@/features/explorations/actions/submit-response';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/ToastProvider';

interface SubmissionFormProps {
  explorationId: string;
  existingSubmission?: {
    id: string;
    responseText: string;
    coachFeedback: string | null;
    createdAt: Date | string;
  } | null;
  onSuccess?: () => void;
}

export function SubmissionForm({ explorationId, existingSubmission, onSuccess }: SubmissionFormProps) {
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<{
    responseText: string;
    coachFeedback: string | null;
  } | null>(existingSubmission ? { responseText: existingSubmission.responseText, coachFeedback: existingSubmission.coachFeedback } : null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SubmitResponseInput>({
    resolver: zodResolver(submitResponseSchema),
  });

  async function onSubmit(data: SubmitResponseInput) {
    setError(null);
    const result = await submitExplorationResponse(explorationId, data);
    if (result.success) {
      toast('Response submitted!', 'success');
      setSubmitted({ responseText: data.responseText, coachFeedback: null });
      reset();
      onSuccess?.();
    } else {
      toast(result.error, 'error');
      setError(result.error);
    }
  }

  if (submitted) {
    return (
      <div className="space-y-3">
        <div className="rounded-lg bg-green-50 border border-green-200 p-3">
          <p className="text-xs font-medium text-green-700 mb-1">Your response</p>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{submitted.responseText}</p>
        </div>
        {submitted.coachFeedback && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
            <p className="text-xs font-medium text-amber-700 mb-1">Coach feedback</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{submitted.coachFeedback}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      {error && <div className="rounded-md bg-red-50 p-2 text-sm text-red-700">{error}</div>}
      <div className="flex flex-col gap-1">
        <textarea
          {...register('responseText')}
          rows={5}
          placeholder="Write your response here… (max 2000 characters)"
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        {errors.responseText && (
          <p className="text-xs text-red-600">{errors.responseText.message}</p>
        )}
      </div>
      <Button type="submit" isLoading={isSubmitting} size="sm">
        Submit Response
      </Button>
    </form>
  );
}
