'use client';

import React, { useMemo, useState } from 'react';
import styles from '@/app/market/[id]/market-detail.module.css';
import { formatKRW } from '@/lib/format/number';

type OrderType = 'limit' | 'market';
type Side = 'buy' | 'sell';

export default function TradingPanelV2({ currentPriceKrw = 13500 }: { currentPriceKrw?: number }) {
  const [type, setType] = useState<OrderType>('limit');
  const [side, setSide] = useState<Side>('buy');
  const [price, setPrice] = useState<number>(currentPriceKrw);
  const [qty, setQty] = useState<number>(1);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

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
  const total = useMemo(() => {
    return side === 'buy' ? subtotal + fee : Math.max(0, subtotal - fee);
  }, [side, subtotal, fee]);

  const buyColor = '#ef4444';
  const sellColor = '#3b82f6';

  const canSubmit = useMemo(() => {
    if (isSubmitting) return false;
    if (safeQty <= 0) return false;
    if (effectivePrice <= 0) return false;
    return true;
  }, [isSubmitting, safeQty, effectivePrice]);

  async function onSubmit() {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setNotice(null);

    const payload = {
      type,
      side,
      price: type === 'market' ? currentPriceKrw : price,
      qty: safeQty,
      subtotal,
      fee,
      total,
    };

    try {
      console.log('[ORDER_SUBMIT]', payload);
      // 데모용: 아주 짧은 지연(로딩 체감)
      await new Promise((r) => setTimeout(r, 120));
      setToastMsg('주문 요청이 접수되었습니다');
      setShowToast(true);
      setNotice('주문 요청이 접수되었습니다.');
      setTimeout(() => {
        setShowToast(false);
        setToastMsg(null);
      }, 1600);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.terminalOrderPanel}>
      {/* 상단 토스트 */}
      {showToast && toastMsg && (
        <div
          className="sticky top-0 z-20 -mx-4 -mt-4 mb-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-center text-sm font-medium text-white shadow-md"
          role="status"
          aria-live="polite"
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
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, Math.floor(q) - 1))}
            className={styles.stepperBtn}
          >
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
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, Math.floor(q) + 1))}
            className={styles.stepperBtn}
          >
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
