/**
 * 금융 표기 규칙 통일 (압도 4-AUTHORITY)
 * - 엔진/RPC/정산/원장 로직 변경 금지
 * - 숫자 표시/정렬/단위/자릿수 규칙만 고정
 */

const EMPTY = '—';

function toNum(v: number | string | null | undefined): number | null {
  if (v == null) return null;
  const n = typeof v === 'string' ? parseFloat(v) : v;
  return Number.isFinite(n) ? n : null;
}

/** KRW: 천단위 콤마, 소수점 없음 (₩12,345). NaN/undefined/null → "—" */
export function formatKRW(value: number | string | null | undefined): string {
  const n = toNum(value);
  if (n == null) return EMPTY;
  return `₩${Math.round(n).toLocaleString('ko-KR')}`;
}

/** 수량: 소수점 4자리까지, trailing zero 제거 (12.3400 → 12.34) */
export function formatQty(value: number | string | null | undefined): string {
  const n = toNum(value);
  if (n == null) return EMPTY;
  const s = n.toFixed(4);
  return s.replace(/\.?0+$/, '') || '0';
}

/** 퍼센트: 소수점 2자리 고정 (12.30%) */
export function formatPct(value: number | string | null | undefined): string {
  const n = toNum(value);
  if (n == null) return EMPTY;
  return `${(Math.round(n * 100) / 100).toFixed(2)}%`;
}

/** 가격: KRW 규칙(소수점 없음), monospace에 어울리게 */
export function formatPriceKRW(value: number | string | null | undefined): string {
  const n = toNum(value);
  if (n == null) return EMPTY;
  return `₩${Math.round(n).toLocaleString('ko-KR')}`;
}

/** signClass: >0 pos, <0 neg, 0 zero */
export function signClass(value: number | string | null | undefined): 'pos' | 'neg' | 'zero' {
  const n = toNum(value);
  if (n == null) return 'zero';
  if (n > 0) return 'pos';
  if (n < 0) return 'neg';
  return 'zero';
}
