/**
 * 유튜브 썸네일 URL (i.ytimg.com - 안정적 로딩)
 * 유명 유튜브 채널 썸네일 기반 fallback
 */

/** thumbnail_url 없을 때 fallback (밝고 긍정적인 이미지) */
export const FALLBACK_PREVIEW_IMAGE = '/sample-bright.jpg';

export const YT_THUMBS = [
  "9bZkp7q19f0", // BTS
  "3tmd-ClpJxA", // Blackpink
  "eDuCxyhyx7g", // 현재 스폰서 영상
  "L_jWHffIx5E", // Smash Mouth
  "kJQP7kiw5Fk", // Despacito
  "dQw4w9WgXcQ", // Rickroll
];

export function getYtThumb(index: number) {
  return `https://i.ytimg.com/vi/${YT_THUMBS[Math.abs(index) % YT_THUMBS.length]}/hqdefault.jpg`;
}
