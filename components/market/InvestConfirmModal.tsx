'use client';

import { formatKrw } from '@/lib/utils/format';

type Props = {
  amount: number;
  productTitle?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
};

export default function InvestConfirmModal({ amount, productTitle, onConfirm, onCancel, loading }: Props) {
  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} aria-hidden />
      <div
        className="relative w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 pb-8 sm:pb-6"
        style={{ backgroundColor: 'var(--upbit-panel)', boxShadow: '0 -4px 20px rgba(0,0,0,0.15)' }}
      >
        <h3 className="text-[17px] font-bold mb-2" style={{ color: 'var(--upbit-text)' }}>엔젤 참여 확인</h3>
        {productTitle && (
          <p className="text-[14px] mb-4" style={{ color: 'var(--upbit-text-dim)' }}>{productTitle}</p>
        )}
        <p className="text-[15px] mb-2" style={{ color: 'var(--upbit-text)' }}>
          <span className="font-bold">{formatKrw(amount)}</span> 엔젤로 참여하시겠습니까?
        </p>
        <p className="text-[12px] mb-6" style={{ color: 'var(--upbit-text-dim)' }}>수수료 없음 · 최소 1만원</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl text-[14px] font-semibold border"
            style={{ borderColor: 'var(--upbit-border)', color: 'var(--upbit-text)' }}
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 rounded-xl text-[14px] font-semibold disabled:opacity-50 transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:active:scale-100"
            style={{ backgroundColor: 'var(--upbit-bid)', color: '#fff' }}
          >
            {loading ? '처리 중...' : '확인'}
          </button>
        </div>
      </div>
    </div>
  );
}
