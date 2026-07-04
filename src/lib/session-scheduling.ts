import { addDays } from 'date-fns';

/**
 * Suggests evenly distributed session dates within the cohort period.
 * Formula: addDays(startDate, Math.round((i * totalDays) / (n - 1)))
 * For n=1, returns [startDate].
 */
export function suggestSessionDates(
  startDate: Date,
  endDate: Date,
  count: number,
): Date[] {
  if (count <= 0) return [];
  if (count === 1) return [startDate];

  const totalDays = Math.floor(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  return Array.from({ length: count }, (_, i) => {
    const offset = Math.round((i * totalDays) / (count - 1));
    return addDays(startDate, offset);
  });
}
