# PG(?˜ì´ë¨¼íŠ¸ ê²Œì´?¸ì›¨?? ?¤ì „ ?€ë¹?ìµœì¢… ë¬¸ì„œ

## 1. orders.status ENUM ?ê?

| ?„ì¬ ê°?| PG ê¶Œì¥ | ë¹„ê³  |
|---------|---------|------|
| PENDING | PENDING | ê²°ì œ ?€ê¸?|
| PAID | PAID | ê²°ì œ ?„ë£Œ |
| COMPLETED | CONFIRMED | ì£¼ë¬¸ ?•ì • (ë§ˆì¼“ ?¬ì??ì¦‰ì‹œ COMPLETED) |
| SETTLED | SETTLED | ?•ì‚° ?„ë£Œ |

??ë§ˆì¼“ ?¬ì ?Œë¡œ?°ëŠ” PENDING/PAID ?¨ê³„ ?†ì´ ì¦‰ì‹œ COMPLETED. ê¸°ì¡´ ENUM ? ì?.

## 2. idempotency_key

- `orders.idempotency_key` text, unique (null ?œì™¸)
- ?´ë¼?´ì–¸?¸ê? ?™ì¼ ê²°ì œ ?”ì²­ ???™ì¼ ???„ë‹¬ ??ì¤‘ë³µ ì£¼ë¬¸ ë°©ì?
- `rpc_invest_and_notify(p_idempotency_key)` ì§€??

## 3. Double-Spend ë°©ì? êµ¬ì¡°

1. **?”ì•¡ ê²€ì¦?*: ?¬ì ??ledger ?©ì‚°
2. **?ì??RPC**: order + ledger + content_items + notifications ?¨ì¼ ?¸ëœ??…˜
3. **idempotency_key**: ?™ì¼ ?”ì²­ ?¬ì „????ê¸°ì¡´ ì£¼ë¬¸ ë°˜í™˜
4. **ledger CASH_DEBIT ì¤‘ë³µ ì²´í¬**: order_id??1?Œë§Œ

## 4. content_id ì¤‘ì‹¬ êµ¬ì¡°

- ë§ˆì¼“ ê¸°ì? ID = content_items.id
- orders.content_id, ledger asset_id, notifications reference_id ëª¨ë‘ content_id
- product_id???€???´ì˜, ì¶”í›„ ?œê±°

## 5. ë§ˆì´ê·¸ë ˆ?´ì…˜ ?¤í–‰ ?œì„œ

1. `20260215_products_content_id.sql`
2. `20260215_orders_content_id_dual.sql`
3. `20260215_orders_pg_ready.sql`
4. `20260215_rpc_invest_and_notify_content_id.sql`
