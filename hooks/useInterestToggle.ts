'use client';

import { useCallback, useState } from 'react';

type Options = {
  onSuccess?: (isInterested: boolean) => void;
  onError?: (msg: string) => void;
};

export function useInterestToggle(contentId: string | undefined, initial = false, options?: Options) {
  const [isInterested, setIsInterested] = useState(initial);
  const [loading, setLoading] = useState(false);

  const toggle = useCallback(async () => {
    if (!contentId) return;
    setLoading(true);
    try {
      const res = await fetch('/api/interests/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentId }),
      });
      const json = await res.json();
      if (json?.ok) {
        setIsInterested(json.isInterested);
        options?.onSuccess?.(json.isInterested);
      } else {
        options?.onError?.(json?.error ?? '실패');
      }
    } catch {
      options?.onError?.('네트워크 오류');
    } finally {
      setLoading(false);
    }
  }, [contentId, options]);

  return { isInterested, setInterested: setIsInterested, toggle, loading };
}
