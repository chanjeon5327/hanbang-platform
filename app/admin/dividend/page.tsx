'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { formatKrw, formatRate } from '@/lib/utils/format';
import { useToast } from '@/context/ToastContext';
import GlobalLoader from '@/components/ui/GlobalLoader';

export default function AdminDividendPage() {
  const { toast } = useToast();
  const [itemId, setItemId] = useState('');
  const [monthlyRevenue, setMonthlyRevenue] = useState(120_000_000);
  const [dividendRatio, setDividendRatio] = useState(0.3);
  const [totalShares, setTotalShares] = useState(100_000);
  const [dividendId, setDividendId] = useState<string | null>(null);
  const [totalDividend, setTotalDividend] = useState<number | null>(null);
  const [executed, setExecuted] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [calcLoading, setCalcLoading] = useState(false);
  const [execLoading, setExecLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const distributable = useMemo(() => monthlyRevenue * dividendRatio, [monthlyRevenue, dividendRatio]);
  const dividendPerShare = useMemo(
    () => (totalShares > 0 ? distributable / totalShares : 0),
    [distributable, totalShares]
  );
  const sharePriceKrw = 13_500;
  const expectedAnnualYield = useMemo(
    () => (sharePriceKrw > 0 ? ((dividendPerShare * 12) / sharePriceKrw) * 100 : 0),
    [dividendPerShare, sharePriceKrw]
  );

  const handleCalculate = async () => {
    if (!itemId?.trim()) {
      toast('item_id(콘텐츠 UUID)를 입력하세요.');
      return;
    }
    setCalcLoading(true);
    try {
      const res = await fetch('/api/admin/dividend/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_id: itemId.trim(),
          total_revenue: monthlyRevenue,
          dividend_rate: dividendRatio,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (json?.success && json?.dividend_id) {
        setDividendId(json.dividend_id);
        setTotalDividend(json.total_dividend ?? distributable);
        setExecuted(false);
        toast('배당 계산 완료');
      } else {
        toast(json?.error ?? '계산 실패');
      }
    } catch (e) {
      toast(e instanceof Error ? e.message : '계산 실패');
    } finally {
      setCalcLoading(false);
    }
  };

  const handleExecute = async () => {
    if (!dividendId) {
      toast('먼저 Calculate를 실행하세요.');
      return;
    }
    setExecLoading(true);
    try {
      const res = await fetch('/api/admin/dividend/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dividend_id: dividendId }),
      });
      const json = await res.json().catch(() => ({}));
      if (json?.success) {
        setExecuted(true);
        toast('배당 지급 실행 완료');
      } else {
        toast(json?.error ?? '실행 실패');
      }
    } catch (e) {
      toast(e instanceof Error ? e.message : '실행 실패');
    } finally {
      setExecLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!dividendId) {
      toast('먼저 Calculate를 실행하세요.');
      return;
    }
    setConfirmLoading(true);
    try {
      const res = await fetch('/api/admin/dividend/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dividend_id: dividendId }),
      });
      const json = await res.json().catch(() => ({}));
      if (json?.success) {
        setConfirmed(true);
        toast('배당 확정(봉인) 완료');
      } else {
        toast(json?.error ?? '확정 실패');
      }
    } catch (e) {
      toast(e instanceof Error ? e.message : '확정 실패');
    } finally {
      setConfirmLoading(false);
    }
  };

  const loading = calcLoading || execLoading || confirmLoading;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      <GlobalLoader visible={loading} />
      <header className="sticky top-0 z-50 border-b px-4 py-3" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/admin" className="body-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            ← 관리자
          </Link>
          <h1 className="body-lg font-bold" style={{ color: 'var(--text)' }}>배당 설정</h1>
          <span className="w-14" />
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="rounded-[16px] p-6 border card">
          <h2 className="body font-bold mb-4" style={{ color: 'var(--text)' }}>배당 시뮬레이션</h2>

          <div className="space-y-4">
            <div>
              <label className="body-sm font-medium block mb-2" style={{ color: 'var(--text-secondary)' }}>
                콘텐츠 ID (content_items.id, UUID)
              </label>
              <input
                type="text"
                value={itemId}
                onChange={(e) => setItemId(e.target.value)}
                placeholder="예: 550e8400-e29b-41d4-a716-446655440000"
                className="w-full rounded-xl px-4 py-3 border"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
              />
            </div>
            <div>
              <label className="body-sm font-medium block mb-2" style={{ color: 'var(--text-secondary)' }}>
                월 매출 (원)
              </label>
              <input
                type="number"
                value={monthlyRevenue}
                onChange={(e) => setMonthlyRevenue(Math.max(0, Number(e.target.value) || 0))}
                className="w-full rounded-xl px-4 py-3 border"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
              />
            </div>
            <div>
              <label className="body-sm font-medium block mb-2" style={{ color: 'var(--text-secondary)' }}>
                배당 비율: {(dividendRatio * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={dividendRatio}
                onChange={(e) => setDividendRatio(Number(e.target.value))}
                className="w-full h-2 rounded-full"
                style={{ accentColor: 'var(--royal-blue)' }}
              />
            </div>
            <div>
              <label className="body-sm font-medium block mb-2" style={{ color: 'var(--text-secondary)' }}>
                총 발행 지분 (주)
              </label>
              <input
                type="number"
                value={totalShares}
                onChange={(e) => setTotalShares(Math.max(1, Number(e.target.value) || 1))}
                className="w-full rounded-xl px-4 py-3 border"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
              />
            </div>
          </div>

          <div className="mt-6 pt-6 space-y-2" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="flex justify-between body-sm">
              <span style={{ color: 'var(--text-secondary)' }}>배당 가능액</span>
              <span className="font-bold tabular-nums metric" style={{ color: 'var(--text)' }}>
                {formatKrw(distributable)}
              </span>
            </div>
            <div className="flex justify-between body-sm">
              <span style={{ color: 'var(--text-secondary)' }}>1주당 월 배당</span>
              <span className="font-bold tabular-nums metric" style={{ color: 'var(--royal-blue)' }}>
                {formatKrw(dividendPerShare)}
              </span>
            </div>
            <div className="flex justify-between body-sm">
              <span style={{ color: 'var(--text-secondary)' }}>연환산 예상 수익률</span>
              <span className="font-bold tabular-nums metric" style={{ color: 'var(--royal-blue)' }}>
                {formatRate(expectedAnnualYield)}
              </span>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleCalculate}
              disabled={loading}
              className="flex-1 min-w-[100px] rounded-xl py-3 font-bold tap-scale disabled:opacity-50"
              style={{ backgroundColor: 'var(--royal-blue)', color: '#fff' }}
            >
              Calculate
            </button>
            <button
              type="button"
              onClick={handleExecute}
              disabled={loading || !dividendId}
              className="flex-1 min-w-[100px] rounded-xl py-3 font-bold tap-scale disabled:opacity-50 border"
              style={{
                backgroundColor: executed ? 'var(--emerald)' : 'transparent',
                borderColor: 'var(--royal-blue)',
                color: executed ? '#fff' : 'var(--royal-blue)',
              }}
            >
              Execute
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading || !dividendId}
              className="flex-1 min-w-[100px] rounded-xl py-3 font-bold tap-scale disabled:opacity-50 border"
              style={{
                backgroundColor: confirmed ? 'var(--emerald)' : 'transparent',
                borderColor: 'var(--royal-blue)',
                color: confirmed ? '#fff' : 'var(--royal-blue)',
              }}
            >
              Confirm
            </button>
          </div>
        </div>

        {dividendId && (
          <div className="rounded-[16px] p-6 border card" style={{ borderColor: 'var(--royal-blue)' }}>
            <h3 className="body-sm font-bold mb-3" style={{ color: 'var(--royal-blue)' }}>결과</h3>
            <div className="space-y-2 body-sm">
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>dividend_id</span>
                <span className="font-mono truncate max-w-[200px]" style={{ color: 'var(--text)' }}>{dividendId}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>total_dividend</span>
                <span className="font-bold" style={{ color: 'var(--text)' }}>{totalDividend != null ? formatKrw(totalDividend) : '-'}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>상태</span>
                <span style={{ color: confirmed ? 'var(--emerald)' : executed ? 'var(--royal-blue)' : 'var(--text-muted)' }}>
                  {confirmed ? 'CONFIRMED' : executed ? 'Executed' : 'Not Executed'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
