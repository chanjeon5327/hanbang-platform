/**
 * HANBANG 디자인 토큰
 * themeTokens.ts와 연동하여 라이트/다크 테마 일관 적용
 */

export const colors = {
  /** 메인 브랜드 */
  primary: '#1E40AF',
  /** 상승/매수 */
  up: '#DC2626',
  /** 하락/매도 */
  down: '#2563EB',
  /** 배경/카드 (CSS var(--card) 사용 권장) */
  surface: '#FFFFFF',
  /** 텍스트 (CSS var(--text) 사용 권장) */
  text: '#191F28',
} as const;

export const radius = {
  sm: 8,
  md: 16,
  lg: 20,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
} as const;

export const typography = {
  /** 큰 가격 표시 */
  price: { size: 28, weight: 700, lineHeight: 1.2 },
  /** 본문 */
  body: { size: 16, weight: 500, lineHeight: 1.6 },
  /** 라벨/캡션 */
  label: { size: 12, weight: 500, lineHeight: 1.4 },
  /** 버튼 */
  button: { size: 14, weight: 700, lineHeight: 1.4 },
} as const;

/** V3 전용 스케일 (청약+배당+거래 혼합형) */
export const v3 = {
  /** 그리드: 4px 베이스 */
  grid: 4,
  /** 패딩: 20, 24, 32 */
  padding: { sm: 20, md: 24, lg: 32 } as const,
  /** 타이포: 14/16/18/24/32/40 */
  title: { size: 32, weight: 700 },
  subtitle: { size: 18, weight: 600 },
  body: { size: 16, weight: 500 },
  caption: { size: 14, weight: 500 },
  label: { size: 12, weight: 500 },
  price: { size: 40, weight: 700 },
  /** 카드 radius */
  cardRadius: 16,
} as const;
