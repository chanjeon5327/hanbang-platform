'use client';

import React, { useState, useMemo } from 'react';
import styles from '@/app/market/[id]/market-detail.module.css';
import { formatKRW, formatPriceKRW, formatQty } from '@/lib/format/number';

export default function TradingPanelV2({ currentPriceKrw = 13500 }) {
  const [type, setType] = useState<'limit' | 'market'>('limit');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [price, setPrice] = useState(currentPriceKrw);
  const [qty, setQty] = useState(1);

  const subtotal = useMemo(() => price * qty, [price, qty]);
  const fee = subtotal * 0.0003;
  const total = subtotal + fee;

  const buyColor = '#ef4444';
  const sellColor = '#3b82f6';

  return (
    <div className={styles.terminalOrderPanel}>
      {/* 지정가/시장가 - 1.3배 축소 */}
      <div className={styles.compactTabs}>
        <button
          type="button"
          onClick={() => setType('limit')}
          className={type === 'limit' ? styles.orderTypeActive : ''}
          style={{
            background: type === 'limit' ? (side === 'buy' ? buyColor : sellColor) : undefined,
          }}
        >
          지정가
        </button>
        <button
          type="button"
          onClick={() => setType('market')}
          className={type === 'market' ? styles.orderTypeActive : ''}
          style={{
            background: type === 'market' ? (side === 'buy' ? buyColor : sellColor) : undefined,
          }}
        >
          시장가
        </button>
      </div>

      {/* 매수/매도 - 매수=빨강, 매도=파랑 */}
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
          onChange={(e) => setPrice(Number(e.target.value))}
          className={`${styles.orderInput} ${styles.monoNum} ${styles.numCol} price-number text-2xl`}
        />
      </div>

      {/* 수량 + 스텝퍼 */}
      <div className={styles.orderField}>
        <label className={styles.orderLabel}>수량</label>
        <div className={styles.qtyStepper}>
          <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} className={styles.stepperBtn}>
            −
          </button>
          <input
            type="number"
            value={qty}
            onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
            className={`${styles.orderInput} ${styles.monoNum} ${styles.numCol} price-number`}
            style={{ textAlign: 'center', flex: 1 }}
          />
          <button type="button" onClick={() => setQty((q) => q + 1)} className={styles.stepperBtn}>
            +
          </button>
        </div>
      </div>

      {/* % 버튼 25/50/75/100 (가용금액 기준 비율, mock: 100만원) */}
      <div className={styles.pctRow}>
        {[25, 50, 75, 100].map((p) => {
          const maxQty = price > 0 ? Math.floor(1000000 / price) : 1000;
          return (
            <button
              key={p}
              type="button"
              onClick={() => setQty(Math.max(1, Math.floor(maxQty * (p / 100))))}
              className={styles.pctBtn}
            >
              {p}%
            </button>
          );
        })}
      </div>

      {/* 예상 체결금액 / 수수료 / 총액 - 굵게 강조 2줄 */}
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

      {/* 실행 버튼 - 매수=빨강, 매도=파랑 */}
      <button
        type="button"
        className={styles.orderExecBtn}
        style={{ background: side === 'buy' ? buyColor : sellColor }}
      >
        {side === 'buy' ? '매수하기' : '매도하기'}
      </button>
    </div>
  );
}
