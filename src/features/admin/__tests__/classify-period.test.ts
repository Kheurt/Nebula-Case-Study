import { describe, it, expect } from 'vitest';
import { classifyPeriod } from '../services/types';

describe('classifyPeriod', () => {
  it('classifies past cohort', () => {
    const start = new Date('2020-01-01');
    const end = new Date('2020-03-31');
    expect(classifyPeriod(start, end)).toBe('PAST');
  });

  it('classifies upcoming cohort', () => {
    const start = new Date('2099-01-01');
    const end = new Date('2099-03-31');
    expect(classifyPeriod(start, end)).toBe('UPCOMING');
  });

  it('classifies active cohort (today in range)', () => {
    const start = new Date();
    start.setDate(start.getDate() - 7);
    const end = new Date();
    end.setDate(end.getDate() + 7);
    expect(classifyPeriod(start, end)).toBe('ACTIVE');
  });
});
