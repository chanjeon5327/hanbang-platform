# AUTH Phase-2 운영 가이드

> 작성: 2026-02-18 | 버전: 1.0.0

---

## 개요

AUTH Phase-2는 HANBANG 금융 플랫폼의 인증 보안을 강화한 두 번째 단계입니다.
기존 Phase-1(계정 잠금 / 레이트리밋 / 감사 로그 기록)에 이어 아래 3가지 기능을 추가합니다.

| 기능 | 설명 | 관련 파일 |
|------|------|-----------|
| 8-1 세션 고정 공격 방어 | 로그인 성공 후 `refreshSession()` 강제 호출 | `app/api/auth/login/route.ts` |
| 8-2 동시 로그인 제한 | `profiles.session_version` 불일치 시 이전 세션 강제 만료 | `lib/supabase/middleware.ts` |
| 8-3 감사 로그 대시보드 | `/admin/audit-logins` — 기간/성공여부/이메일 필터 + 페이지네이션 | `app/admin/audit-logins/page.tsx` |

---

## 8-1 세션 고정 공격(Session Fixation) 방어

### 작동 방식
1. 사용자가 `/api/auth/login`에 POST
2. `signInWithPassword` 성공 후 즉시 `supabase.auth.refreshSession()` 호출
3. Supabase가 새 `access_token` + `refresh_token` 발급 → Set-Cookie 재전송
4. 로그인 전에 공격자가 주입한 세션 ID가 무효화됨

### 장애 시 롤백
- `refreshSession()` 실패는 **non-fatal** (warn 로그만 남기고 로그인 계속 진행)
- 완전 롤백이 필요한 경우: `app/api/auth/login/route.ts`에서 `refreshSession` 블록 제거

---

## 8-2 동시 로그인 제한(Concurrent Session Control)

### 정책
- **"마지막 로그인 기기만 유효"** — 새 기기에서 로그인하면 이전 세션은 다음 요청 시 만료

### 작동 방식
1. 로그인 성공 시 `randomUUID()` → `profiles.session_version`에 저장
2. 로그인 API 응답에는 포함하지 않음 (보안)
3. 클라이언트는 `hb_session_version` 쿠키에 버전을 보관
4. 미들웨어에서 매 요청마다 쿠키값 ↔ DB 값 비교
5. 불일치 시: `signOut()` + `/login?reason=concurrent` 리다이렉트

### 관리자 강제 로그아웃과의 충돌 방지
- `force_logout_at` 검사가 `session_version` 검사보다 **먼저** 실행
- `force_logout_at > last_login_at` → 무조건 강제 로그아웃 (더 강한 정책 우선)

### 장애 시 롤백
1. `lib/supabase/middleware.ts`에서 `session_version` 블록 제거
2. `app/api/auth/login/route.ts`에서 `session_version: newSessionVersion` 제거
3. DB migration은 컬럼이 `nullable`이므로 서비스 중단 없이 롤백 가능

---

## 8-3 감사 로그 대시보드

### 접근 방법
1. 브라우저에서 `/admin/audit-logins` 접속
2. ADMIN 권한 계정 필요 (`profiles.role = 'ADMIN'` 또는 `ADMIN_EMAILS` 환경변수)
3. 비관리자 접근 시 401/403 반환

### 필터 사용법
| 필터 | 설명 |
|------|------|
| 기간 | 24h / 7일 / 30일 중 선택 |
| 상태 | 전체 / 성공 / 실패 중 선택 |
| 이메일 | 부분 일치 검색 (Enter 또는 조회 버튼) |
| 페이지네이션 | 200건 단위, 이전/다음 버튼 |

### 데이터 보안
- API: `/api/admin/audit-logins` — `requireAdmin()` 서버 검증 필수
- DB 조회: `supabaseAdmin` (service_role) 사용 — RLS bypass
- `user_agent`, `ip_address` 등 개인정보는 콘솔 로그에 출력 금지

---

## 강제 로그아웃 사용법 (기존 Phase-1 기능)

```sql
-- 특정 사용자 즉시 강제 로그아웃
update profiles
  set force_logout_at = now()
  where id = '<user_uuid>';
```

- 다음 페이지 요청 시 미들웨어가 감지 → `/login?reason=force_logout` 리다이렉트
- 복구: `force_logout_at`을 `null`로 재설정

---

## 장애 시 전체 롤백 포인트

| 단계 | 파일/마이그레이션 | 롤백 방법 |
|------|-----------------|-----------|
| 세션 고정 방어 | `app/api/auth/login/route.ts` | refreshSession 블록 제거 |
| 동시 로그인 | `lib/supabase/middleware.ts` + `route.ts` | session_version 블록 제거 |
| 감사 대시보드 | `app/admin/audit-logins/page.tsx` | 페이지 삭제 or 접근 제한 |
| DB 컬럼 | `20260218200000_auth_phase2_concurrent_session.sql` | `ALTER TABLE profiles DROP COLUMN session_version` |

---

## 모니터링 포인트

- `[AUTH Phase-2] refreshSession failed` → warn 로그 증가 시 Supabase 세션 설정 확인
- `[CONCURRENT_SESSION] User xxx - evicting old session` → 정상 동작 (동시 로그인 감지)
- `[FORCE_LOGOUT] User xxx` → 관리자 강제 로그아웃 실행됨
