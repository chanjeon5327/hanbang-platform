'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeftRight } from 'lucide-react';
import { TOKENS, TokenId } from '@/lib/tokens';
import { useToast } from '@/context/ToastContext';

/* 토큰 교환/스왑 — KRW, USDT, USDC, BTC, ETH 간 환전 */

const TOKEN_IDS: TokenId[] = ['KRW', 'USDT', 'USDC', 'BTC', 'ETH'];

function getRate(from: TokenId, to: TokenId): number {
  if (from === to) return 1;
  const fromKrw = TOKENS.find((t) => t.id === from)?.krwPerUnit ?? 1;
  const toKrw = TOKENS.find((t) => t.id === to)?.krwPerUnit ?? 1;
  return fromKrw / toKrw;
}

function formatDisplay(amount: number, tokenId: TokenId): string {
  const token = TOKENS.find((t) => t.id === tokenId);
  if (!token) return amount.toLocaleString();
  if (tokenId === 'KRW') return `₩${amount.toLocaleString()}`;
  const formatted = amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: token.decimals,
  });
  return `${formatted} ${token.symbol}`;
}

export default function SwapPage() {
  const { toast } = useToast();
  const [fromToken, setFromToken] = useState<TokenId>('KRW');
  const [toToken, setToToken] = useState<TokenId>('USDT');
  const [fromAmount, setFromAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (fromToken === toToken) {
      const next = TOKEN_IDS.find((id) => id !== fromToken) ?? 'KRW';
      setToToken(next);
    }
  }, [fromToken, toToken]);

  const rate = useMemo(() => getRate(fromToken, toToken), [fromToken, toToken]);
  const toAmount = useMemo(() => {
    const n = parseFloat(fromAmount) || 0;
    return n * rate;
  }, [fromAmount, rate]);

  const handleSwapTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount('');
  };

  const handleSwap = async () => {
    const n = parseFloat(fromAmount) || 0;
    if (n <= 0) {
      toast('금액을 입력하세요.');
      return;
    }
    if (fromToken === toToken) {
      toast('같은 토큰끼리는 교환할 수 없습니다.');
      return;
    }
    setLoading(true);
    try {
      // TODO: 실제 교환 API 연동
      await new Promise((r) => setTimeout(r, 800));
      toast(`${formatDisplay(n, fromToken)} → ${formatDisplay(toAmount, toToken)} 교환 요청이 접수되었습니다. (데모)`);
      setFromAmount('');
    } catch {
      toast('교환 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-24" style={{ backgroundColor: 'var(--upbit-bg)' }}>
      <header className="sticky top-0 z-50 border-b px-4 py-3 flex items-center" style={{ borderColor: 'var(--upbit-border)', backgroundColor: 'var(--upbit-bg)' }}>
        <Link href="/wallet" className="text-sm" style={{ color: 'var(--upbit-text-dim)' }}>‹ 뒤로</Link>
        <h1 className="flex-1 text-center body font-bold" style={{ color: 'var(--upbit-text)' }}>토큰 교환</h1>
        <span className="w-6" />
      </header>

      <div className="py-6">
        <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: 'var(--upbit-panel)', borderColor: 'var(--upbit-border)' }}>
          {/* From */}
          <div className="p-4 border-b" style={{ borderColor: 'var(--upbit-border)' }}>
            <div className="caption mb-2" style={{ color: 'var(--upbit-text-dim)' }}>출금 (From)</div>
            <div className="flex items-center gap-3">
              <select
                value={fromToken}
                onChange={(e) => setFromToken(e.target.value as TokenId)}
                className="px-3 py-2.5 rounded-lg body-sm font-semibold border"
                style={{ backgroundColor: 'var(--upbit-bg)', borderColor: 'var(--upbit-border)', color: 'var(--upbit-text)' }}
              >
                {TOKEN_IDS.map((id) => (
                  <option key={id} value={id}>
                    {TOKENS.find((t) => t.id === id)?.symbol ?? id}
                  </option>
                ))}
              </select>
              <input
                type="number"
                inputMode="decimal"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                placeholder="0"
                className="flex-1 text-right body-lg font-bold bg-transparent focus:outline-none"
                style={{ color: 'var(--upbit-text)' }}
              />
            </div>
          </div>

          {/* Swap button */}
          <div className="flex justify-center py-2">
            <button
              type="button"
              onClick={handleSwapTokens}
              className="p-2 rounded-full transition hover:opacity-80"
              style={{ backgroundColor: 'var(--upbit-bg)' }}
              aria-label="From/To 토큰 교체"
            >
              <ArrowLeftRight size={24} strokeWidth={2} />
            </button>
          </div>

          {/* To */}
          <div className="p-4">
            <div className="caption mb-2" style={{ color: 'var(--upbit-text-dim)' }}>입금 (To)</div>
            <div className="flex items-center gap-3">
              <select
                value={toToken}
                onChange={(e) => setToToken(e.target.value as TokenId)}
                className="px-3 py-2.5 rounded-lg body-sm font-semibold border"
                style={{ backgroundColor: 'var(--upbit-bg)', borderColor: 'var(--upbit-border)', color: 'var(--upbit-text)' }}
              >
                {TOKEN_IDS.filter((id) => id !== fromToken).map((id) => (
                  <option key={id} value={id}>
                    {TOKENS.find((t) => t.id === id)?.symbol ?? id}
                  </option>
                ))}
              </select>
              <div className="flex-1 text-right body-lg font-bold tabular-nums" style={{ color: 'var(--upbit-text)' }}>
                {fromAmount ? formatDisplay(toAmount, toToken) : '-'}
              </div>
            </div>
          </div>
        </div>

        {/* Rate */}
        {fromToken !== toToken && (
          <p className="caption mt-3 text-center" style={{ color: 'var(--upbit-text-dim)' }}>
            1 {TOKENS.find((t) => t.id === fromToken)?.symbol} = {rate.toLocaleString(undefined, { maximumFractionDigits: 8 })} {TOKENS.find((t) => t.id === toToken)?.symbol}
          </p>
        )}

        <button
          onClick={handleSwap}
          disabled={loading || !fromAmount || parseFloat(fromAmount) <= 0 || fromToken === toToken}
          className="w-full mt-6 py-4 rounded-xl body font-bold text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: 'var(--upbit-bid)' }}
        >
          {loading ? '처리 중…' : '교환하기'}
        </button>

        <p className="caption mt-4 text-center leading-relaxed" style={{ color: 'var(--upbit-text-dim)' }}>
          * 교환은 실시간 환율로 처리됩니다. 수수료가 적용될 수 있습니다.
        </p>
      </div>
    </div>
  );
}
