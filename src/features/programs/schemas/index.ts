import { z } from 'zod';

export const DOMAINS = ['FINANCE', 'CONSULTING', 'DATA', 'PRODUCT', 'SOFTWARE', 'MARKETING', 'ENTREPRENEURSHIP'] as const;
export const DIFFICULTY_LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const;
export const PROGRAM_STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const;

export const programFilterSchema = z.object({
  domain: z.enum(DOMAINS).optional(),
  search: z.string().optional(),
  coachId: z.string().optional(),
});

export const createProgramSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(120),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  domain: z.enum(DOMAINS),
  targetAudience: z.string().min(1),
  difficultyLevel: z.enum(DIFFICULTY_LEVELS),
  sessionCount: z.number().int().min(2).max(4),
  recommendedCohortSize: z.number().int().min(1).max(20),
  maxCohortSize: z.number().int().min(1).max(20),
  learningOutcomes: z.array(z.string().min(1)).min(1, 'At least one learning outcome is required'),
});

export const updateProgramSchema = z.object({
  title: z.string().min(3).max(120).optional(),
  description: z.string().min(10).optional(),
  domain: z.enum(DOMAINS).optional(),
  targetAudience: z.string().min(1).optional(),
  difficultyLevel: z.enum(DIFFICULTY_LEVELS).optional(),
  sessionCount: z.number().int().min(2).max(4).optional(),
  recommendedCohortSize: z.number().int().min(1).max(20).optional(),
  maxCohortSize: z.number().int().min(1).max(20).optional(),
  learningOutcomes: z.array(z.string().min(1)).min(1).optional(),
  status: z.enum(PROGRAM_STATUSES).optional(),
});

export type ProgramFilterInput = z.infer<typeof programFilterSchema>;
export type CreateProgramInput = z.infer<typeof createProgramSchema>;
export type UpdateProgramInput = z.infer<typeof updateProgramSchema>;
