import { z } from 'zod';

export const enrollSchema = z.object({
  cohortId: z.string().min(1, 'Cohort ID is required'),
});

export type EnrollInput = z.infer<typeof enrollSchema>;
