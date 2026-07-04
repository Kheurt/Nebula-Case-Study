'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { submitResponseSchema, SubmitResponseInput } from '@/features/explorations/schemas';
import { submitExplorationResponse } from '@/features/explorations/actions/submit-response';
import { Button } from '@/components/ui/Button';

interface SubmissionFormProps {
  explorationId: string;
  onSuccess?: () => void;
}

export function SubmissionForm({ explorationId, onSuccess }: SubmissionFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

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
      reset();
      setDone(true);
      onSuccess?.();
    } else {
      setError(result.error);
    }
  }

  if (done) {
    return <p className="text-sm text-green-600">Response submitted successfully.</p>;
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
