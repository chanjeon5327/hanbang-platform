'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getBrowserSupabase } from '@/utils/supabase/client';
import { formatQty } from '@/lib/utils/format';
import Divider from '@/components/ui/Divider';

const TRADE_SOUND_PATH = '/sounds/trade.mp3';

type Trade = {
  id: string;
  price_usd: number;
  quantity: number;
  side: string;
  created_at: string;
};

function formatUsd(n: number): string {
  return `$${n.toFixed(2)}`;
}

type Props = {
  contentId: string;
  onTrade?: (priceUsd: number) => void;
  /** true면 거래 불가, empty state 메시지 표시 */
  disabled?: boolean;
};

export default function TradeHistoryRealtime({ contentId, onTrade, disabled }: Props) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [blinkId, setBlinkId] = useState<string | null>(null);
  const prevCountRef = useRef(0);
  const tradeAudioRef = useRef<HTMLAudioElement | null>(null);

  const playTradeSound = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      if (!tradeAudioRef.current) {
        tradeAudioRef.current = new Audio(TRADE_SOUND_PATH);
      }
      const a = tradeAudioRef.current;
      a.volume = 0.15;
      a.currentTime = 0;
      a.play().catch(() => {
        try {
          const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = 880;
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.08);
        } catch {
          /* ignore */
        }
      });
    } catch {
      /* ignore */
    }
  }, []);

  const fetchTrades = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders/trades?item_id=${contentId}&limit=50`, { cache: 'no-store' });
      const j = await res.json();
      const list = (j.trades ?? []).map((t: { id: string; price_usd?: number; quantity?: number; side?: string; created_at?: string }) => ({
        id: t.id,
        price_usd: Number(t.price_usd ?? 0),
        quantity: Number(t.quantity ?? 0),
        side: (t.side ?? 'buy').toLowerCase(),
        created_at: t.created_at ?? new Date().toISOString(),
      }));
      setTrades(list);
      if (list.length > 0 && onTrade) onTrade(list[0].price_usd);
    } catch {
      setTrades([]);
    } finally {
      setLoading(false);
    }
  }, [contentId, onTrade]);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  useEffect(() => {
    const supabase = getBrowserSupabase();
    if (!supabase?.channel) return;

    const channel = supabase
      .channel(`trades:${contentId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'trades',
          filter: `content_id=eq.${contentId}`,
        },
        (payload: { new: Record<string, unknown> }) => {
          const newRow = payload.new as { id: string; price_usd?: number; quantity?: number; buyer_id?: string; seller_id?: string; created_at?: string };
          if (newRow?.id) {
            const priceUsd = Number(newRow.price_usd ?? 0);
            if (priceUsd > 0 && onTrade) onTrade(priceUsd);
            playTradeSound();
            setBlinkId(newRow.id);
            setTimeout(() => setBlinkId(null), 400);
            setTrades((prev) => {
              const t: Trade = {
                id: newRow.id,
                price_usd: Number(newRow.price_usd ?? 0),
                quantity: Number(newRow.quantity ?? 0),
                side: newRow.buyer_id ? 'buy' : 'sell',
                created_at: newRow.created_at ?? new Date().toISOString(),
              };
              return [t, ...prev].slice(0, 50);
            });
          } else {
            fetchTrades();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [contentId, fetchTrades, onTrade, playTradeSound]);

  if (loading) {
    return (
      <div className="py-2 space-y-1">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="animate-pulse h-6 rounded" style={{ backgroundColor: 'var(--border)' }} />
        ))}
      </div>
    );
  }

  if (disabled) {
    return (
      <div className="py-6 text-center">
        <p className="caption" style={{ color: 'var(--text-secondary)' }}>
          현재는 거래가 준비 중이에요. 배당 정보만 확인할 수 있어요.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0 max-h-[240px] overflow-y-auto">
      <div className="grid grid-cols-3 gap-2 caption font-medium mb-1.5 px-1" style={{ color: 'var(--text-secondary)' }}>
        <span className="text-right">체결가</span>
        <span className="text-right">수량</span>
        <span className="text-right">시간</span>
      </div>
      {trades.length === 0 ? (
        <p className="caption py-6 text-center" style={{ color: 'var(--text-secondary)' }}>
          아직 체결 내역이 없습니다.
        </p>
      ) : (
        trades.map((t, idx) => {
          const isBuy = t.side === 'buy';
          const isBlink = blinkId === t.id;
          return (
            <React.Fragment key={t.id}>
              <div
                className={`grid grid-cols-3 gap-2 py-2 px-1 body-sm items-center transition-colors ${
                  isBlink ? (isBuy ? 'trade-blink-buy' : 'trade-blink-sell') : ''
                }`}
              >
              <span
                className="font-semibold metric-number text-right"
                style={{
                  color: isBuy ? 'var(--emerald)' : 'var(--accent-loss)',
                }}
              >
                {isBuy ? '▲' : '▼'} {formatUsd(t.price_usd)}
              </span>
              <span className="metric-number text-right" style={{ color: 'var(--text-secondary)' }}>
                {formatQty(t.quantity)}
              </span>
              <span className="metric-number caption text-right" style={{ color: 'var(--text-muted)' }}>
                {new Date(t.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
            {idx < trades.length - 1 && <Divider />}
          </React.Fragment>
          );
        })
      )}
      <style>{`
        @keyframes tradeBlinkBuy {
          0% { background-color: rgba(5,150,105,0.3); }
          100% { background-color: transparent; }
        }
        @keyframes tradeBlinkSell {
          0% { background-color: rgba(220,38,38,0.3); }
          100% { background-color: transparent; }
        }
        .trade-blink-buy { animation: tradeBlinkBuy 0.3s ease-out forwards; }
        .trade-blink-sell { animation: tradeBlinkSell 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
}
