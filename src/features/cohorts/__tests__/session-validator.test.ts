import { describe, it, expect } from 'vitest';
import { validateSessions } from '../services/session-validator';

describe('validateSessions', () => {
  const start = new Date('2025-01-01T09:00:00Z');
  const end = new Date('2025-03-31T18:00:00Z');

  it('accepts valid sessions', () => {
    const sessions = [
      { orderIndex: 1, scheduledAt: '2025-01-15T09:00:00Z', title: 'S1', description: 'D1', durationMinutes: 45 },
      { orderIndex: 2, scheduledAt: '2025-02-15T09:00:00Z', title: 'S2', description: 'D2', durationMinutes: 45 },
      { orderIndex: 3, scheduledAt: '2025-03-15T09:00:00Z', title: 'S3', description: 'D3', durationMinutes: 45 },
    ];
    const error = validateSessions(sessions, 3, start, end);
    expect(error).toBeNull();
  });

  it('rejects wrong session count', () => {
    const sessions = [
      { orderIndex: 1, scheduledAt: '2025-01-15T09:00:00Z', title: 'S1', description: 'D', durationMinutes: 45 },
    ];
    const error = validateSessions(sessions, 3, start, end);
    expect(error).not.toBeNull();
  });

  it('rejects duplicate orderIndexes', () => {
    const sessions = [
      { orderIndex: 1, scheduledAt: '2025-01-10T09:00:00Z', title: 'S1', description: 'D', durationMinutes: 45 },
      { orderIndex: 1, scheduledAt: '2025-02-10T09:00:00Z', title: 'S2', description: 'D', durationMinutes: 45 },
      { orderIndex: 3, scheduledAt: '2025-03-10T09:00:00Z', title: 'S3', description: 'D', durationMinutes: 45 },
    ];
    const error = validateSessions(sessions, 3, start, end);
    expect(error).not.toBeNull();
  });

  it('rejects sessions outside date range', () => {
    const sessions = [
      { orderIndex: 1, scheduledAt: '2024-12-01T09:00:00Z', title: 'S1', description: 'D', durationMinutes: 45 },
      { orderIndex: 2, scheduledAt: '2025-02-10T09:00:00Z', title: 'S2', description: 'D', durationMinutes: 45 },
      { orderIndex: 3, scheduledAt: '2025-03-15T09:00:00Z', title: 'S3', description: 'D', durationMinutes: 45 },
    ];
    const error = validateSessions(sessions, 3, start, end);
    expect(error).not.toBeNull();
  });
});
