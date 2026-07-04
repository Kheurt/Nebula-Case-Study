import { z } from 'zod';

export const sessionInputSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  scheduledAt: z.string().datetime({ message: 'Invalid ISO datetime' }),
  durationMinutes: z.number().int().min(15).max(480).default(45),
  orderIndex: z.number().int().min(1),
});

export const createCohortSchema = z.object({
  startDate: z.string().datetime({ message: 'Invalid ISO date' }),
  endDate: z.string().datetime({ message: 'Invalid ISO date' }),
  maxParticipants: z.number().int().min(1).max(20),
  sessions: z.array(sessionInputSchema).min(1),
}).refine(
  (data) => new Date(data.endDate) > new Date(data.startDate),
  { message: 'End date must be after start date', path: ['endDate'] },
);

export const suggestSessionDatesSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  sessionCount: z.number().int().min(2).max(4),
});

export type CreateCohortInput = z.infer<typeof createCohortSchema>;
export type SuggestSessionDatesInput = z.infer<typeof suggestSessionDatesSchema>;
