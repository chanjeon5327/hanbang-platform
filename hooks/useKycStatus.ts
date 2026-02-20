'use client';

import { useEffect, useState, useCallback } from 'react';

export type KycStatus = 'NOT_STARTED' | 'PENDING' | 'APPROVED' | 'REJECTED';

const CACHE_MS = 12_000;

let cache: { status: KycStatus; reason?: string; ts: number } | null = null;

function parseStatus(data: Record<string, unknown> | null): { status: KycStatus; reason?: string } {
  if (!data) return { status: 'NOT_STARTED' };

  const raw = String(data.kyc_status ?? data.user_status ?? '').toLowerCase();
  const verification = data.verification as Record<string, unknown> | undefined;
  const verificationStatus = String(verification?.status ?? '').toLowerCase();
  const userStatus = String(data.user_status ?? '').toUpperCase();
  const reason = verification?.rejection_reason as string | undefined;

  if (
    raw.includes('approved') ||
    raw === 'approved' ||
    verificationStatus.includes('approved')
  ) {
    return { status: 'APPROVED' };
  }
  if (
    raw.includes('reject') ||
    raw.includes('denied') ||
    verificationStatus.includes('reject') ||
    verificationStatus.includes('denied')
  ) {
    return { status: 'REJECTED', reason };
  }
  if (
    raw.includes('pending') ||
    raw.includes('submitted') ||
    verificationStatus.includes('submitted') ||
    verificationStatus.includes('in_review') ||
    userStatus === 'KYC_SUBMITTED'
  ) {
    return { status: 'PENDING', reason };
  }

  return { status: 'NOT_STARTED' };
}

export function useKycStatus() {
  const [status, setStatus] = useState<KycStatus>('NOT_STARTED');
  const [reason, setReason] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(() => {
    const now = Date.now();
    if (cache && now - cache.ts < CACHE_MS) {
      setStatus(cache.status);
      setReason(cache.reason);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    fetch('/api/kyc/status', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const parsed = parseStatus(d);
        setStatus(parsed.status);
        setReason(parsed.reason);
        cache = { status: parsed.status, reason: parsed.reason, ts: Date.now() };
      })
      .catch((e) => {
        setStatus('NOT_STARTED');
        setError(e instanceof Error ? e.message : 'Failed to fetch');
      })
      .finally(() => setLoading(false));
  }, []);

  const refresh = useCallback(() => {
    cache = null;
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return {
    status,
    reason,
    loading,
    error,
    refresh,
    isApproved: status === 'APPROVED',
  };
}
