interface SessionInput {
  scheduledAt: string;
  orderIndex: number;
}

interface ValidationError {
  code: string;
  message: string;
}

export function validateSessions(
  sessions: SessionInput[],
  expectedCount: number,
  startDate: Date,
  endDate: Date,
): ValidationError | null {
  if (sessions.length !== expectedCount) {
    return {
      code: 'SESSION_COUNT_MISMATCH',
      message: `Expected ${expectedCount} sessions but got ${sessions.length}.`,
    };
  }

  const orderIndexes = sessions.map((s) => s.orderIndex);
  const uniqueIndexes = new Set(orderIndexes);
  if (uniqueIndexes.size !== sessions.length) {
    return { code: 'DUPLICATE_ORDER_INDEX', message: 'Session order indexes must be unique.' };
  }

  for (const session of sessions) {
    const date = new Date(session.scheduledAt);
    if (date < startDate || date > endDate) {
      return {
        code: 'SESSION_OUT_OF_RANGE',
        message: `Session (orderIndex ${session.orderIndex}) is outside the cohort date range.`,
      };
    }
  }

  return null;
}
