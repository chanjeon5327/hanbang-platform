/**
 * HANBANG 디자인 토큰
 * 토스증권형 × 엔젤투자 × 배당 중심 × 로얄블루
 */

export const colors = {
  // 메인
  royalBlue: '#1E3A8A',
  royalBlueLight: '#2563EB',
  royalBlueDark: '#1E40AF',
  midnightNavy: '#0F172A',
  midnightNavyLight: '#1E293B',

  // 액센트
  emerald: '#059669', // 수익
  emeraldLight: '#10B981',
  red: '#DC2626', // 손실
  redLight: '#EF4444',

  // 중성
  white: '#FFFFFF',
  gray50: '#F8FAFC',
  gray100: '#F1F5F9',
  gray200: '#E2E8F0',
  gray300: '#CBD5E1',
  gray400: '#94A3B8',
  gray500: '#64748B',
  gray600: '#475569',
  gray700: '#334155',
  gray800: '#1E293B',
  gray900: '#0F172A',
} as const;

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
} as const;

export const shadow = {
  sm: '0 1px 2px rgba(15, 23, 42, 0.05)',
  md: '0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.06)',
  lg: '0 10px 15px -3px rgba(15, 23, 42, 0.1), 0 4px 6px -4px rgba(15, 23, 42, 0.08)',
  xl: '0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.08)',
  royal: '0 4px 14px rgba(30, 58, 138, 0.25)',
  emerald: '0 4px 14px rgba(5, 150, 105, 0.2)',
  red: '0 4px 14px rgba(220, 38, 38, 0.2)',
} as const;

export const typography = {
  xs: { size: 12, weight: 500 },
  sm: { size: 14, weight: 500 },
  base: { size: 16, weight: 500 },
  lg: { size: 18, weight: 600 },
  xl: { size: 20, weight: 600 },
  '2xl': { size: 24, weight: 700 },
  '3xl': { size: 30, weight: 700 },
  '4xl': { size: 36, weight: 800 },
  number: { weight: 700 }, // tabular-nums
} as const;
