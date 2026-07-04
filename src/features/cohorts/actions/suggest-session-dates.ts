'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { requirePermission } from '@/lib/permissions';
import { suggestSessionDates as suggestDates } from '@/lib/session-scheduling';
import { suggestSessionDatesSchema, SuggestSessionDatesInput } from '../schemas';
import { ActionResult } from '@/lib/action-result';

export async function suggestSessionDates(
  input: SuggestSessionDatesInput,
): Promise<ActionResult<string[]>> {
  const session = await getServerSession(authOptions);
  requirePermission(session, 'cohort:create');

  const parsed = suggestSessionDatesSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message, code: 'VALIDATION_ERROR' };
  }

  const { startDate, endDate, sessionCount } = parsed.data;
  const dates = suggestDates(new Date(startDate), new Date(endDate), sessionCount);
  return { success: true, data: dates.map((d) => d.toISOString()) };
}
