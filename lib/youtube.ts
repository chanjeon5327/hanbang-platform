/**
 * thumbnail_url 또는 i.ytimg.com/vi/{id}/... 형태에서 유튜브 ID 추출
 */
const YT_THUMB_RE = /i\.ytimg\.com\/vi\/([a-zA-Z0-9_-]+)\//;

export function extractYoutubeId(thumbnailUrl: string | null | undefined | unknown): string | null {
  if (thumbnailUrl == null || typeof thumbnailUrl !== "string") return null;
  const m = thumbnailUrl.match(YT_THUMB_RE);
  return m ? m[1] : null;
}

export function resolveYoutubeId(
  youtubeId: string | null | undefined,
  thumbnailUrl: string | null | undefined
): string | null {
  if (youtubeId && typeof youtubeId === 'string') return youtubeId;
  return extractYoutubeId(thumbnailUrl);
}
