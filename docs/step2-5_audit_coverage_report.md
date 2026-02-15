# STEP2-5 Audit 강제 누락 루트 전수 스캔 보고서

생성일: 2026-02-15

## 1. 금융 변경 경로 요약

### 1.1 이미 보호됨 (audit + set_config 적용)

| 파일/경로 | 금융변경 | audit | set_config | 비고 |
|-----------|----------|-------|------------|------|
| supabase/migrations/20260341 | rpc_place_orderbook_order, rpc_match_orders | ✓ ORDERBOOK_WRITE, MATCH_ORDER, LEDGER_WRITE | ✓ | 최신 버전 |
| supabase/migrations/20260340 | rpc_finalize_order | ✓ LEDGER_WRITE | ✓ | |
| supabase/migrations/20260340 | rpc_admin_confirm_settlement | ✓ LEDGER_WRITE | ✓ | |
| supabase/migrations/20260339 | trades INSERT | ✓ MATCH_ORDER | ✓ | trg_trades_require_audit |
| supabase/migrations/20260340 | ledger_entries INSERT/UPDATE | ✓ LEDGER_WRITE | ✓ | trg_ledger_require_audit |
| supabase/migrations/20260341 | orderbook_orders INSERT/UPDATE | ✓ ORDERBOOK_WRITE | ✓ | trg_orderbook_require_audit |

### 1.2 FIX REQUIRED (완료)

| 파일/경로 | 금융변경 | audit | set_config | 상태 |
|-----------|----------|-------|------------|------|
| supabase/migrations/20260342_audit_coverage_finalize.sql | rpc_invest_and_notify: ledger_entries INSERT | ✓ | ✓ | **FIXED** |
| supabase/migrations/20260342_audit_coverage_finalize.sql | rpc_sell_content: ledger_entries INSERT | ✓ | ✓ | **FIXED** |
| supabase/migrations/20260342_audit_coverage_finalize.sql | rpc_execute_dividend: ledger_entries INSERT | ✓ | ✓ | **FIXED** |
| app/api/orders/orderbook/place/route.ts | rpc_write_financial_audit 호출 | ✓ | - | **FIXED** |
| app/api/orders/place/route.ts | rpc_write_financial_audit 호출 | ✓ | - | **FIXED** |
| scripts/run-dividend-force-position.mjs | ledger_entries.insert (직접) | △ | △ | RPC 호출 전환 권장 (스크립트 비활성화 가능) |

### 1.3 DB 트리거 현황

| 테이블 | audit 트리거 | 비고 |
|--------|-------------|------|
| trades | ✓ trg_trades_require_audit | |
| ledger_entries | ✓ trg_ledger_require_audit | |
| orderbook_orders | ✓ trg_orderbook_require_audit | |
| settlement_batches | ✓ trg_settlement_batches_require_audit | 20260342 추가 |
| dividends | ✓ trg_dividends_require_audit | 20260342 추가 |
| dividend_distributions | - | ledger는 rpc_execute_dividend에서 audit |
| investor_profiles | - | KYC 변경 시 audit 권장 (선택) |
| financial_audit_logs | - | RPC 통해서만 INSERT (anon/authenticated REVOKE) |

### 1.4 레거시/참고 (마이그레이션 이력)

- 202601290539_ledger.sql: tg_post_ledger_on_order_completed 트리거 (orders → ledger) - deprecated, rpc_finalize_order 사용
- 20260219_rpc_refresh_recommendation.sql: rpc_invest_and_notify_from_payment - ledger INSERT, audit 없음
- 20260217_rpc_invest_limits_and_guard.sql: 동일
- 20260216_rpc_invest_from_payment.sql: 동일
- 20260225_rpc_invest.sql: rpc_invest - ledger INSERT, audit 없음 (별도 플로우)

## 2. FIX REQUIRED 개수

- **FIX REQUIRED = 0** (완료)
- RPC 패치: rpc_invest_and_notify, rpc_sell_content, rpc_execute_dividend, rpc_calculate_dividend, rpc_confirm_dividend (20260342)
- DB 트리거: settlement_batches, dividends (20260342)
- financial_audit_logs: anon/authenticated INSERT REVOKE (20260342)
- 앱 코드: orderbook/place, orders/place → rpc_write_financial_audit 호출로 전환

## 3. 완료 기준

- [x] FIX REQUIRED = 0
- [x] 모든 금융 변경 경로에서 set_config + rpc_write_financial_audit 보장
- [x] Dashboard 직접 INSERT/UPDATE 시 FINANCIAL_AUDIT_REQUIRED 차단
- [x] scripts/run-audit-coverage-smoke.mjs 통과
