'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { formatQty } from '@/lib/utils/format';

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
};

export default function TradeHistoryRealtime({ contentId, onTrade }: Props) {
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
    const supabase = createClient();
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
        (payload) => {
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
      <div className="py-4 space-y-2">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="animate-pulse h-8 rounded bg-[var(--upbit-bg)]" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-0 max-h-[240px] overflow-y-auto">
      <div className="grid grid-cols-3 gap-2 text-[11px] font-medium mb-2 px-2" style={{ color: 'var(--upbit-text-dim)' }}>
        <span>체결가</span>
        <span className="text-right">수량</span>
        <span className="text-right">시간</span>
      </div>
      {trades.length === 0 ? (
        <p className="text-[13px] py-8 text-center" style={{ color: 'var(--upbit-text-dim)' }}>
          아직 체결 내역이 없습니다.
        </p>
      ) : (
        trades.map((t) => {
          const isBuy = t.side === 'buy';
          const isBlink = blinkId === t.id;
          return (
            <div
              key={t.id}
              className={`grid grid-cols-3 gap-2 py-1.5 px-2 text-[13px] items-center ${
                isBlink ? (isBuy ? 'trade-blink-buy' : 'trade-blink-sell') : ''
              }`}
              style={{
                borderBottom: '1px solid var(--upbit-border)',
              }}
            >
              <span
                className="font-semibold tabular-nums"
                style={{
                  color: isBuy ? 'var(--upbit-bid)' : 'var(--upbit-ask)',
                }}
              >
                {isBuy ? '▲' : '▼'} {formatUsd(t.price_usd)}
              </span>
              <span className="tabular-nums text-right" style={{ color: 'var(--upbit-text-dim)' }}>
                {formatQty(t.quantity)}
              </span>
              <span className="text-[11px] text-right" style={{ color: 'var(--upbit-text-dim)' }}>
                {new Date(t.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          );
        })
      )}
      <style>{`
        @keyframes tradeBlinkBuy {
          0% { background-color: rgba(30,136,229,0.5); }
          100% { background-color: transparent; }
        }
        @keyframes tradeBlinkSell {
          0% { background-color: rgba(229,57,53,0.5); }
          100% { background-color: transparent; }
        }
        .trade-blink-buy { animation: tradeBlinkBuy 0.3s ease-out forwards; }
        .trade-blink-sell { animation: tradeBlinkSell 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
}
