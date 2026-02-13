# orders 소유자/구매자 컬럼 user_id 기준 통일

## 1) orders 스키마 buyer_id / user_id

| 마이그레이션 | buyer_id | user_id |
|-------------|----------|---------|
| 202601290539_ledger | ✓ (신규 생성) | - |
| 202601290625_orders_buyer_id_fix | ✓ (NOT NULL) | user_id → buyer_id 이관 |
| 20260211_view_join_to_buy | - | ✓ (o.user_id 사용) |
| lib/supabase/types.ts | - | ✓ (orders_user_id_fkey) |

**결론**: types와 앱 코드는 user_id 기준. buyer_id는 레거시. **user_id를 표준으로 통일**.

---

## 2) buyer_id 참조 전수 목록

| 파일 | 용도 |
|------|------|
| supabase/migrations/20260224_settlement_update_guard.sql | v_user := v_order.buyer_id |
| supabase/migrations/20260220_rpc_finalize_order_simple.sql | v_user := v_order.buyer_id |
| supabase/migrations/20260214_payment_flow_finalize.sql | v_user := v_row.buyer_id |
| supabase/migrations/20260213_payment_flow_standard.sql | v_buyer_id, buyer_id insert |
| supabase/migrations/20260212_rpc_place_order.sql | v_buyer_id, buyer_id insert |
| supabase/migrations/202601290539_ledger.sql | buyer_id, v_user := new.buyer_id |
| supabase/migrations/202601290625_orders_buyer_id_fix.sql | buyer_id 추가/이관 |
| supabase/migrations/202601290610_orders_rls.sql | buyer_id insert |
| supabase/migrations/XXXX_rls_orders.sql | buyer_id = auth.uid() |
| supabase/migrations/XXXX_orders_with_seller.sql | o.buyer_id |
| supabase/migrations/XXXX_admin_orders_view.sql | o.buyer_id |
| supabase/migrations/XXXX_orders_products.sql | buyer_id |
| supabase/scripts/e2e_payment_ledger_settlement_test.sql | buyer_id insert |

---

## 3) 수정 사항

- **20260226_orders_owner_user_id.sql** (신규): user_id 보장, backfill, RPC/RLS/뷰 통일
- **20260225_rpc_post_ledger_for_order.sql**: 소유자 검증 COALESCE(user_id, buyer_id)
- **e2e_payment_ledger_settlement_test.sql**: insert에 user_id 추가

---

## 4) 최종 기준

- **쓰기**: user_id 사용 (rpc_place_order, place route, rpc_invest)
- **읽기/검증**: COALESCE(user_id, buyer_id) (RLS, rpc_finalize_order, rpc_post_ledger_for_order)
- **뷰**: COALESCE(o.user_id, o.buyer_id) AS buyer_id (호환 유지)
