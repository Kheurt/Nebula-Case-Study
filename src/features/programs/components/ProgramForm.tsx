'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { createProgramSchema, CreateProgramInput, DOMAINS, DIFFICULTY_LEVELS } from '@/features/programs/schemas';
import { createProgram } from '@/features/programs/actions/create-program';
import { updateProgram } from '@/features/programs/actions/update-program';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/ToastProvider';

interface ProgramFormProps {
  programId?: string;
  defaultValues?: Partial<CreateProgramInput> & { status?: string };
}

export function ProgramForm({ programId, defaultValues }: ProgramFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateProgramInput>({
    resolver: zodResolver(createProgramSchema),
    defaultValues: {
      sessionCount: 3,
      recommendedCohortSize: 3,
      maxCohortSize: 10,
      learningOutcomes: [''],
      ...defaultValues,
    },
  });

  const learningOutcomes = watch('learningOutcomes') ?? [''];

  function appendOutcome() {
    setValue('learningOutcomes', [...learningOutcomes, '']);
  }
  function removeOutcome(index: number) {
    setValue('learningOutcomes', learningOutcomes.filter((_, i) => i !== index));
  }

  async function onSubmit(data: CreateProgramInput) {
    setError(null);
    const result = programId
      ? await updateProgram(programId, data)
      : await createProgram(data);

    if (result.success) {
      toast(programId ? 'Program saved successfully.' : 'Program created successfully.', 'success');
      router.push(`/coach/programs/${result.data.programId}`);
      router.refresh();
    } else {
      toast(result.error, 'error');
      setError(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <Input label="Title" {...register('title')} error={errors.title?.message} />

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Description</label>
        <textarea
          {...register('description')}
          rows={4}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        {errors.description && <p className="text-xs text-red-600">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Domain"
          options={DOMAINS.map((d) => ({ value: d, label: d }))}
          {...register('domain')}
          error={errors.domain?.message}
        />
        <Select
          label="Difficulty"
          options={DIFFICULTY_LEVELS.map((d) => ({ value: d, label: d }))}
          {...register('difficultyLevel')}
          error={errors.difficultyLevel?.message}
        />
      </div>

      <Input label="Target Audience" {...register('targetAudience')} error={errors.targetAudience?.message} />

      <div className="grid grid-cols-3 gap-4">
        <Input
          label="Sessions (2–4)"
          type="number"
          min={2}
          max={4}
          {...register('sessionCount', { valueAsNumber: true })}
          error={errors.sessionCount?.message}
        />
        <Input
          label="Recommended Cohort Size"
          type="number"
          min={1}
          max={20}
          {...register('recommendedCohortSize', { valueAsNumber: true })}
        />
        <Input
          label="Max Cohort Size"
          type="number"
          min={1}
          max={20}
          {...register('maxCohortSize', { valueAsNumber: true })}
          error={errors.maxCohortSize?.message}
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">Learning Outcomes</label>
        <div className="space-y-2">
          {learningOutcomes.map((_, index) => (
            <div key={index} className="flex gap-2">
              <input
                {...register(`learningOutcomes.${index}`)}
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder={`Outcome ${index + 1}`}
              />
              {learningOutcomes.length > 1 && (
                <Button type="button" variant="danger" size="sm" onClick={() => removeOutcome(index)}>
                  ✕
                </Button>
              )}
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-2"
          onClick={appendOutcome}
        >
          + Add outcome
        </Button>
        {errors.learningOutcomes && (
          <p className="text-xs text-red-600 mt-1">At least one learning outcome is required.</p>
        )}
      </div>

      <div className="flex gap-3">
        <Button type="submit" isLoading={isSubmitting}>
          {programId ? 'Save changes' : 'Create Program'}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
