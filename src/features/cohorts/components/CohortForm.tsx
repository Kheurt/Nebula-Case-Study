'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { createCohortSchema, CreateCohortInput } from '@/features/cohorts/schemas';
import { createCohort } from '@/features/cohorts/actions/create-cohort';
import { suggestSessionDates } from '@/features/cohorts/actions/suggest-session-dates';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/ToastProvider';

interface CohortFormProps {
  programId: string;
  sessionCount: number;
}

export function CohortForm({ programId, sessionCount }: CohortFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [suggesting, setSuggesting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateCohortInput>({
    resolver: zodResolver(createCohortSchema),
    defaultValues: {
      maxParticipants: 10,
      sessions: Array.from({ length: sessionCount }, (_, i) => ({
        title: `Session ${i + 1}`,
        description: '',
        scheduledAt: '',
        durationMinutes: 45,
        orderIndex: i + 1,
      })),
    },
  });

  const { fields } = useFieldArray({ control, name: 'sessions' });
  const startDate = watch('startDate');
  const endDate = watch('endDate');

  async function handleSuggest() {
    if (!startDate || !endDate) return;
    setSuggesting(true);
    const result = await suggestSessionDates({ startDate, endDate, sessionCount });
    if (result.success) {
      result.data.forEach((date, i) => {
        // datetime-local inputs need "yyyy-MM-ddTHH:mm" format, not full ISO
        const local = date.replace(/:\d{2}\.\d{3}Z$/, '').replace(/Z$/, '');
        setValue(`sessions.${i}.scheduledAt`, local);
      });
    }
    setSuggesting(false);
  }

  async function onSubmit(data: CreateCohortInput) {
    setError(null);
    const result = await createCohort(programId, data);
    if (result.success) {
      toast('Cohort created successfully.', 'success');
      router.push(`/coach/programs/${programId}`);
      router.refresh();
    } else {
      toast(result.error, 'error');
      setError(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Start Date"
          type="datetime-local"
          {...register('startDate')}
          error={errors.startDate?.message}
        />
        <Input
          label="End Date"
          type="datetime-local"
          {...register('endDate')}
          error={errors.endDate?.message}
        />
      </div>

      <Input
        label={`Max Participants (1–20)`}
        type="number"
        min={1}
        max={20}
        {...register('maxParticipants', { valueAsNumber: true })}
        error={errors.maxParticipants?.message}
      />

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700">Sessions ({sessionCount})</label>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            isLoading={suggesting}
            onClick={handleSuggest}
          >
            Suggest dates
          </Button>
        </div>
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="p-4 border rounded-md space-y-3">
              <p className="font-medium text-sm text-gray-700">Session {index + 1}</p>
              <Input
                label="Title"
                {...register(`sessions.${index}.title`)}
                error={errors.sessions?.[index]?.title?.message}
              />
              <Input
                label="Description"
                {...register(`sessions.${index}.description`)}
              />
              <Input
                label="Scheduled At"
                type="datetime-local"
                {...register(`sessions.${index}.scheduledAt`)}
                error={errors.sessions?.[index]?.scheduledAt?.message}
              />
              <Input
                label="Duration (minutes)"
                type="number"
                min={15}
                max={480}
                {...register(`sessions.${index}.durationMinutes`, { valueAsNumber: true })}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" isLoading={isSubmitting}>Create Cohort</Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}
