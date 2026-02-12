/**
 * 거래 지원 토큰 (KRW + 가장 많이 쓰이는 토큰)
 * 환율: 1 단위당 KRW (모의값)
 */
export type TokenId = 'KRW' | 'USDT' | 'USDC' | 'BTC' | 'ETH';

export type Token = {
  id: TokenId;
  symbol: string;
  name: string;
  /** 1 단위당 KRW (예: 1 USDT = 1400 KRW) */
  krwPerUnit: number;
  /** 소수 자릿수 */
  decimals: number;
  /** 표시 아이콘/이모지 */
  icon: string;
};

export const TOKENS: Token[] = [
  { id: 'KRW', symbol: 'KRW', name: '원화', krwPerUnit: 1, decimals: 0, icon: '₩' },
  { id: 'USDT', symbol: 'USDT', name: '테더', krwPerUnit: 1400, decimals: 2, icon: '₮' },
  { id: 'USDC', symbol: 'USDC', name: 'USD코인', krwPerUnit: 1400, decimals: 2, icon: '¢' },
  { id: 'BTC', symbol: 'BTC', name: '비트코인', krwPerUnit: 100_000_000, decimals: 8, icon: '₿' },
  { id: 'ETH', symbol: 'ETH', name: '이더리움', krwPerUnit: 4_500_000, decimals: 6, icon: 'Ξ' },
];

export const TOKEN_MAP = Object.fromEntries(TOKENS.map((t) => [t.id, t])) as Record<TokenId, Token>;

/** KRW 금액을 선택 토큰으로 변환 */
export function krwToToken(krw: number, tokenId: TokenId): number {
  const token = TOKEN_MAP[tokenId];
  if (!token || token.krwPerUnit <= 0) return krw;
  return krw / token.krwPerUnit;
}

/** 토큰 금액을 KRW로 변환 */
export function tokenToKrw(amount: number, tokenId: TokenId): number {
  const token = TOKEN_MAP[tokenId];
  if (!token) return amount;
  return amount * token.krwPerUnit;
}

/** 금액 포맷 (토큰별) */
export function formatAmount(amount: number, tokenId: TokenId): string {
  const token = TOKEN_MAP[tokenId];
  if (!token) return amount.toLocaleString();
  if (tokenId === 'KRW') return `₩${amount.toLocaleString()}`;
  const formatted = amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: token.decimals,
  });
  return `${formatted} ${token.symbol}`;
}
