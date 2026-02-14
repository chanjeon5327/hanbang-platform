# 결제-투자 상태머신 런칭 준비 문서

## 1. 신규/수정 파일 통코

### 마이그레이션
| 파일 | 설명 |
|------|------|
| `20260216_order_status_machine.sql` | orders.status ENUM 6단계 고정 |
| `20260216_payments_pg_table.sql` | payments 테이블 PG 대응 |
| `20260216_rpc_invest_from_payment.sql` | rpc_invest_and_notify_from_payment |

### API
| 파일 | 설명 |
|------|------|
| `app/api/payments/request/route.ts` | POST 결제 요청 → order+payments 생성, redirect URL |
| `app/api/payments/confirm/route.ts` | GET/POST PG 콜백, 샌드박스 자동 승인 |
| `app/api/admin/payments/route.ts` | GET 관리자 결제 목록 |
| `app/api/orders/place/route.ts` | @deprecated 처리 |

### 프론트
| 파일 | 설명 |
|------|------|
| `app/admin/payments/page.tsx` | 결제 모니터링, 상태 필터, 재시도 버튼 |
| `app/admin/layout.tsx` | 결제 모니터링 메뉴 추가 |

### 문서
| 파일 | 설명 |
|------|------|
| `docs/ORDER_STATE_MACHINE.md` | 상태 전이 다이어그램 |
| `docs/PAYMENT_STATE_MACHINE_LAUNCH.md` | 본 문서 |

---

## 2. 마이그레이션 실행 순서

1. `20260216_order_status_machine.sql`
2. `20260216_payments_pg_table.sql`
3. `20260216_rpc_invest_from_payment.sql`

---

## 3. PG 연결 시 변경해야 할 부분 (5줄 요약)

1. **getPgRedirectUrl** (`app/api/payments/request/route.ts`): 실제 PG SDK로 결제 요청 URL 생성
2. **confirm POST** (`app/api/payments/confirm/route.ts`): PG 승인 검증 로직 추가 (sandbox 분기 제거)
3. **PG_SANDBOX=false**: `.env`에서 `PG_SANDBOX=false`로 설정
4. **PG 콜백 URL**: PG 사에 등록할 confirm URL (`/api/payments/confirm`)
5. **pg_transaction_id**: PG 승인 응답에서 transaction_id 추출 후 payments에 저장

---

## 4. 상용 가능 상태 체크리스트 (20개)

### DB/마이그레이션
- [ ] order_status 6단계 ENUM 적용
- [ ] payments 테이블 user_id, content_id, pg_provider, approved_at 존재
- [ ] idx_payments_order, idx_payments_user, unique(pg_transaction_id) 존재
- [ ] rpc_invest_and_notify_from_payment 함수 존재

### 결제 플로우
- [ ] POST /api/payments/request → order(PAYMENT_REQUESTED) + payment(INIT) 생성
- [ ] redirect_url 반환 (샌드박스 시 /api/payments/confirm?payment_id=...&sandbox=1)
- [ ] GET /api/payments/confirm → 샌드박스 시 자동 승인 → INVEST_CONFIRMED
- [ ] POST /api/payments/confirm → 동일 처리 (PG 콜백용)
- [ ] PG_SANDBOX=true 시 mock 승인 동작

### RPC
- [ ] rpc_invest_and_notify_from_payment: PAYMENT_REQUESTED/APPROVED → INVEST_CONFIRMED
- [ ] advisory lock (pg_advisory_xact_lock) 적용
- [ ] 중복 실행 시 idempotent return
- [ ] set_config('app.allow_settlement','on') 사용

### 관리자
- [ ] /admin/payments 페이지 동작
- [ ] 상태 필터 (INIT, PAYMENT_APPROVED 등)
- [ ] 재시도 버튼 (INIT → confirm API 호출)
- [ ] GET /api/admin/payments requireAdmin 검증

### 보안/환경
- [ ] PG_SANDBOX 환경변수 .env.example 문서화
- [ ] /api/orders/place deprecated 주석
- [ ] payments RLS: user 본인만 SELECT

### 문서
- [ ] docs/ORDER_STATE_MACHINE.md 상태 전이 다이어그램

### 마켓 연동 (PG 연결 시)
- [ ] 마켓 상세 투자 버튼 → POST /api/payments/request 호출 후 redirect_url로 이동
