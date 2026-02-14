'use client';

import Link from 'next/link';
import { Download, TrendingUp } from 'lucide-react';

/**
 * CTA 2개: 입금 / 거래하기
 * - 입금: 지갑 입금 페이지
 * - 거래하기: 마켓 목록 (추가 수익권 탐색)
 */
export default function DetailCTAs() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Link
        href="/wallet/deposit"
        className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-[15px] transition active:scale-[0.98]"
        style={{ backgroundColor: 'var(--upbit-bid)', color: '#fff', boxShadow: '0 4px 12px rgba(30,136,229,0.35)' }}
      >
        <Download size={20} strokeWidth={2} />
        입금
      </Link>
      <Link
        href="/market"
        className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-[15px] transition active:scale-[0.98] border"
        style={{ backgroundColor: 'var(--upbit-panel)', borderColor: 'var(--upbit-border)', color: 'var(--upbit-text)' }}
      >
        <TrendingUp size={20} strokeWidth={2} />
        거래하기
      </Link>
    </div>
  );
}
