'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { createExplorationSchema, CreateExplorationInput } from '@/features/explorations/schemas';
import { createExploration } from '@/features/explorations/actions/create-exploration';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface ExplorationFormProps {
  programId?: string;
  sessionId?: string;
  onSuccess?: () => void;
}

export function ExplorationForm({ programId, sessionId, onSuccess }: ExplorationFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateExplorationInput>({
    resolver: zodResolver(createExplorationSchema),
    defaultValues: { programId, sessionId },
  });

  async function onSubmit(data: CreateExplorationInput) {
    setError(null);
    const result = await createExploration(data);
    if (result.success) {
      reset();
      onSuccess?.();
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <input type="hidden" {...register('programId')} />
      <input type="hidden" {...register('sessionId')} />
      <Input label="Title" {...register('title')} error={errors.title?.message} />
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Description / Instructions</label>
        <textarea
          {...register('description')}
          rows={3}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        {errors.description && <p className="text-xs text-red-600">{errors.description.message}</p>}
      </div>
      <Input label="Due Date (optional)" type="datetime-local" {...register('dueDate')} />
      <Button type="submit" isLoading={isSubmitting} size="sm">
        Create Exploration
      </Button>
    </form>
  );
}
