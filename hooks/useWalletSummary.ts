'use client';

import { useEffect, useState } from 'react';
import { getBrowserSupabase } from '@/utils/supabase/client';

/** 홈·마이페이지 공통 자산 요약 타입 */
export type WalletSummary = {
  totalAssets: number;
  holdingsValue: number;
  cashBalance: number;
  totalDeposited: number;
  profit: number;
  profitRate: number;
};

export type WalletSummaryState = {
  data: WalletSummary | null;
  loading: boolean;
  error: 'unauthorized' | 'forbidden' | 'network' | null;
};

/**
 * /api/wallet/summary 기반 공통 자산 요약 훅
 * - 홈 MyAssetCard, 마이페이지 MyAssetSummary에서 동일 소스 사용
 */
export function useWalletSummary(): WalletSummaryState {
  const [data, setData] = useState<WalletSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<WalletSummaryState['error']>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const supabase = getBrowserSupabase();
        const { data: session } = await supabase.auth.getSession();
        if (!session.session?.user) {
          if (alive) {
            setData(null);
            setError('unauthorized');
          }
          return;
        }

        const res = await fetch('/api/wallet/summary', { cache: 'no-store' });
        if (!alive) return;

        if (res.status === 401) {
          setData(null);
          setError('unauthorized');
          return;
        }
        if (res.status === 403) {
          setData(null);
          setError('forbidden');
          return;
        }
        if (!res.ok) {
          setData(null);
          setError('network');
          return;
        }

        const json = await res.json();
        setData({
          totalAssets: Number(json.totalAssets) || 0,
          holdingsValue: Number(json.holdingsValue) || 0,
          cashBalance: Number(json.cashBalance) || 0,
          totalDeposited: Number(json.totalDeposited) || 0,
          profit: Number(json.profit) ?? Math.round((Number(json.totalAssets) || 0) - (Number(json.totalDeposited) || 0)),
          profitRate: Number(json.profitRate) || 0,
        });
        setError(null);
      } catch {
        if (alive) {
          setData(null);
          setError('network');
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return { data, loading, error };
}
