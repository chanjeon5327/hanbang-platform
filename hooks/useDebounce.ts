'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * debounce된 값 반환
 * @param value 입력값
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
