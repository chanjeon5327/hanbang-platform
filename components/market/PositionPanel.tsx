'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { formatKrw, formatQty, formatRate } from '@/lib/utils/format';

type Position = {
  quantity: number;
  total_cost: number;
  avg_price: number;
  current_value: number;
  unrealized_pnl: number;
  unrealized_rate: number;
};

type Props = {
  assetId: string;
  sharePriceUsd: number;
  fxRate: number;
  isLoggedIn: boolean;
};

export default function PositionPanel({ assetId, sharePriceUsd, fxRate, isLoggedIn }: Props) {
  const [position, setPosition] = useState<Position | null>(null);
  const [loading, setLoading] = useState(false);

  const currentPriceKrw = Math.round(sharePriceUsd * fxRate);

  const fetchPosition = useCallback(async () => {
    if (!isLoggedIn) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/wallet/position?asset_id=${assetId}&current_price_krw=${currentPriceKrw}`,
        { cache: 'no-store' }
      );
      const d = await (res.ok ? res.json() : null);
      if (d?.quantity > 0) {
        setPosition({
          quantity: d.quantity,
          total_cost: d.total_cost ?? 0,
          avg_price: d.avg_price ?? 0,
          current_value: d.current_value ?? 0,
          unrealized_pnl: d.unrealized_pnl ?? 0,
          unrealized_rate: d.unrealized_rate ?? 0,
        });
      } else {
        setPosition(null);
      }
    } catch {
      setPosition(null);
    } finally {
      setLoading(false);
    }
  }, [assetId, currentPriceKrw, isLoggedIn]);

  useEffect(() => {
    fetchPosition();
  }, [fetchPosition]);

  useEffect(() => {
    const onRefresh = () => {
      fetchPosition();
    };
    window.addEventListener('invest-success', onRefresh);
    window.addEventListener('wallet-refresh', onRefresh);
    return () => {
      window.removeEventListener('invest-success', onRefresh);
      window.removeEventListener('wallet-refresh', onRefresh);
    };
  }, [fetchPosition]);

  if (!isLoggedIn) {
    return (
      <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--upbit-border)', backgroundColor: 'var(--upbit-bg)' }}>
        <p className="body-sm text-center" style={{ color: 'var(--upbit-text-dim)' }}>
          <Link href="/login" className="font-semibold" style={{ color: 'var(--upbit-bid)' }}>
            로그인
          </Link>
          후 포지션을 확인하세요
        </p>
      </div>
    );
  }

  if (loading && !position) {
    return (
      <div className="p-4 rounded-xl border animate-pulse" style={{ borderColor: 'var(--upbit-border)', backgroundColor: 'var(--upbit-bg)' }}>
        <div className="h-6 bg-[var(--upbit-border)] rounded mb-2 w-2/3" />
        <div className="h-5 bg-[var(--upbit-border)] rounded mb-2 w-1/2" />
        <div className="h-5 bg-[var(--upbit-border)] rounded w-1/3" />
      </div>
    );
  }

  if (!position || position.quantity <= 0) {
    return (
      <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--upbit-border)', backgroundColor: 'var(--upbit-bg)' }}>
        <p className="body-sm text-center" style={{ color: 'var(--upbit-text-dim)' }}>
          보유 자산이 없습니다.
        </p>
      </div>
    );
  }

  const pnlPositive = position.unrealized_pnl >= 0;

  return (
    <div className="p-4 rounded-xl border space-y-2" style={{ borderColor: 'var(--upbit-border)', backgroundColor: 'var(--upbit-bg)' }}>
      <div className="flex justify-between body-sm">
        <span style={{ color: 'var(--upbit-text-dim)' }}>보유 수량</span>
        <span className="text-title font-semibold tabular-nums text-right" style={{ color: 'var(--upbit-text)' }}>
          {formatQty(position.quantity)}주
        </span>
      </div>
      <div className="flex justify-between body-sm">
        <span style={{ color: 'var(--upbit-text-dim)' }}>평균 단가</span>
        <span className="font-semibold tabular-nums text-right" style={{ color: 'var(--upbit-text)' }}>
          {formatKrw(position.avg_price)}
        </span>
      </div>
      <div className="flex justify-between body-sm">
        <span style={{ color: 'var(--upbit-text-dim)' }}>평가 금액</span>
        <span className="text-display font-semibold tabular-nums text-right" style={{ color: 'var(--upbit-text)' }}>
          {formatKrw(position.current_value)}
        </span>
      </div>
      <div className="flex justify-between body-sm pt-1 border-t" style={{ borderColor: 'var(--upbit-border)' }}>
        <span style={{ color: 'var(--upbit-text-dim)' }}>평가 손익</span>
        <span
          className={`font-bold tabular-nums text-right ${pnlPositive ? 'text-red-600' : 'text-[var(--accent-loss)]'}`}
        >
          {(position.unrealized_pnl >= 0 ? '+' : '') + formatKrw(position.unrealized_pnl)}
        </span>
      </div>
      <div className="flex justify-between body-sm">
        <span style={{ color: 'var(--upbit-text-dim)' }}>수익률</span>
        <span
          className={`text-subtitle font-semibold tabular-nums text-right ${pnlPositive ? 'text-red-600' : 'text-[var(--accent-loss)]'}`}
        >
          {(position.unrealized_rate >= 0 ? '+' : '') + formatRate(position.unrealized_rate)}
        </span>
      </div>
      <Link
        href="/wallet"
        className="block mt-3 py-2 text-center body-sm font-semibold rounded-lg border transition active:opacity-90"
        style={{ borderColor: 'var(--upbit-border)', color: 'var(--upbit-bid)' }}
      >
        지갑에서 자세히 보기
      </Link>
    </div>
  );
}
