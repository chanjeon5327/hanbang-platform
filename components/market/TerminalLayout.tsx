'use client';

import React from 'react';
import styles from '@/app/market/[id]/market-detail.module.css';

type Props = {
  chart: React.ReactNode;
  trades: React.ReactNode;
  pulseBar?: React.ReactNode;
  orderPanel: React.ReactNode;
  orderBook: React.ReactNode;
  onListClick: () => void;
  onWalletClick: () => void;
};

export default function TerminalLayout({
  chart,
  trades,
  pulseBar,
  orderPanel,
  orderBook,
  onListClick,
  onWalletClick,
}: Props) {
  return (
    <section className={styles.terminalSection} aria-label="거래 단말기">
      {/* 목록/지갑 버튼 (PC: 우측 상단, 모바일: 하단 sticky) */}
      <div className={styles.terminalAuxBar}>
        <button type="button" className={styles.auxBtn} onClick={onListClick}>
          목록
        </button>
        <button type="button" className={styles.auxBtn} onClick={onWalletClick}>
          지갑
        </button>
      </div>

      <div className={styles.terminalGrid}>
        {/* 좌측 60%: 차트 + 체결 */}
        <div className={styles.terminalLeft}>
          <div className={styles.panelCard}>
            <div className={styles.chartWrap}>{chart}</div>
            {pulseBar && <div className={styles.pulseWrap}>{pulseBar}</div>}
          </div>
          <div className={styles.panelCard}>
            <h3 className={styles.panelTitle}>실시간 체결</h3>
            {trades}
          </div>
        </div>

        {/* 우측 40%: 주문 + 호가 */}
        <div className={styles.terminalRight}>
          <div className={styles.panelCard}>
            <h3 className={styles.panelTitle}>주문</h3>
            {orderPanel}
          </div>
          <div className={styles.panelCard}>
            <h3 className={styles.panelTitle}>호가</h3>
            {orderBook}
          </div>
        </div>
      </div>

      {/* 모바일 하단 sticky bar */}
      <div className={styles.terminalMobileBar}>
        <button type="button" className={styles.mobileBarBtn} onClick={onListClick}>
          목록
        </button>
        <button type="button" className={styles.mobileBarBtn} onClick={onWalletClick}>
          지갑
        </button>
      </div>
    </section>
  );
}
