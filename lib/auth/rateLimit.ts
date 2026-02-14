/**
 * 메모리 기반 로그인 시도 레이트리밋
 * - IP당 5회/분 초과 시 429
 * - KV(Redis 등) 대체 시 이 모듈만 교체
 */

const WINDOW_MS = 60 * 1000; // 1분
const MAX_ATTEMPTS = 5;

type Entry = { count: number; resetAt: number };

const store = new Map<string, Entry>();

function getKey(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() ?? req.headers.get('x-real-ip') ?? 'unknown';
  return `login:${ip}`;
}

export function checkLoginRateLimit(req: Request): { ok: boolean; retryAfter?: number } {
  const key = getKey(req);
  const now = Date.now();
  let entry = store.get(key);

  if (!entry) {
    entry = { count: 1, resetAt: now + WINDOW_MS };
    store.set(key, entry);
    return { ok: true };
  }

  if (now > entry.resetAt) {
    entry = { count: 1, resetAt: now + WINDOW_MS };
    store.set(key, entry);
    return { ok: true };
  }

  entry.count += 1;
  if (entry.count > MAX_ATTEMPTS) {
    return { ok: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { ok: true };
}

/** 성공 시 카운트 리셋 (선택) */
export function resetLoginRateLimit(req: Request): void {
  store.delete(getKey(req));
}
