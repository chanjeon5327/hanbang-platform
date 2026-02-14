# 인증/세션 통합 점검 체크리스트

> 세션 불일치 제거 + 레이트리밋 적용 완료 기준

---

## 완료 기준 체크리스트

### 1. 로그인/로그아웃 단일 함수 통일
- [ ] **로그인**: `login()` (`lib/auth/client.ts`) → `/api/auth/login` 호출만 사용
- [ ] **로그아웃**: `signOut()` / `logout()` → `/api/auth/logout` 호출만 사용
- [ ] 로그인 페이지, LoginModal, Admin 로그인 모두 `login()` 사용
- [ ] Header, Admin 레이아웃 모두 API 기반 `signOut`/`logout` 사용

### 2. 세션은 쿠키 기반(@supabase/ssr)만 신뢰
- [ ] `GET /api/auth/session` → 서버 `createClient()` (cookies)로만 세션 조회
- [ ] AuthProvider: `fetch('/api/auth/session')` 사용, 클라이언트 `getSession()` 미사용
- [ ] Admin AuthContext: `fetch('/api/auth/session?admin=1')` 사용
- [ ] `onAuthStateChange` / `getSession` 클라이언트 호출 제거됨

### 3. localStorage 잔재 제거
- [ ] 로그아웃 시 `clearAuthStorage()` 호출 (sb-*, supabase, auth-token 키 제거)
- [ ] 세션 없을 때(API가 null 반환) `clearAuthStorage()` 호출

### 4. 레이트리밋
- [ ] `POST /api/auth/login` → IP당 5회/분 초과 시 429
- [ ] 429 응답에 `Retry-After` 헤더 포함
- [ ] 로그인 성공 시 해당 IP 카운트 리셋

### 5. OAuth 콜백
- [ ] `GET /auth/callback?code=xxx` → `route.ts`에서 서버 `exchangeCodeForSession` 처리
- [ ] 클라이언트 `exchangeCodeForSession` 제거 (page.tsx 삭제)

---

## 수정 파일 목록

| 파일 | 변경 내용 |
|------|----------|
| `lib/auth/rateLimit.ts` | 신규: 메모리 레이트리밋 (5회/분) |
| `lib/auth/clearStorage.ts` | 신규: localStorage sb-* 키 제거 |
| `lib/auth/client.ts` | 신규: login(), logout() 단일 함수 |
| `app/api/auth/login/route.ts` | 신규: 서버 로그인 + 레이트리밋 |
| `app/api/auth/logout/route.ts` | 신규: 서버 로그아웃 |
| `app/api/auth/session/route.ts` | 신규: 쿠키 기반 세션 + admin 옵션 |
| `app/auth/callback/route.ts` | 신규: OAuth 코드 교환 (서버) |
| `app/auth/callback/page.tsx` | 삭제 |
| `components/auth/AuthProvider.tsx` | API 기반 세션/로그아웃, clearStorage |
| `components/auth/LoginModal.tsx` | login() 사용, onSuccess |
| `app/login/page.tsx` | login() 사용 |
| `app/admin/login/page.tsx` | login() 사용 |
| `context/AuthContext.tsx` | API 세션, API 로그아웃 |
