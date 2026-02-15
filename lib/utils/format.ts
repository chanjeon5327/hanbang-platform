/**
 * 숫자 체계 통일
 * - KRW: 1,234,567 (소수점 없음)
 * - 수익률: 12.34% (소수점 2자리 고정)
 * - 수량: 최대 6자리 소수점
 * - 단위 명시 (₩ 또는 KRW)
 */

export function formatKrw(n: number): string {
  return `₩${Math.round(n).toLocaleString('ko-KR')}`;
}

export function formatKrwWithUnit(n: number): string {
  return `${Math.round(n).toLocaleString('ko-KR')}원`;
}

export function formatRate(rate: number): string {
  return `${(Math.round(rate * 100) / 100).toFixed(2)}%`;
}

export function formatQty(qty: number): string {
  if (Number.isInteger(qty)) return String(qty);
  const s = qty.toFixed(6);
  return s.replace(/\.?0+$/, '');
}

/** formatQuantity: 수량 표시 (주 등) */
export function formatQuantity(qty: number): string {
  if (Number.isInteger(qty)) return `${qty.toLocaleString('ko-KR')}`;
  const s = qty.toFixed(6);
  return s.replace(/\.?0+$/, '');
}

/** formatCompactNumber: 1.2만, 3.4억 등 축약 표시 */
export function formatCompactNumber(n: number): string {
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}억`;
  if (n >= 10_000) return `${(n / 10_000).toFixed(1)}만`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}천`;
  return Math.round(n).toLocaleString('ko-KR');
}
