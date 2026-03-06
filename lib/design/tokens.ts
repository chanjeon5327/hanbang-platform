/**
 * HANBANG 디자인 토큰 - 단일 소스 (SSOT)
 * globals.css의 --hb-* 변수와 동기화
 */

export const tokens = {
  colors: {
    royalBlue: {
      DEFAULT: '#1E40AF',
      light: '#2563EB',
      dark: '#1D4ED8',
    },
    purple: {
      DEFAULT: '#7C3AED',
      light: '#8B5CF6',
      dark: '#6D28D9',
      gradient: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
    },
    background: '#F8FAFC',
    surface: '#FFFFFF',
    border: '#E8ECF4',
    borderStrong: '#CBD5E1',
    text: '#191F28',
    muted: '#9CA3AF',
    success: '#22C55E',
    danger: '#EF4444',
    warning: '#F59E0B',
    /** 레거시: primary, up(매수), down(매도) */
    primary: '#1E40AF',
    up: '#DC2626',
    down: '#2563EB',
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
  },
  shadow: {
    sm: '0 1px 2px rgba(25, 31, 40, 0.04)',
    md: '0 4px 6px -1px rgba(25, 31, 40, 0.06), 0 2px 4px -2px rgba(25, 31, 40, 0.04)',
    lg: '0 10px 15px -3px rgba(25, 31, 40, 0.08), 0 4px 6px -4px rgba(25, 31, 40, 0.06)',
    royal: '0 4px 14px rgba(30, 58, 138, 0.2)',
  },
  typography: {
    fontFamily: "'Pretendard Variable', Pretendard, 'Noto Sans KR', system-ui, -apple-system, sans-serif",
    fallback: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
    display: { size: 28, weight: 700, lineHeight: 1.2 },
    title: { size: 22, weight: 600, lineHeight: 1.3 },
    body: { size: 16, weight: 500, lineHeight: 1.6 },
    caption: { size: 12, weight: 500, lineHeight: 1.4 },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
  },
  zIndex: {
    dropdown: 100,
    sticky: 200,
    modal: 300,
    toast: 400,
  },
  /** V3 전용 스케일 (청약+배당+거래 혼합형) */
  v3: {
    grid: 4,
    padding: { sm: 20, md: 24, lg: 32 } as const,
    title: { size: 32, weight: 700 },
    subtitle: { size: 18, weight: 600 },
    body: { size: 16, weight: 500 },
    caption: { size: 14, weight: 500 },
    label: { size: 12, weight: 500 },
    price: { size: 40, weight: 700 },
    cardRadius: 16,
  },
} as const;

/** 레거시 호환: 기존 import */
export const spacing = tokens.spacing;
export const radius = tokens.radius;
export const colors = tokens.colors;
export const v3 = tokens.v3;
