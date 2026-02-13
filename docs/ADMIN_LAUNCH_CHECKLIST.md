# 관리자 시스템 런칭 리스크 점검 결과

## 수정/생성 파일 리스트

| 파일 | 변경 내용 |
|------|----------|
| `components/auth/AuthProvider.tsx` | 유저 정지(SUSPENDED) 시 로그인 차단 — 세션 로드 시 profiles.status 체크 후 자동 로그아웃 |
| `app/api/chat/route.ts` | POST에 인증 + requireActiveUser 추가 (채팅 작성 차단) |
| `app/api/payments/request/route.ts` | requireActiveUser 적용 (매수/결제 차단) |
| `app/api/orders/place/route.ts` | requireActiveUser 적용 (주문 차단) |
| `app/api/admin/kpi/join-to-buy/route.ts` | requireAdmin 추가 (RBAC API 검증) |
| `app/admin/orders/page.tsx` | orders 스키마에 맞게 total_amount_krw 사용, Order 타입 정리 |
| `supabase/migrations/20260219_chat_messages_is_deleted.sql` | chat_messages_v2에 is_deleted 컬럼 추가 |
| `docs/ADMIN_CHAT_DELETE_POLICY.md` | 채팅/공지 삭제 정책 문서 |
| `docs/ADMIN_LAUNCH_CHECKLIST.md` | 본 문서 |

---

## 체크 1~8 결과

### 1) 관리자 로그인 방식 단일화 — 통과
- `context/AuthContext.tsx`: Supabase Auth 기반 (`getSession`, `profiles.role`, `isAdminEmail`)
- `MASTER_ACCOUNT` / localStorage 하드코딩 없음
- `lib/admin/env.ts`: `NEXT_PUBLIC_ADMIN_EMAILS` 환경변수로 관리자 이메일 구성

### 2) RBAC 소스 단일화 — 통과
- `users/profiles` 테이블 `role` 기반
- `AdminRoute`: 프론트 라우트 보호
- API: `requireAdmin()` — `app/api/admin/audit`, `app/api/admin/kpi/join-to-buy` 적용

### 3) 감사로그 누락 전수 점검 — 통과
- `/admin/content`: CONTENT_APPROVE, CONTENT_REJECT, CONTENT_FORCE_DELETE
- `/admin/settlement`: 정산 확정 시 logAdminAction
- `/admin/chat/moderation`: CHAT_DELETE, CHAT_USER_SUSPEND
- `/admin/reports`: REPORT_RESOLVE
- `/admin/kpc`: KPC_GRANT
- `/admin/notice`: NOTICE_CREATE
- `/admin/orders`: 조회만, 버튼/액션 없음 — 누락 없음

### 4) service role 사용 최소화 — 보완 완료
- `app/api/admin/audit`: requireAdmin 후 service role (감사 로그 insert) — 허용
- `app/api/payments/confirm`: PG 콜백용 — 허용
- `app/api/chat`: GET은 공개, POST는 인증 후 service role 사용 (RLS 상 insert 필요)
- `app/api/market/tick`: 개발용 호가 생성 — 필요 시 관리자 전용 인증 추가 권장
- `app/api/admin/kpi/join-to-buy`: requireAdmin 후 supabaseAdmin — 허용

### 5) 정산 RPC 안전장치 — 통과
- `rpc_admin_confirm_settlement`: settlement_batches로 이미 확정 시 ok 반환 (idempotent)
- 2중 클릭/재호출 방지

### 6) 유저 정지 반영 — 통과
- 로그인 차단: `AuthProvider`에서 세션 로드 시 `profiles.status === 'SUSPENDED'`면 즉시 로그아웃
- 채팅 작성 차단: `app/api/chat` POST에 `requireActiveUser` 적용
- 매수/투자 차단: `orders/place`, `payments/request`에 `requireActiveUser` 적용

### 7) 운영자 공지/채팅 삭제 정책 — 보완 완료
- `chat_messages_v2`: `is_deleted` 컬럼 추가 (migration 20260219)
- 삭제 시 `UPDATE ... SET is_deleted = true` (소프트 삭제)
- `docs/ADMIN_CHAT_DELETE_POLICY.md`: 정책 문서 정리
- 채팅 모더레이션 페이지: 삭제/정지 시 `logAdminAction` 호출

### 8) 관리자 페이지 UX 최소 마감 — 통과
- 사이드바: `pathname` 기반 `isActive` 하이라이트
- 테이블: orders 페이지 limit 50 + total_amount_krw 표시
- 위험 버튼: 정산확정/강제삭제/정지/포인트지급에 `confirm()` 사용

---

## 런칭 전 최종 운영 체크리스트

### 환경변수
- [ ] `NEXT_PUBLIC_ADMIN_EMAILS` 설정 (비어 있으면 profiles.role='ADMIN'만 관리자)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` 서버 전용으로만 사용

### DB
- [ ] `profiles.role`, `profiles.status` 마이그레이션 적용
- [ ] `settlement_batches` 및 `rpc_admin_confirm_settlement` 적용
- [ ] `chat_messages_v2.is_deleted` 마이그레이션 적용

### 운영
- [ ] 관리자 계정 생성: profiles.role='ADMIN' 또는 ADMIN_EMAILS 등록
- [ ] 정지 유저 테스트: status=SUSPENDED 후 로그인/채팅/주문 차단 확인
- [ ] 감사 로그 확인: admin_audit_logs 테이블 정상 기록 여부

### 모니터링
- [ ] 정산 확정 중복 호출 방지 확인
- [ ] PG 콜백 API 보안(IP 화이트리스트 등) 검토
