'use client';

import { useState, useCallback } from 'react';
import type { ActionResult } from '@/lib/action-result';

/**
 * Hook to manage the state of a server action call.
 * Provides `execute`, `isLoading`, `error`, and `data`.
 */
export function useActionResult<TInput, TData>(
  action: (input: TInput) => Promise<ActionResult<TData>>
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TData | null>(null);

  const execute = useCallback(
    async (input: TInput) => {
      setIsLoading(true);
      setError(null);
      const result = await action(input);
      setIsLoading(false);
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error);
      }
      return result;
    },
    [action]
  );

  return { execute, isLoading, error, data };
}
