/**
 * 프로덕션급 로그인 시도 레이트리밋
 * - IP당 5회/분 초과 시 429
 * - Upstash Redis 환경변수가 있으면 분산 환경에서 안전하게 동작
 * - 없으면 메모리 기반 fallback (로컬 개발용)
 * 
 * TODO: 멀티 인스턴스 환경에서는 반드시 Upstash 설정 필요
 *       UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN 환경변수 설정
 */

const WINDOW_MS = 60 * 1000; // 1분
const MAX_ATTEMPTS = 5;

// ============ Upstash Redis 기반 (프로덕션) ============
let upstashRateLimit: any = null;

if (
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
) {
  try {
    const { Ratelimit } = require('@upstash/ratelimit');
    const { Redis } = require('@upstash/redis');

    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    upstashRateLimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(MAX_ATTEMPTS, `${WINDOW_MS} ms`),
      prefix: 'login',
    });

    console.log('[RATE_LIMIT] Using Upstash Redis for production-grade rate limiting');
  } catch (err) {
    console.warn('[RATE_LIMIT] Upstash Redis configuration exists but failed to initialize:', err);
  }
}

// ============ 메모리 기반 Fallback (로컬 개발) ============
type Entry = { count: number; resetAt: number };
const memoryStore = new Map<string, Entry>();

if (!upstashRateLimit && process.env.NODE_ENV === 'development') {
  console.warn('[RATE_LIMIT] In-memory fallback (dev only). Set UPSTASH_REDIS_REST_URL for production.');
}

/**
 * IP 추출 우선순위:
 * 1. x-real-ip (가장 신뢰)
 * 2. cf-connecting-ip (Cloudflare 환경)
 * 3. unknown (모두 없으면)
 * 
 * x-forwarded-for는 조작 가능하므로 사용하지 않음
 */
function getKey(req: Request): string {
  const realIp = req.headers.get('x-real-ip');
  const cfIp = req.headers.get('cf-connecting-ip');
  const ip = realIp ?? cfIp ?? 'unknown';
  return ip;
}

export async function checkLoginRateLimit(
  req: Request
): Promise<{ ok: boolean; retryAfter?: number }> {
  const key = getKey(req);

  // Upstash Redis 기반 (프로덕션)
  if (upstashRateLimit) {
    try {
      const { success, remaining, reset } = await upstashRateLimit.limit(key);

      if (!success) {
        const retryAfter = Math.ceil((reset - Date.now()) / 1000);
        return { ok: false, retryAfter: retryAfter > 0 ? retryAfter : 60 };
      }

      return { ok: true };
    } catch (err) {
      console.error('[RATE_LIMIT] Upstash check failed, falling back to memory:', err);
      // Upstash 실패 시 메모리 fallback으로 진행
    }
  }

  // 메모리 기반 Fallback
  const now = Date.now();
  let entry = memoryStore.get(key);

  if (!entry) {
    entry = { count: 1, resetAt: now + WINDOW_MS };
    memoryStore.set(key, entry);
    return { ok: true };
  }

  if (now > entry.resetAt) {
    entry = { count: 1, resetAt: now + WINDOW_MS };
    memoryStore.set(key, entry);
    return { ok: true };
  }

  entry.count += 1;
  if (entry.count > MAX_ATTEMPTS) {
    return { ok: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { ok: true };
}

/** 성공 시 카운트 리셋 (선택) */
export async function resetLoginRateLimit(req: Request): Promise<void> {
  const key = getKey(req);

  if (upstashRateLimit) {
    try {
      // Upstash Ratelimit은 자동으로 슬라이딩 윈도우를 관리하므로
      // 성공 시 명시적 리셋이 필요하지 않을 수 있음
      // 필요 시 Redis에서 직접 키 삭제 가능
      return;
    } catch (err) {
      console.error('[RATE_LIMIT] Upstash reset failed:', err);
    }
  }

  // 메모리 기반
  memoryStore.delete(key);
}
