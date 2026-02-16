# STEP2-5 Audit ê°•ì œ ?„ë½ ë£¨íŠ¸ ?„ìˆ˜ ?¤ìº” ë³´ê³ ??

?ì„±?? 2026-02-15

## 1. ê¸ˆìœµ ë³€ê²?ê²½ë¡œ ?”ì•½

### 1.1 ?´ë? ë³´í˜¸??(audit + set_config ?ìš©)

| ?Œì¼/ê²½ë¡œ | ê¸ˆìœµë³€ê²?| audit | set_config | ë¹„ê³  |
|-----------|----------|-------|------------|------|
| supabase/migrations/20260341 | rpc_place_orderbook_order, rpc_match_orders | ??ORDERBOOK_WRITE, MATCH_ORDER, LEDGER_WRITE | ??| ìµœì‹  ë²„ì „ |
| supabase/migrations/20260340 | rpc_finalize_order | ??LEDGER_WRITE | ??| |
| supabase/migrations/20260340 | rpc_admin_confirm_settlement | ??LEDGER_WRITE | ??| |
| supabase/migrations/20260339 | trades INSERT | ??MATCH_ORDER | ??| trg_trades_require_audit |
| supabase/migrations/20260340 | ledger_entries INSERT/UPDATE | ??LEDGER_WRITE | ??| trg_ledger_require_audit |
| supabase/migrations/20260341 | orderbook_orders INSERT/UPDATE | ??ORDERBOOK_WRITE | ??| trg_orderbook_require_audit |

### 1.2 FIX REQUIRED (?„ë£Œ)

| ?Œì¼/ê²½ë¡œ | ê¸ˆìœµë³€ê²?| audit | set_config | ?íƒœ |
|-----------|----------|-------|------------|------|
| supabase/migrations/20260342_audit_coverage_finalize.sql | rpc_invest_and_notify: ledger_entries INSERT | ??| ??| **FIXED** |
| supabase/migrations/20260342_audit_coverage_finalize.sql | rpc_sell_content: ledger_entries INSERT | ??| ??| **FIXED** |
| supabase/migrations/20260342_audit_coverage_finalize.sql | rpc_execute_dividend: ledger_entries INSERT | ??| ??| **FIXED** |
| app/api/orders/orderbook/place/route.ts | rpc_write_financial_audit ?¸ì¶œ | ??| - | **FIXED** |
| app/api/orders/place/route.ts | rpc_write_financial_audit ?¸ì¶œ | ??| - | **FIXED** |
| scripts/run-dividend-force-position.mjs | ledger_entries.insert (ì§ì ‘) | ??| ??| RPC ?¸ì¶œ ?„í™˜ ê¶Œì¥ (?¤í¬ë¦½íŠ¸ ë¹„í™œ?±í™” ê°€?? |

### 1.3 DB ?¸ë¦¬ê±??„í™©

| ?Œì´ë¸?| audit ?¸ë¦¬ê±?| ë¹„ê³  |
|--------|-------------|------|
| trades | ??trg_trades_require_audit | |
| ledger_entries | ??trg_ledger_require_audit | |
| orderbook_orders | ??trg_orderbook_require_audit | |
| settlement_batches | ??trg_settlement_batches_require_audit | 20260342 ì¶”ê? |
| dividends | ??trg_dividends_require_audit | 20260342 ì¶”ê? |
| dividend_distributions | - | ledger??rpc_execute_dividend?ì„œ audit |
| investor_profiles | - | KYC ë³€ê²???audit ê¶Œì¥ (? íƒ) |
| financial_audit_logs | - | RPC ?µí•´?œë§Œ INSERT (anon/authenticated REVOKE) |

### 1.4 ?ˆê±°??ì°¸ê³  (ë§ˆì´ê·¸ë ˆ?´ì…˜ ?´ë ¥)

- 202601290539_ledger.sql: tg_post_ledger_on_order_completed ?¸ë¦¬ê±?(orders ??ledger) - deprecated, rpc_finalize_order ?¬ìš©
- 20260219_rpc_refresh_recommendation.sql: rpc_invest_and_notify_from_payment - ledger INSERT, audit ?†ìŒ
- 20260217_rpc_invest_limits_and_guard.sql: ?™ì¼
- 20260216_rpc_invest_from_payment.sql: ?™ì¼
- 20260225_rpc_invest.sql: rpc_invest - ledger INSERT, audit ?†ìŒ (ë³„ë„ ?Œë¡œ??

## 2. FIX REQUIRED ê°œìˆ˜

- **FIX REQUIRED = 0** (?„ë£Œ)
- RPC ?¨ì¹˜: rpc_invest_and_notify, rpc_sell_content, rpc_execute_dividend, rpc_calculate_dividend, rpc_confirm_dividend (20260342)
- DB ?¸ë¦¬ê±? settlement_batches, dividends (20260342)
- financial_audit_logs: anon/authenticated INSERT REVOKE (20260342)
- ??ì½”ë“œ: orderbook/place, orders/place ??rpc_write_financial_audit ?¸ì¶œë¡??„í™˜

## 3. ?„ë£Œ ê¸°ì?

- [x] FIX REQUIRED = 0
- [x] ëª¨ë“  ê¸ˆìœµ ë³€ê²?ê²½ë¡œ?ì„œ set_config + rpc_write_financial_audit ë³´ì¥
- [x] Dashboard ì§ì ‘ INSERT/UPDATE ??FINANCIAL_AUDIT_REQUIRED ì°¨ë‹¨
- [x] scripts/run-audit-coverage-smoke.mjs ?µê³¼
