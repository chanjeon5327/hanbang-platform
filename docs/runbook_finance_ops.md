# ê¸ˆìœµ ?´ì˜ ?°ë¶ (Finance Operations Runbook)

?¥ì•  ? í˜•ë³?ì¦ìƒ ???•ì¸ ì¿¼ë¦¬ ???ì¸ ??ì¡°ì¹˜ ???˜ëŒë¦¬ê¸° ?œì„œë¡??•ë¦¬?©ë‹ˆ??

---

## 1. LOCK_BUSY ??¦

### ì¦ìƒ
- ì£¼ë¬¸/ë§¤ì¹­ API 409 ?‘ë‹µ ?¤ìˆ˜
- "? ì‹œ ???¤ì‹œ ?œë„??ì£¼ì„¸?? ? ìŠ¤??ë¹ˆë²ˆ
- ì²´ê²° ì§€?? ?¸ê?ì°??…ë°?´íŠ¸ ë©ˆì¶¤

### ?•ì¸ ì¿¼ë¦¬
```sql
-- LOCK_BUSY??DB??ì§ì ‘ ê¸°ë¡?˜ì? ?ŠìŒ. ? í”Œë¦¬ì??´ì…˜ ë¡œê·¸/ë©”íŠ¸ë¦??•ì¸ ?„ìš”
-- ìµœê·¼ 10ë¶?orderbook ì£¼ë¬¸ ?œë„ vs ?±ê³µ ë¹„ìœ¨ (ë©”íŠ¸ë¦??Œì´ë¸??ˆë‹¤ë©?
-- SELECT * FROM api_request_logs WHERE created_at > now() - interval '10 min' AND response_code = 409;
```

### ?ì¸
- ?™ì¼ content_id???€???™ì‹œ ë§¤ì¹­ ?”ì²­ ê³¼ë‹¤
- pg_try_advisory_xact_lock ?¤íŒ¨ ë°˜ë³µ
- ?¸ë˜???¤íŒŒ?´í¬ ?ëŠ” ë´??¬ì‹œ????£¼

### ì¡°ì¹˜
1. **ì¦‰ì‹œ**: ?¸ë˜???ŒìŠ¤ ?•ì¸ (?¹ì • IP/? ì? ì§‘ì¤‘ ?¬ë?)
2. **?¨ê¸°**: rate limit ê°•í™”, ?´ë¼?´ì–¸???¬ì‹œ??ë°±ì˜¤???•ì¸
3. **ì¤‘ê¸°**: rpc_match_orders ?¸ì¶œ ë¹ˆë„ ì¡°ì ˆ, ë°°ì¹˜ ë§¤ì¹­ ê²€??

### ?˜ëŒë¦¬ê¸° (Rollback)
- rate limit ?„í™”: ?¤ì • ?ë³µ
- ì½”ë“œ ë¡¤ë°±: ?´ì „ ë°°í¬ë¡?ë³µê?

---

## 2. Ledger ë¶ˆì¼ì¹?

### ì¦ìƒ
- ? ì? ?”ê³ /?¬ì??˜ê³¼ ledger_entries ?©ê³„ ë¶ˆì¼ì¹?
- fn_cash_available / fn_asset_available ê²°ê³¼ ?´ìƒ
- ?•ì‚°/ë°°ë‹¹ ?¤í–‰ ???¤ë¥˜

### ?•ì¸ ì¿¼ë¦¬
```sql
-- ?„ì²´ cash ë°¸ëŸ°??(?•ìƒ: 0???„ë‹Œ ê°’ì? "?œë“œ/?…ê¸ˆ" ì´í•©ê³??¼ì¹˜?´ì•¼ ??
SELECT
  SUM(CASE WHEN entry_type = 'CASH_CREDIT' THEN amount ELSE 0 END)
  - SUM(CASE WHEN entry_type = 'CASH_DEBIT' THEN ABS(amount) ELSE 0 END) AS cash_net
FROM ledger_entries;

-- ?„ì²´ asset ë°¸ëŸ°??(asset_idë³? ?•ìƒ: ê°?contentë³?CREDIT-DEBIT = 0 ?ëŠ” ë°œí–‰??
SELECT asset_id,
  SUM(CASE WHEN entry_type = 'ASSET_CREDIT' THEN quantity ELSE 0 END)
  - SUM(CASE WHEN entry_type = 'ASSET_DEBIT' THEN quantity ELSE 0 END) AS asset_net
FROM ledger_entries
WHERE asset_id IS NOT NULL
GROUP BY asset_id;
```

### ?ì¸
- ?¸ëœ??…˜ ë¡¤ë°± ??ë¶€ë¶?ì»¤ë°‹
- ?˜ë™ ledger ?˜ì •/?? œ
- ë²„ê·¸ë¡??¸í•œ ?´ì¤‘ ê¸°ë¡ ?ëŠ” ?„ë½

### ì¡°ì¹˜
1. **?•ì¸**: scripts/run-health-finance.mjs ?¤í–‰ ??FAIL ???ì„¸ ë¡œê·¸ ?•ì¸
2. **ê²©ë¦¬**: ?´ë‹¹ content_id/order_id ê±°ë˜ ?¼ì‹œ ì¤‘ë‹¨
3. **?˜ì •**: ?ì¥ ?˜ìˆ  ?¤í¬ë¦½íŠ¸(ledger-*.sql) ê²€????service_roleë¡??˜ë™ ë³´ì •
4. **ê²€ì¦?*: run-sim-match-burst.mjs, run-sim-pnl-volatility.mjsë¡??¬ê?ì¦?

### ?˜ëŒë¦¬ê¸° (Rollback)
- ?˜ë™ ë³´ì • ??ë°±ì—… ?„ìˆ˜
- ë³´ì • ?¤íŒ¨ ?? DB ?¤ëƒ…??ë³µì› ?ëŠ” ë³´ì • ?¸ëœ??…˜ ROLLBACK

---

## 3. ë§¤ì¹­ ?•ì?

### ì¦ìƒ
- ?¸ê?ì°½ì— bid/ask ?ˆìœ¼??ì²´ê²° ????
- rpc_match_orders ?¸ì¶œ?´ë„ matched_count 0
- trades ?Œì´ë¸?ìµœê·¼ INSERT ?†ìŒ

### ?•ì¸ ì¿¼ë¦¬
```sql
-- ë§¤ì¹­ ê°€?¥í•œ ?¸ê? ì¡´ì¬ ?¬ë?
SELECT content_id, side, COUNT(*), MIN(price_usd), MAX(price_usd)
FROM orderbook_orders
WHERE status IN ('open','partial')
  AND COALESCE(remaining_quantity, quantity - COALESCE(filled_quantity,0)) > 0
GROUP BY content_id, side;

-- ìµœê·¼ 10ë¶?ì²´ê²° ??
SELECT content_id, COUNT(*) FROM trades
WHERE created_at > now() - interval '10 min'
GROUP BY content_id;
```

### ?ì¸
- rpc_match_orders ë¯¸í˜¸ì¶?(API/?´ë¼?´ì–¸??ë¬¸ì œ)
- advisory lock ?êµ¬ ?ìœ  (?¸ì…˜ ë¹„ì •??ì¢…ë£Œ)
- ê°€ê²?ì¡°ê±´ ë¶ˆì¼ì¹?(best bid < best ask)

### ì¡°ì¹˜
1. **lock ?ìœ  ?•ì¸**: `SELECT * FROM pg_locks WHERE locktype = 'advisory';`
2. **?ìœ  ?¸ì…˜ ì¢…ë£Œ**: `SELECT pg_terminate_backend(pid) FROM pg_locks WHERE locktype = 'advisory' AND ...;`
3. **?˜ë™ ë§¤ì¹­ ?¸ë¦¬ê±?*: `SELECT rpc_match_orders('content_id');` ì§ì ‘ ?¸ì¶œ

### ?˜ëŒë¦¬ê¸° (Rollback)
- pg_terminate_backend???˜ëŒë¦????†ìŒ. ?„ìš” ???´ë‹¹ ?¸ì…˜ ?¬ì—°ê²?? ë„

---

## 4. Realtime ?Šê?

### ì¦ìƒ
- ?¸ê?ì°?ì²´ê²°?´ì—­ ?¤ì‹œê°??…ë°?´íŠ¸ ????
- Supabase Realtime êµ¬ë… ?´ì œ ?ëŠ” ?°ê²° ?Šê?

### ?•ì¸ ì¿¼ë¦¬
```sql
-- Realtime?€ DB ì¿¼ë¦¬ë¡?ì§ì ‘ ?•ì¸ ë¶ˆê?
-- Supabase Dashboard > Database > Replication ?•ì¸
-- ?ëŠ” ? í”Œë¦¬ì??´ì…˜ ë¡œê·¸?ì„œ "realtime" / "channel" / "subscribe" ê²€??
```

### ?ì¸
- Supabase Realtime ?œë¹„???¥ì• 
- ?¤íŠ¸?Œí¬ ë¶ˆì•ˆ??
- êµ¬ë… ì±„ë„ ê³¼ë‹¤ ?ëŠ” ë©”ëª¨ë¦?ë¶€ì¡?

### ì¡°ì¹˜
1. **Supabase ?íƒœ**: status.supabase.com ?•ì¸
2. **?´ë¼?´ì–¸??*: ?˜ì´ì§€ ?ˆë¡œê³ ì¹¨, êµ¬ë… ?¬ì—°ê²?
3. **?œë²„**: Realtime ?¬ìš©???°ê²° ???•ì¸ ???„ìš” ??ì±„ë„ ?•ë¦¬

### ?˜ëŒë¦¬ê¸° (Rollback)
- Realtime ?¤ì • ë³€ê²??? ?´ì „ ?¤ì •?¼ë¡œ ë³µì›

---

## 5. Audit ?„ë½

### ì¦ìƒ
- financial_audit_logs??ORDERBOOK_WRITE / LEDGER_WRITE / MATCH_ORDER ?„ë½
- fn_require_financial_audit ?¸ë¦¬ê±°ë¡œ ?¸í•œ FINANCIAL_AUDIT_REQUIRED ?ˆì™¸

### ?•ì¸ ì¿¼ë¦¬
```sql
-- ìµœê·¼ 10ë¶?audit ?¡ì…˜ë³?ì¹´ìš´??(?•ìƒ: ì£¼ë¬¸/ì²´ê²° ë°œìƒ ??0ë³´ë‹¤ ì»¤ì•¼ ??
SELECT action, COUNT(*)
FROM financial_audit_logs
WHERE created_at > now() - interval '10 min'
GROUP BY action;
```

### ?ì¸
- set_config('app.audit_written','on') ?„ë½
- rpc_write_financial_audit ?¸ì¶œ ???¸ëœ??…˜ ë¡¤ë°±
- RPC ?œê·¸?ˆì²˜ ë³€ê²½ìœ¼ë¡?audit ?¸ì¶œ ê²½ë¡œ ?„ë½

### ì¡°ì¹˜
1. **?„ë½ ê²½ë¡œ ?ë³„**: orderbook/place, orders/place, rpc_match_orders ??audit ?¸ì¶œ ?¬ë? ?•ì¸
2. **ë§ˆì´ê·¸ë ˆ?´ì…˜ ?ìš©**: apply-audit-coverage-finalize.sql ???ìš© ?¬ë? ?•ì¸
3. **ì½”ë“œ ?˜ì •**: ?„ë½??ê²½ë¡œ??set_config + rpc_write_financial_audit ì¶”ê?

### ?˜ëŒë¦¬ê¸° (Rollback)
- audit ê´€??ë§ˆì´ê·¸ë ˆ?´ì…˜ ë¡¤ë°± ?? fn_require_financial_audit ?¸ë¦¬ê±?ë¹„í™œ?±í™” ì£¼ì˜ (ledger/trades ë¬´ë‹¨ ë³€ê²?ê°€??

---

## 6. ë¶ˆë????„ë°˜ ì£¼ë¬¸

### ì¦ìƒ
- remaining_quantity < 0
- filled_quantity > quantity
- status?€ filled/remaining ë¶ˆì¼ì¹?

### ?•ì¸ ì¿¼ë¦¬
```sql
-- remaining < 0 ?ëŠ” filled > quantity
SELECT id, content_id, side, quantity, filled_quantity, remaining_quantity, status
FROM orderbook_orders
WHERE remaining_quantity < 0 OR filled_quantity > quantity
   OR (remaining_quantity + filled_quantity) != quantity;
```

### ?ì¸
- ?™ì‹œ??ë²„ê·¸ë¡??¸í•œ ?´ì¤‘ ì²´ê²°
- ?˜ë™ DB ?˜ì • ?¤ë¥˜
- ë§ˆì´ê·¸ë ˆ?´ì…˜/?¨ì¹˜ ì¤?ë¶ˆì™„???ìš©

### ì¡°ì¹˜
1. **ê²©ë¦¬**: ?´ë‹¹ ì£¼ë¬¸ statusë¥?'cancelled' ?ëŠ” ë³„ë„ ?Œë˜ê·¸ë¡œ ?œì‹œ
2. **?˜ì •**: remaining_quantity = quantity - filled_quantity, status ?•í•©??ë³µêµ¬
3. **ê²€ì¦?*: ledger?€???¼ì¹˜ ?¬ë? ?•ì¸

### ?˜ëŒë¦¬ê¸° (Rollback)
- ?˜ì • ??orderbook_orders ë°±ì—…
- ?˜ì • ?¤íŒ¨ ??ë°±ì—…?ì„œ ë³µì›

---

## ê³µí†µ ì²´í¬ë¦¬ìŠ¤??

| ??ª© | ëª…ë ¹/ì¿¼ë¦¬ |
|------|-----------|
| ê¸ˆìœµ ?¬ìŠ¤ ì²´í¬ | `node scripts/run-health-finance.mjs` |
| SQL ?ê? ì¿¼ë¦¬ | `scripts/sql/ops_checks.sql` ì°¸ê³  |
| ?œë??ˆì´??ê²€ì¦?| `node scripts/run-sim-match-burst.mjs` |
| Audit ì»¤ë²„ë¦¬ì? | `node scripts/run-audit-coverage-smoke.mjs` |
