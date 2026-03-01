/**
 * HANBANG 테마 토큰
 * 라이트/다크 모드 × 토스 앱 부드러운 대비 × 딥 네이비/차콜 다크
 */

export type ThemeMode = 'light' | 'dark';

/** 라이트 모드: 토스 앱처럼 부드러운 배경/카드/보더/텍스트 대비 */
export const lightTokens = {
  /** 메인 배경 */
  bg: '#F8FAFC',
  /** 섹션 배경 (미세 차이 1) */
  bgSecondary: '#F1F5F9',
  /** 섹션 배경 (미세 차이 2) */
  bgTertiary: '#E8ECF4',
  /** 카드/패널 */
  card: '#FFFFFF',
  /** 카드 상승 (호버 등) */
  cardElevated: '#FFFFFF',
  /** 메인 텍스트 */
  text: '#191F28',
  /** 보조 텍스트 */
  textSecondary: '#6B7684',
  /** 뮤트 텍스트 */
  textMuted: '#9CA3AF',
  /** 테두리 */
  border: '#E8ECF4',
  /** 강한 테두리 */
  borderStrong: '#CBD5E1',
  /** 로얄블루 */
  royalBlue: '#1E40AF',
  royalBlueLight: '#2563EB',
  royalBlueDark: '#1D4ED8',
  /** 액센트 (매수=red, 매도=blue) */
  emerald: '#ef4444',
  emeraldLight: '#f87171',
  accentLoss: '#3b82f6',
  accentLossLight: '#60a5fa',
} as const;

/** 다크 모드: 딥 네이비/차콜 계열 (회색 종이 X) */
export const darkTokens = {
  /** 메인 배경 (딥 네이비) */
  bg: '#0D1117',
  /** 섹션 배경 (미세 차이 1) */
  bgSecondary: '#161B22',
  /** 섹션 배경 (미세 차이 2) */
  bgTertiary: '#21262D',
  /** 카드/패널 (차콜) */
  card: '#161B22',
  /** 카드 상승 */
  cardElevated: '#21262D',
  /** 메인 텍스트 */
  text: '#E6EDF3',
  /** 보조 텍스트 */
  textSecondary: '#8B949E',
  /** 뮤트 텍스트 */
  textMuted: '#6E7681',
  /** 테두리 */
  border: '#21262D',
  /** 강한 테두리 */
  borderStrong: '#30363D',
  /** 로얄블루 (다크에서 약간 밝게) */
  royalBlue: '#3B82F6',
  royalBlueLight: '#60A5FA',
  royalBlueDark: '#2563EB',
  /** 액센트 (매수=red, 매도=blue) */
  emerald: '#ef4444',
  emeraldLight: '#f87171',
  accentLoss: '#3b82f6',
  accentLossLight: '#60a5fa',
} as const;

export const themeTokens = {
  light: lightTokens,
  dark: darkTokens,
} as const;
