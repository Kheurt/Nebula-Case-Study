import { describe, it, expect } from 'vitest';
import { suggestSessionDates } from '../session-scheduling';

describe('suggestSessionDates', () => {
  it('returns n dates distributed evenly', () => {
    const start = new Date('2025-01-01');
    const end = new Date('2025-12-31');
    const dates = suggestSessionDates(start, end, 3);
    expect(dates).toHaveLength(3);
    expect(dates[0]).toEqual(start);
    expect(dates[2]).toEqual(end);
  });

  it('works with 2 sessions', () => {
    const start = new Date('2025-01-01');
    const end = new Date('2025-06-30');
    const dates = suggestSessionDates(start, end, 2);
    expect(dates).toHaveLength(2);
    expect(dates[0]).toEqual(start);
    expect(dates[1]).toEqual(end);
  });

  it('returns dates in ascending order', () => {
    const start = new Date('2025-01-01');
    const end = new Date('2025-12-31');
    const dates = suggestSessionDates(start, end, 4);
    for (let i = 1; i < dates.length; i++) {
      expect(dates[i].getTime()).toBeGreaterThanOrEqual(dates[i - 1].getTime());
    }
  });
});
