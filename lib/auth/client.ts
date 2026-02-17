/**
 * 클라이언트용 로그인/로그아웃 단일 함수
 * - API 호출만 수행, 세션은 쿠키 기반(서버)에서 관리
 */

export type LoginResult = { ok: true; user?: { id: string; email?: string } } | { ok: false; error: string };

export async function login(email: string, password: string): Promise<LoginResult> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim(), password }),
  });

  const json = await res.json().catch(() => ({}));

  if (res.status === 429) {
    return { ok: false, error: json.error ?? '너무 많은 시도입니다. 잠시 후 다시 시도해주세요.' };
  }
  if (res.status === 401) {
    return { ok: false, error: '이메일 또는 비밀번호가 올바르지 않습니다.' };
  }
  if (!res.ok) {
    return { ok: false, error: json.error ?? '로그인에 실패했습니다.' };
  }

  return { ok: true, user: json.user ?? undefined };
}

export async function logout(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST' });
}
