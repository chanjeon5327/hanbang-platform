/**
 * 유튜브 썸네일 URL (i.ytimg.com - 안정적 로딩)
 * 검증된 공개 영상 ID만 사용
 */
const YT_BASE = 'https://i.ytimg.com/vi';
export const YT = (id: string) => `${YT_BASE}/${id}/hqdefault.jpg`;

/** 검증된 유튜브 영상 ID (공개·안정적) */
export const YT_IDS = [
  'dQw4w9WgXcQ', 'kJQP7kiw5Fk', 'RgKAFK5djSk', 'YQHsXMglC9A', '2Vv-BfVoq4g',
  'jNQXAC9IVRw', 'OPf0YbXqDm0', '09R8_2nJtjg', 'Q0oIoR9mLwc', 'fJ9rUzIMcZQ',
  'hT_nvWreIhg', 'nfWlot6h_JM', 'CevxZvSJLk8', 'cPAbx5kgCJo', 'kXYiU_JCYtU',
  'aAkMkVFwAoo', 'SlPhMPnQ58k', 'JGwWNGJdvx8', 'YqngDKLZ6sM', 'ft4hcP2r0_U',
  'fKopy74weus', 'D9GwkVEqOx8', '7PCkvCPvDXk', '7wtfhZwyrcc', 'pRpeEdMmmQ0',
  'TUVcZfQe-Kw', 'k1BneeJTDcU', 'ebXbL9L4xW8', 'kxopViU98Xo', '86CQq3pKefw',
] as const;

/** 인덱스에 해당하는 썸네일 URL 반환 */
export function getYtThumb(index: number): string {
  return YT(YT_IDS[Math.abs(index) % YT_IDS.length]);
}

/** 이미지 로드 실패 시 picsum fallback */
export const PICSUM = (seed: number) =>
  `https://picsum.photos/seed/${seed}/400/300`;
