# HANBANG Platform — 작업 보고서 (2026.03.01 기준)

## 📋 전체 작업 차트

| 단계 | 작업 내용 | 검증 내용 | 수행 내역 | 완료 |
|------|-----------|-----------|-----------|------|
| **2-8** | 주문 상태 머신 + 부분체결 | trades 2건, status=filled, ledger 검증 | 마이그레이션 2건, route.ts 보강 | ✅ |
| **2-9** | 주문 취소 + HOLD/RELEASE | canceled, locked=0, CASH/ASSET_RELEASE | 마이그레이션, cancel API | ✅ |
| **2-10** | 매칭엔진 + placed 유지 | BUY/SELL 매칭, ledger/positions 원자화 | rpc_match_orders, place_limit, match API | ✅ |
| **3-1** | KYC/온보딩 강제 라우팅 | protectedPaths 리다이렉트 | 기존 구현 확인 | ✅ |
| **4-1** | 감사로그 + 정산배치 + 해시봉인 | LEDGER_IMMUTABLE, hash seal | audit_logs, settlement_batches, 트리거 | ✅ |
| **4-2** | 정산 리포트 + 관리자 확정 | 배치 생성 → 리포트 → 봉인 | RPC 3종, API 2종, admin UI | ✅ |

---

## 🔧 2-8단계: 주문 상태 머신 + 부분체결

### 목표
- orders: placed → (partial) → filled / canceled
- filled_qty, remaining_qty, avg_fill_price_krw
- trades: 체결 단위 다건, ledger_entries: trade 단위

### 생성/수정 파일
| 파일 | 작업 |
|------|------|
| `supabase/migrations/20260301094000_order_state_machine_partial_fill.sql` | 신규 |
| `supabase/migrations/20260301095000_rpc_place_order_atomic_partial.sql` | 신규 |
| `app/api/orders/place/route.ts` | status, filled_qty 등 응답 보강 |

### 검증
- [x] 주문 1회 → trades 2건
- [x] orders.status='filled'
- [x] filled_qty=qty, remaining_qty=0
- [x] ledger: ASSET_CREDIT 2건, CASH_DEBIT 2건

---

## 🔧 2-9단계: 주문 취소 + HOLD/RELEASE

### 목표
- 미체결/부분체결 취소 → status='canceled'
- remaining_qty 기준 locked 해제
- CASH_RELEASE / ASSET_RELEASE 원장 기록

### 생성/수정 파일
| 파일 | 작업 |
|------|------|
| `supabase/migrations/20260301101000_order_cancel_hold_release.sql` | 신규 |
| `app/api/orders/cancel/route.ts` | 신규 |

### 검증
- [x] POST /api/orders/cancel → status=canceled
- [x] locked_cash_krw, locked_asset_qty = 0
- [x] ledger_entries에 CASH_RELEASE 또는 ASSET_RELEASE

---

## 🔧 2-10단계: 매칭엔진 + placed 유지

### 목표
- 주문 placed 상태 유지
- rpc_match_orders로 BUY/SELL 매칭
- 부분체결, ledger/positions 원자 처리

### 생성/수정 파일
| 파일 | 작업 |
|------|------|
| `supabase/migrations/20260301110000_matching_engine.sql` | 신규 |
| `app/api/match/route.ts` | 신규 |

### 검증
- [x] rpc_place_order_limit → placed
- [x] rpc_match_orders → trades 생성
- [x] orders partial/filled, positions 증감

---

## 🔧 3-1단계: KYC/온보딩 강제 라우팅

### 목표
- KYC 미승인 → /kyc 리다이렉트
- 온보딩 미완료 → /onboarding 리다이렉트

### 상태
- **기존 구현 확인** — `lib/supabase/middleware.ts`에 이미 적용됨

### 보호 경로
`/wallet`, `/market`, `/trade`, `/order`

---

## 🔧 4-1단계: 감사로그 + 정산배치 + 해시봉인

### 목표
- ledger_entries 수정 불가
- settlement_batch 단위 정산
- hash seal 생성

### 생성/수정 파일
| 파일 | 작업 |
|------|------|
| `supabase/migrations/20260301140000_pg_audit_settlement_seal.sql` | 신규 |
| `supabase/migrations/20260301140100_audit_logs_in_rpcs.sql` | 신규 |

### 해시 생성 방식
```
v_concat = string_agg(id || amount || quantity, '' ORDER BY id)
v_hash = encode(digest(v_concat, 'sha256'), 'hex')
```

### PG 심사 관점
- **불변성**: ledger UPDATE/DELETE → LEDGER_IMMUTABLE
- **감사 추적**: audit_logs에 ORDER_CREATED, TRADE_EXECUTED
- **봉인**: settlement_batches.status=sealed, hash 저장

---

## 🔧 4-2단계: 정산 리포트 + 관리자 확정

### 목표
- 날짜 기준 배치 생성
- ledger_entries batch_id 연결
- 정산 리포트 JSON 생성
- 관리자 확정 시 hash seal

### 생성/수정 파일
| 파일 | 작업 |
|------|------|
| `supabase/migrations/20260301150000_settlement_report_admin_flow.sql` | 신규 |
| `app/api/admin/settlement/create/route.ts` | 신규 |
| `app/api/admin/settlement/seal/route.ts` | 신규 |
| `app/admin/settlement/page.tsx` | 수정 |

### 정산 흐름 4단계
1. **배치 생성** — rpc_create_settlement_batch(batch_date)
2. **ledger 묶기** — 해당 날짜 ledger_entries에 batch_id 설정
3. **리포트 생성** — rpc_generate_settlement_report(batch_id)
4. **봉인** — rpc_seal_settlement_batch(batch_id) → hash 저장

### PG 심사 관점
- **배치 단위 확정**: open → sealed
- **리포트**: total_cash_debit, total_asset_credit
- **audit_logs**: SETTLEMENT_BATCH_CREATED 기록

---

## 📁 전체 생성/수정 파일 목록

### 마이그레이션
- `20260301094000_order_state_machine_partial_fill.sql`
- `20260301095000_rpc_place_order_atomic_partial.sql`
- `20260301101000_order_cancel_hold_release.sql`
- `20260301110000_matching_engine.sql`
- `20260301120000_profile_flags.sql` (기존)
- `20260301140000_pg_audit_settlement_seal.sql`
- `20260301140100_audit_logs_in_rpcs.sql`
- `20260301150000_settlement_report_admin_flow.sql`

### API
- `app/api/orders/place/route.ts` (수정)
- `app/api/orders/cancel/route.ts`
- `app/api/match/route.ts`
- `app/api/admin/settlement/create/route.ts`
- `app/api/admin/settlement/seal/route.ts`

### UI
- `app/admin/settlement/page.tsx` (수정)
- `app/admin/settlement/[id]/page.tsx` (수정 — batch_date, status, hash, seal 연동)

### 미들웨어
- `lib/supabase/middleware.ts` (기존 KYC/온보딩 로직)

---

## ✅ 완료 내역 요약

| 카테고리 | 완료 항목 |
|----------|-----------|
| **주문 엔진** | 상태 머신, 부분체결, 취소, 매칭 |
| **라우팅** | KYC/온보딩 강제 |
| **감사/정산** | audit_logs, settlement_batches, hash seal, 리포트, 관리자 UI |
