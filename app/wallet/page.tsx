'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Link from 'next/link';
import { Download, ArrowLeftRight, Upload } from 'lucide-react';

/* 토스형 정적 UI + 업비트형 동적 UI */
const TOSS = {
  bg: '#f2f4f6',
  card: '#ffffff',
  blue: '#3182f6',
  text: '#191f28',
  secondary: '#6b7684',
  border: '#e5e8eb',
  positive: '#00c48c',
  negative: '#eb4d3d',
} as const;
const UPBIT = {
  panel: '#161616',
  border: '#2b2b2b',
  bid: '#1e88e5',
  ask: '#e53935',
  text: '#e0e0e0',
  dim: '#8e8e8e',
  positive: '#00c48c',
} as const;

type LedgerEntry = {
  id: string;
  order_id: string | null;
  entry_type: string;
  currency: string;
  amount: number;
  asset_id: string | null;
  quantity: number;
  memo: string | null;
  created_at: string;
};

const SECTION_GAP = 'mb-6';

/** 레벨 1~5: 일 거래량 기준 (만원) → 얼굴 이모지 */
const LEVEL_CONFIG = [
  { minVolume: 1000, icon: '🐰', label: '토끼' },
  { minVolume: 10000, icon: '🐴', label: '말' },
  { minVolume: 100000, icon: '🐯', label: '표범' },
  { minVolume: 1000000, icon: '🦁', label: '사자' },
  { minVolume: 10000000, icon: '🦅', label: '독수리' },
] as const;

function LevelCard({ level, className = '' }: { level: 1 | 2 | 3 | 4 | 5; className?: string }) {
  const cfg = LEVEL_CONFIG[level - 1];
  return (
    <div
      className={`rounded-2xl p-4 flex items-center justify-between border min-h-[88px] ${className}`}
      style={{ backgroundColor: 'var(--toss-card)', borderColor: 'var(--toss-border)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
    >
      <div>
        <div className="text-[11px] font-medium mb-0.5" style={{ color: 'var(--toss-text-secondary)' }}>나의 레벨</div>
        <span className="text-[15px] font-bold" style={{ color: 'var(--toss-text)' }}>LV{level}</span>
      </div>
      <span className="shrink-0" style={{ fontSize: 36 }} title={cfg.label} aria-hidden>{cfg.icon}</span>
    </div>
  );
}

export default function Wallet() {
  const { userCash, holdings, history, sellStock } = useStore();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [ledgerLoading, setLedgerLoading] = useState(true);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    fetch('/api/wallet/ledger')
      .then((res) => (res.ok ? res.json() : { entries: [] }))
      .then((data) => {
        const entries = data.entries ?? [];
        setLedgerEntries(entries);

        let total = 0;
        entries.forEach((r: LedgerEntry) => {
          if (r.entry_type === 'CASH_DEBIT') total -= Math.abs(Number(r.amount));
          if (r.entry_type === 'CASH_CREDIT') total += Number(r.amount);
        });
        setBalance(total);
      })
      .catch(() => {
        setLedgerEntries([]);
        setBalance(0);
      })
      .finally(() => setLedgerLoading(false));
  }, []);

  const totalAssets = useMemo(() => {
    const holdingsValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
    return balance + holdingsValue;
  }, [balance, holdings]);

  const totalReturn = useMemo(() => {
    const holdingsValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
    const holdingsCost = holdings.reduce((sum, h) => sum + h.avgPrice * h.quantity, 0);
    if (holdingsCost === 0) return { amount: 0, rate: 0 };
    return {
      amount: holdingsValue - holdingsCost,
      rate: ((holdingsValue - holdingsCost) / holdingsCost) * 100,
    };
  }, [holdings]);

  const returnChartData = useMemo(() => {
    if (holdings.length === 0) {
      return Array.from({ length: 30 }, (_, i) => ({ date: `${i + 1}일`, return: 0 }));
    }
    const baseReturn = totalReturn.rate;
    return Array.from({ length: 30 }, (_, i) => ({
      date: `${i + 1}일`,
      return: Math.max(0, baseReturn + Math.sin(i / 5) * 5),
    }));
  }, [holdings, totalReturn.rate]);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleSell = (holding: (typeof holdings)[0]) => {
    const success = sellStock({ name: holding.name, id: holding.id, price: holding.currentPrice }, 1);
    if (success) {
      setToastMessage(`수익 실현 완료 (+${holding.currentPrice.toLocaleString()}원)`);
      setShowToast(true);
    } else {
      setToastMessage('매도에 실패했습니다.');
      setShowToast(true);
    }
  };

  const hasLedger = ledgerEntries.length > 0;
  const hasHistory = history.length > 0;

  return (
    <div className="min-h-screen pb-24 bg-[var(--toss-bg)]">
      {showToast && (
        <div
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[10000] px-5 py-3 rounded-xl font-semibold text-sm shadow-lg"
          style={{ backgroundColor: 'var(--toss-text)', color: 'var(--toss-card)' }}
        >
          {toastMessage}
        </div>
      )}

      <header className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between bg-[var(--toss-bg)]">
        <Link href="/" className="text-[14px] font-medium text-[var(--toss-text-secondary)]">‹ 뒤로</Link>
        <h1 className="text-[17px] font-bold text-[var(--toss-text)]">내 자산</h1>
        <span className="w-10" />
      </header>

      <main className="px-4 pt-2 pb-8">
        {/* 1. 총 평가 자산 (토스형 카드) */}
        <div className={`rounded-2xl p-6 ${SECTION_GAP}`} style={{ backgroundColor: 'var(--toss-card)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div className="text-[13px] font-medium mb-1" style={{ color: 'var(--toss-text-secondary)' }}>총 평가 자산</div>
          <div className="text-[28px] font-bold tracking-tight" style={{ color: 'var(--toss-text)', fontVariantNumeric: 'tabular-nums' }}>
            ₩{totalAssets.toLocaleString()}
          </div>
          {totalReturn.rate !== 0 && (
            <div className="text-[14px] font-semibold mt-1" style={{ color: totalReturn.amount >= 0 ? '#00c48c' : '#eb4d3d', fontVariantNumeric: 'tabular-nums' }}>
              {totalReturn.amount >= 0 ? '+' : ''}{totalReturn.rate.toFixed(2)}%
              <span className="text-[12px] ml-1 font-normal opacity-90">
                ({totalReturn.amount >= 0 ? '+' : ''}{totalReturn.amount.toLocaleString()}원)
              </span>
            </div>
          )}
          <div className="mt-4 pt-4 flex gap-6 text-[13px]" style={{ borderTop: `1px solid ${'var(--toss-border)'}` }}>
            <div>
              <span style={{ color: 'var(--toss-text-secondary)' }}>예수금 </span>
              <span className="font-semibold" style={{ color: 'var(--toss-text)' }}>{balance.toLocaleString()}원</span>
            </div>
            <div>
              <span style={{ color: 'var(--toss-text-secondary)' }}>보유평가 </span>
              <span className="font-semibold" style={{ color: 'var(--toss-text)' }}>
                {holdings.reduce((s, h) => s + h.currentValue, 0).toLocaleString()}원
              </span>
            </div>
          </div>
        </div>

        {/* 2. 핵심 CTA: 입금/출금/교환 */}
        <div className={`grid grid-cols-3 gap-2 ${SECTION_GAP}`}>
          <Link
            href="/wallet/deposit"
            className="rounded-2xl p-4 flex flex-col gap-1 transition active:scale-[0.98]"
            style={{ backgroundColor: 'var(--toss-blue)', color: 'var(--toss-card)', boxShadow: '0 4px 12px rgba(49,130,246,0.35)' }}
          >
            <Download size={26} strokeWidth={2} />
            <span className="text-[14px] font-bold">입금</span>
            <span className="text-[11px] opacity-90">KRW 충전</span>
          </Link>
          <Link
            href="/wallet/swap"
            className="rounded-2xl p-4 flex flex-col gap-1 transition active:scale-[0.98] border"
            style={{ backgroundColor: 'var(--toss-card)', borderColor: 'var(--toss-border)', color: 'var(--toss-text)' }}
          >
            <ArrowLeftRight size={26} strokeWidth={2} />
            <span className="text-[14px] font-bold">교환</span>
            <span className="text-[11px]" style={{ color: 'var(--toss-text-secondary)' }}>토큰 스왑</span>
          </Link>
          <Link
            href="/wallet/withdraw"
            className="rounded-2xl p-4 flex flex-col gap-1 transition active:scale-[0.98] border"
            style={{ backgroundColor: 'var(--toss-card)', borderColor: 'var(--toss-border)', color: 'var(--toss-text)' }}
          >
            <Upload size={26} strokeWidth={2} />
            <span className="text-[14px] font-bold">출금</span>
            <span className="text-[11px]" style={{ color: 'var(--toss-text-secondary)' }}>계좌 이체</span>
          </Link>
        </div>

        {/* 2-1. 나의 레벨 (데모: LV3) */}
        <LevelCard level={3} className={SECTION_GAP} />

        {/* 3. 수익률 그래프 (holdings 있을 때만) */}
        {holdings.length > 0 && (
          <div className={`rounded-2xl p-4 ${SECTION_GAP}`} style={{ backgroundColor: 'var(--toss-card)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <h3 className="text-[15px] font-bold mb-3" style={{ color: 'var(--toss-text)' }}>수익률 추이</h3>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={returnChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={'var(--toss-border)'} />
                <XAxis dataKey="date" tick={{ fill: 'var(--toss-text-secondary)', fontSize: 10 }} stroke={'var(--toss-border)'} />
                <YAxis tick={{ fill: 'var(--toss-text-secondary)', fontSize: 10 }} stroke={'var(--toss-border)'} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--toss-card)', border: `1px solid ${'var(--toss-border)'}`, borderRadius: 12, color: 'var(--toss-text)' }}
                />
                <Line type="monotone" dataKey="return" stroke={'var(--toss-blue)'} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* 4. 보유 상품 */}
        <div className={SECTION_GAP}>
          <h3 className="text-[15px] font-bold mb-3" style={{ color: 'var(--toss-text)' }}>보유 상품</h3>
          {holdings.length === 0 ? (
            <div className="rounded-2xl py-14 text-center text-[14px]" style={{ backgroundColor: 'var(--toss-card)', color: 'var(--toss-text-secondary)' }}>
              보유 중인 상품이 없습니다.
            </div>
          ) : (
            <div className="space-y-3">
              {holdings.map((h) => {
                const cost = h.avgPrice * h.quantity;
                const profit = h.currentValue - cost;
                const rate = cost > 0 ? (profit / cost) * 100 : 0;
                return (
                  <div
                    key={h.id}
                    className="rounded-2xl p-4 flex justify-between items-center"
                    style={{ backgroundColor: 'var(--toss-card)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
                  >
                    <div>
                      <div className="font-bold text-[15px]" style={{ color: 'var(--toss-text)' }}>{h.name}</div>
                      <div className="text-[12px] mt-0.5" style={{ color: 'var(--toss-text-secondary)' }}>
                        {h.quantity}주 · 평균 {h.avgPrice.toLocaleString()}원
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[15px]" style={{ color: 'var(--toss-text)', fontVariantNumeric: 'tabular-nums' }}>
                        {h.currentValue.toLocaleString()}원
                      </div>
                      <div className="text-[13px] font-semibold" style={{ color: profit >= 0 ? '#00c48c' : '#eb4d3d', fontVariantNumeric: 'tabular-nums' }}>
                        {profit >= 0 ? '+' : ''}{rate.toFixed(2)}%
                      </div>
                      <button
                        onClick={() => handleSell(h)}
                        className="mt-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-white"
                        style={{ backgroundColor: '#eb4d3d' }}
                      >
                        매도
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 5. 거래 내역 (업비트형 어두운 영역) */}
        <div className={SECTION_GAP}>
          <h3 className="text-[15px] font-bold mb-3" style={{ color: 'var(--toss-text)' }}>거래 내역</h3>
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: UPBIT.panel, border: `1px solid ${UPBIT.border}` }}>
            {ledgerLoading ? (
              <div className="py-12 text-center text-[14px]" style={{ color: UPBIT.dim }}>확인 중…</div>
            ) : hasLedger ? (
              ledgerEntries.slice(0, 15).map((l) => (
                <div key={l.id} className="flex justify-between items-center px-4 py-4" style={{ borderBottom: `1px solid ${UPBIT.border}` }}>
                  <div>
                    <div className="font-semibold text-[14px]" style={{ color: UPBIT.text }}>
                      {l.entry_type === 'CASH_DEBIT' ? '결제' : '매수'}
                    </div>
                    <div className="text-[12px] mt-0.5" style={{ color: UPBIT.dim }}>
                      {new Date(l.created_at).toLocaleString('ko-KR')}
                    </div>
                  </div>
                  <div className="text-right">
                    {l.entry_type === 'CASH_DEBIT' && (
                      <span className="font-bold text-[14px]" style={{ color: UPBIT.ask, fontVariantNumeric: 'tabular-nums' }}>
                        -{Math.abs(Number(l.amount)).toLocaleString()}원
                      </span>
                    )}
                    {l.entry_type === 'ASSET_CREDIT' && (
                      <span className="font-bold text-[14px]" style={{ color: UPBIT.positive, fontVariantNumeric: 'tabular-nums' }}>
                        +{Number(l.quantity).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : hasHistory ? (
              history.slice(0, 15).map((tx) => (
                <div key={tx.id} className="flex justify-between items-center px-4 py-4" style={{ borderBottom: `1px solid ${UPBIT.border}` }}>
                  <div>
                    <div className="font-semibold text-[14px]" style={{ color: UPBIT.text }}>{tx.name}</div>
                    <div className="text-[12px] mt-0.5" style={{ color: UPBIT.dim }}>{tx.date} · {tx.qty}주</div>
                  </div>
                  <div
                    className="font-bold text-[14px]"
                    style={{ color: tx.type === '매수' ? UPBIT.ask : UPBIT.positive, fontVariantNumeric: 'tabular-nums' }}
                  >
                    {tx.type === '매수' ? '-' : '+'}{tx.total.toLocaleString()}원
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-[14px]" style={{ color: UPBIT.dim }}>
                거래 내역이 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* 6. 입출금 안내 (접이식 느낌) */}
        <details className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--toss-card)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <summary className="px-4 py-4 text-[13px] font-semibold cursor-pointer" style={{ color: 'var(--toss-text-secondary)' }}>
            입출금 안내
          </summary>
          <div className="px-4 pb-4 pt-0 space-y-2 text-[13px]">
            <div className="flex justify-between">
              <span style={{ color: 'var(--toss-text-secondary)' }}>입금 수수료</span>
              <span style={{ color: 'var(--toss-text)' }}>무료</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--toss-text-secondary)' }}>출금 수수료</span>
              <span style={{ color: 'var(--toss-text)' }}>1건당 1,000원</span>
            </div>
            <p className="text-[11px] mt-2 leading-relaxed" style={{ color: 'var(--toss-text-secondary)' }}>
              입금은 당일 23:00까지 접수분 영업일 기준 처리됩니다.
            </p>
          </div>
        </details>
      </main>
    </div>
  );
}
