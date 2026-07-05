'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { createExplorationSchema, CreateExplorationInput } from '@/features/explorations/schemas';
import { createExploration } from '@/features/explorations/actions/create-exploration';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/ToastProvider';
import type { CoachProgramOption } from '@/features/explorations/actions/get-coach-program-options';

interface ExplorationFormProps {
  programId?: string;
  sessionId?: string;
  programOptions?: CoachProgramOption[];
  onSuccess?: () => void;
}

export function ExplorationForm({ programId, sessionId, programOptions, onSuccess }: ExplorationFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [linkType, setLinkType] = useState<'program' | 'session'>(sessionId ? 'session' : 'program');
  const standalone = !!programOptions;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateExplorationInput>({
    resolver: zodResolver(createExplorationSchema),
    defaultValues: { programId, sessionId },
  });

  const selectedProgramId = watch('programId');

  const allSessions = programOptions
    ? programOptions.flatMap((p) => p.sessions)
    : [];

  const sessionsForProgram = programOptions && selectedProgramId
    ? programOptions.find((p) => p.id === selectedProgramId)?.sessions ?? []
    : allSessions;

  function handleLinkTypeChange(type: 'program' | 'session') {
    setLinkType(type);
    if (type === 'program') {
      setValue('sessionId', undefined);
    } else {
      setValue('programId', undefined);
    }
  }

  async function onSubmit(data: CreateExplorationInput) {
    setError(null);
    const result = await createExploration(data);
    if (result.success) {
      toast('Exploration created successfully.', 'success');
      reset();
      onSuccess?.();
      if (standalone) {
        router.push('/coach/explorations');
      }
      router.refresh();
    } else {
      toast(result.error, 'error');
      setError(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-2xl">
      {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      {standalone ? (
        <>
          {/* Link type toggle */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Link to</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleLinkTypeChange('program')}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  linkType === 'program'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Program
              </button>
              <button
                type="button"
                onClick={() => handleLinkTypeChange('session')}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  linkType === 'session'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Session
              </button>
            </div>
          </div>

          {linkType === 'program' ? (
            <Select
              label="Program"
              placeholder="Select a program..."
              options={(programOptions ?? []).map((p) => ({ value: p.id, label: p.title }))}
              {...register('programId')}
              error={errors.programId?.message}
            />
          ) : (
            <Select
              label="Session"
              placeholder="Select a session..."
              options={sessionsForProgram.map((s) => ({
                value: s.id,
                label: `${s.title} (${s.cohortLabel})`,
              }))}
              {...register('sessionId')}
              error={errors.sessionId?.message}
            />
          )}
        </>
      ) : (
        <>
          <input type="hidden" {...register('programId')} />
          <input type="hidden" {...register('sessionId')} />
        </>
      )}

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

      <div className="flex gap-3">
        <Button type="submit" isLoading={isSubmitting}>
          Create Exploration
        </Button>
        {standalone && (
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
