/**
 * 욕설 필터 placeholder
 * - 실제 구현 시 외부 라이브러리 또는 정규식/블랙리스트 사용
 */
const BLOCKLIST: string[] = []; // TODO: 블랙리스트 로드

export function filterProfanity(text: string): string {
  if (!text || typeof text !== 'string') return text;
  let result = text;
  for (const word of BLOCKLIST) {
    const re = new RegExp(word, 'gi');
    result = result.replace(re, '***');
  }
  return result;
}

export function containsProfanity(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  const filtered = filterProfanity(text);
  return filtered !== text;
}
