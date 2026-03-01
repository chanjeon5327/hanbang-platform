'use client';

import React, { useMemo, useState } from 'react';
import styles from '@/app/market/[id]/market-detail.module.css';
import { formatKRW } from '@/lib/format/number';

type OrderType = 'limit' | 'market';
type Side = 'buy' | 'sell';

type Props = {
  assetId: string;
  currentPriceKrw?: number;
};

async function safeReadJson(res: Response): Promise<any | null> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function pickErrMsg(j: any, fallback: string) {
  return (
    j?.message ||
    j?.error ||
    j?.detail ||
    j?.msg ||
    (typeof j === 'string' ? j : null) ||
    fallback
  );
}

export default function TradingPanelV2({ assetId, currentPriceKrw = 13500 }: Props) {
  const [type, setType] = useState<OrderType>('limit');
  const [side, setSide] = useState<Side>('buy');
  const [price, setPrice] = useState<number>(currentPriceKrw);
  const [qty, setQty] = useState<number>(1);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // 토스트(상단) + 화면 하단 안내(aria-live)
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState<string>('');
  const [toastTone, setToastTone] = useState<'ok' | 'err'>('ok');
  const [notice, setNotice] = useState<string | null>(null);

  // ✅ 시장가일 때는 "현재가"로 계산
  const effectivePrice = useMemo(() => {
    const p = type === 'market' ? currentPriceKrw : price;
    return Number.isFinite(p) && p > 0 ? p : 0;
  }, [type, currentPriceKrw, price]);

  const safeQty = useMemo(() => {
    const q = Number.isFinite(qty) ? qty : 1;
    return Math.max(1, Math.floor(q));
  }, [qty]);

  const subtotal = useMemo(() => effectivePrice * safeQty, [effectivePrice, safeQty]);
  const fee = useMemo(() => subtotal * 0.0003, [subtotal]);
  const total = useMemo(() => (side === 'buy' ? subtotal + fee : Math.max(0, subtotal - fee)), [side, subtotal, fee]);

  const buyColor = '#ef4444';
  const sellColor = '#3b82f6';

  const canSubmit = useMemo(() => {
    if (isSubmitting) return false;
    if (!assetId) return false;
    if (safeQty <= 0) return false;
    if (effectivePrice <= 0) return false;
    return true;
  }, [isSubmitting, assetId, safeQty, effectivePrice]);

  function fireToast(msg: string, tone: 'ok' | 'err') {
    setToastMsg(msg);
    setToastTone(tone);
    setShowToast(true);
    // 1.6초 후 자동 종료
    window.setTimeout(() => setShowToast(false), 1600);
  }

  async function postWithFallback(payload: any) {
    const endpoints = ['/api/exchange/place', '/api/orders/orderbook/place', '/api/orders/place'];

    let lastErr = '주문 요청에 실패했습니다.';
    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          cache: 'no-store',
          body: JSON.stringify(payload),
        });

        // 404면 다음 엔드포인트로 fallback
        if (res.status === 404) {
          lastErr = `${url} (404)`;
          continue;
        }

        const j = await safeReadJson(res);

        if (!res.ok) {
          lastErr = pickErrMsg(j, `${url} 요청 실패`);
          continue;
        }

        return { ok: true as const, url, data: j };
      } catch (e: any) {
        lastErr = e?.message || String(e) || '네트워크 오류';
        continue;
      }
    }
    return { ok: false as const, error: lastErr };
  }

  async function onSubmit() {
    if (!canSubmit) return;

    setIsSubmitting(true);
    setNotice(null);

    // 서버가 어떤 필드명을 기대하든 최대한 안전하게 "양쪽 이름" 같이 보냄
    const payload = {
      asset_id: assetId,
      assetId,
      side, // buy/sell
      type, // limit/market
      order_type: type,
      price: type === 'market' ? null : effectivePrice,
      qty: safeQty,
      quantity: safeQty,
      client_subtotal_krw: subtotal,
      client_fee_krw: fee,
      client_total_krw: total,
      client_ts: Date.now(),
    };

    try {
      console.log('[ORDER_SUBMIT]', payload);

      const r = await postWithFallback(payload);

      if (!r.ok) {
        fireToast(`주문 실패: ${r.error}`, 'err');
        setNotice(`주문 실패: ${r.error}`);
        return;
      }

      fireToast('주문 요청이 접수되었습니다.', 'ok');
      setNotice('주문 요청이 접수되었습니다.');

      // 다른 컴포넌트가 새로고침 트리거를 받게 이벤트 발사 (payload + 서버응답 포함)
      const eventPayload = { side, type, qty: safeQty, price: type === 'market' ? currentPriceKrw : effectivePrice, total };
      window.dispatchEvent(
        new CustomEvent('hb:order-placed', {
          detail: { assetId, payload: eventPayload, result: { url: r.url, data: r.data } },
        })
      );

      // 서버 응답이 있으면 콘솔에 찍기(데모/디버깅)
      console.log('[ORDER_RESPONSE]', r.url, r.data);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.terminalOrderPanel}>
      {/* 상단 토스트 (alert 대체) */}
      {showToast && (
        <div
          className={`sticky top-0 z-20 mb-2 rounded-lg px-3 py-2 text-sm font-semibold shadow-md ${
            toastTone === 'ok' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
          }`}
        >
          {toastMsg}
        </div>
      )}

      {/* ✅ 주문조건: 지정가/시장가 2개만 */}
      <div className={styles.compactTabs}>
        <button
          type="button"
          onClick={() => setType('limit')}
          className={type === 'limit' ? styles.orderTypeActive : ''}
          style={{ background: type === 'limit' ? (side === 'buy' ? buyColor : sellColor) : undefined }}
        >
          지정가
        </button>
        <button
          type="button"
          onClick={() => setType('market')}
          className={type === 'market' ? styles.orderTypeActive : ''}
          style={{ background: type === 'market' ? (side === 'buy' ? buyColor : sellColor) : undefined }}
        >
          시장가
        </button>
      </div>

      {/* 매수/매도 */}
      <div className={styles.compactTabs}>
        <button
          type="button"
          onClick={() => setSide('buy')}
          className={side === 'buy' ? styles.orderTypeActive : ''}
          style={{ background: side === 'buy' ? buyColor : undefined }}
        >
          매수
        </button>
        <button
          type="button"
          onClick={() => setSide('sell')}
          className={side === 'sell' ? styles.orderTypeActive : ''}
          style={{ background: side === 'sell' ? sellColor : undefined }}
        >
          매도
        </button>
      </div>

      {/* 가격 */}
      <div className={styles.orderField}>
        <label className={styles.orderLabel}>가격 (KRW)</label>
        <input
          type="number"
          disabled={type === 'market'}
          value={type === 'market' ? currentPriceKrw : price}
          onChange={(e) => {
            const n = Number(e.target.value);
            setPrice(Number.isFinite(n) ? n : 0);
          }}
          className={`${styles.orderInput} ${styles.monoNum} ${styles.numCol} price-number text-2xl`}
        />
      </div>

      {/* 수량 + 스텝퍼 */}
      <div className={styles.orderField}>
        <label className={styles.orderLabel}>수량</label>
        <div className={styles.qtyStepper}>
          <button type="button" onClick={() => setQty((q) => Math.max(1, Math.floor(q) - 1))} className={styles.stepperBtn}>
            −
          </button>
          <input
            type="number"
            value={safeQty}
            onChange={(e) => {
              const n = Number(e.target.value);
              setQty(Number.isFinite(n) ? Math.max(1, Math.floor(n)) : 1);
            }}
            className={`${styles.orderInput} ${styles.monoNum} ${styles.numCol} price-number`}
            style={{ textAlign: 'center', flex: 1 }}
          />
          <button type="button" onClick={() => setQty((q) => Math.max(1, Math.floor(q) + 1))} className={styles.stepperBtn}>
            +
          </button>
        </div>
      </div>

      {/* 요약 */}
      <div className={styles.orderSummaryBox}>
        <div className={styles.orderSummaryRow}>
          <span>예상 체결금액</span>
          <span className={`${styles.monoNum} ${styles.numCol} price-number text-2xl`}>{formatKRW(subtotal)}</span>
        </div>
        <div className={styles.orderSummaryRow}>
          <span>수수료</span>
          <span className={`${styles.monoNum} ${styles.numCol} price-number`}>{formatKRW(fee)}</span>
        </div>
        <div className={`${styles.orderSummaryRow} ${styles.orderTotal}`}>
          <span>총액</span>
          <span className={`${styles.monoNum} ${styles.numCol} price-number text-2xl`}>{formatKRW(total)}</span>
        </div>
      </div>

      {/* 실행 버튼 */}
      <button
        type="button"
        onClick={onSubmit}
        disabled={!canSubmit}
        className={styles.orderExecBtn}
        style={{
          background: side === 'buy' ? buyColor : sellColor,
          opacity: canSubmit ? 1 : 0.6,
        }}
      >
        {isSubmitting ? '요청 중…' : side === 'buy' ? '매수하기' : '매도하기'}
      </button>

      {notice && (
        <div className="mt-2 text-center text-xs text-gray-500" aria-live="polite">
          {notice}
        </div>
      )}
    </div>
  );
}
