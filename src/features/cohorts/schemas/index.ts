import { z } from 'zod';

/** Accepts both datetime-local ("2026-07-06T12:00") and full ISO ("2026-07-06T12:00:00.000Z") */
const datetimeString = (msg: string) =>
  z.string().refine((v) => !isNaN(Date.parse(v)), { message: msg });

export const sessionInputSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  scheduledAt: datetimeString('Invalid datetime'),
  durationMinutes: z.number().int().min(15).max(480),
  orderIndex: z.number().int().min(1),
});

export const createCohortSchema = z.object({
  startDate: datetimeString('Invalid date'),
  endDate: datetimeString('Invalid date'),
  maxParticipants: z.number().int().min(1).max(20),
  sessions: z.array(sessionInputSchema).min(1),
}).refine(
  (data) => new Date(data.endDate) > new Date(data.startDate),
  { message: 'End date must be after start date', path: ['endDate'] },
);

export const suggestSessionDatesSchema = z.object({
  startDate: datetimeString('Invalid date'),
  endDate: datetimeString('Invalid date'),
  sessionCount: z.number().int().min(2).max(4),
});

export type CreateCohortInput = z.infer<typeof createCohortSchema>;
export type SuggestSessionDatesInput = z.infer<typeof suggestSessionDatesSchema>;
