# orders ?Œìœ ??êµ¬ë§¤??ì»¬ëŸ¼ user_id ê¸°ì? ?µì¼

## 1) orders ?¤í‚¤ë§?buyer_id / user_id

| ë§ˆì´ê·¸ë ˆ?´ì…˜ | buyer_id | user_id |
|-------------|----------|---------|
| 202601290539_ledger | ??(? ê·œ ?ì„±) | - |
| 202601290625_orders_buyer_id_fix | ??(NOT NULL) | user_id ??buyer_id ?´ê? |
| 20260211_view_join_to_buy | - | ??(o.user_id ?¬ìš©) |
| lib/supabase/types.ts | - | ??(orders_user_id_fkey) |

**ê²°ë¡ **: types?€ ??ì½”ë“œ??user_id ê¸°ì?. buyer_id???ˆê±°?? **user_idë¥??œì??¼ë¡œ ?µì¼**.

---

## 2) buyer_id ì°¸ì¡° ?„ìˆ˜ ëª©ë¡

| ?Œì¼ | ?©ë„ |
|------|------|
| supabase/migrations/20260224_settlement_update_guard.sql | v_user := v_order.buyer_id |
| supabase/migrations/20260220_rpc_finalize_order_simple.sql | v_user := v_order.buyer_id |
| supabase/migrations/20260214_payment_flow_finalize.sql | v_user := v_row.buyer_id |
| supabase/migrations/20260213_payment_flow_standard.sql | v_buyer_id, buyer_id insert |
| supabase/migrations/20260212_rpc_place_order.sql | v_buyer_id, buyer_id insert |
| supabase/migrations/202601290539_ledger.sql | buyer_id, v_user := new.buyer_id |
| supabase/migrations/202601290625_orders_buyer_id_fix.sql | buyer_id ì¶”ê?/?´ê? |
| supabase/migrations/202601290610_orders_rls.sql | buyer_id insert |
| supabase/migrations/XXXX_rls_orders.sql | buyer_id = auth.uid() |
| supabase/migrations/XXXX_orders_with_seller.sql | o.buyer_id |
| supabase/migrations/XXXX_admin_orders_view.sql | o.buyer_id |
| supabase/migrations/XXXX_orders_products.sql | buyer_id |
| supabase/scripts/e2e_payment_ledger_settlement_test.sql | buyer_id insert |

---

## 3) ?˜ì • ?¬í•­

- **20260226_orders_owner_user_id.sql** (? ê·œ): user_id ë³´ì¥, backfill, RPC/RLS/ë·??µì¼
- **20260225_rpc_post_ledger_for_order.sql**: ?Œìœ ??ê²€ì¦?COALESCE(user_id, buyer_id)
- **e2e_payment_ledger_settlement_test.sql**: insert??user_id ì¶”ê?

---

## 4) ìµœì¢… ê¸°ì?

- **?°ê¸°**: user_id ?¬ìš© (rpc_place_order, place route, rpc_invest)
- **?½ê¸°/ê²€ì¦?*: COALESCE(user_id, buyer_id) (RLS, rpc_finalize_order, rpc_post_ledger_for_order)
- **ë·?*: COALESCE(o.user_id, o.buyer_id) AS buyer_id (?¸í™˜ ? ì?)
