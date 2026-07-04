import { z } from 'zod';

export const createExplorationSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  dueDate: z.string().datetime().optional(),
  programId: z.string().optional(),
  sessionId: z.string().optional(),
}).refine(
  (data) => data.programId || data.sessionId,
  { message: 'Either programId or sessionId is required', path: ['programId'] },
).refine(
  (data) => !(data.programId && data.sessionId),
  { message: 'Cannot provide both programId and sessionId', path: ['sessionId'] },
);

export const submitResponseSchema = z.object({
  responseText: z.string().min(1, 'Response cannot be empty').max(2000),
});

export const addFeedbackSchema = z.object({
  coachFeedback: z.string().min(1).max(1000),
});

export type CreateExplorationInput = z.infer<typeof createExplorationSchema>;
export type SubmitResponseInput = z.infer<typeof submitResponseSchema>;
export type AddFeedbackInput = z.infer<typeof addFeedbackSchema>;
