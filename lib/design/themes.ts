/**
 * HANBANG 사용자 노출 테마
 * data-theme 속성과 매핑
 * themeTokens.ts와 연동하여 라이트/다크 모드 일관 적용
 */

export type DataThemeId = 'apple' | 'toss';

export const THEMES = {
  apple: {
    id: 'apple' as const,
    label: 'T1',
    /** Apple Human Interface 느낌: 밝고 부드러운 그레이 */
    description: 'Apple 스타일',
  },
  toss: {
    id: 'toss' as const,
    label: 'T2',
    /** 토스/토스증권 느낌: 로얄블루 강조, 카드형 */
    description: '토스 스타일',
  },
} as const;

export const DEFAULT_THEME: DataThemeId = 'apple';

export const THEME_STORAGE_KEY = 'hanbang_data_theme';
