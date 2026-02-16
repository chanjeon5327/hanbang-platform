'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * debounce??媛?諛섑솚
 * @param value ?낅젰媛?
 * @param delay ms
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
