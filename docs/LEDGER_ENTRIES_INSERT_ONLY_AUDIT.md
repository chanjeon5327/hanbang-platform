# ledger_entries Insert-Only êµ¬ì¡° ?ê? ?°ì¶œë¬?

## 1. ê²€??ê²°ê³¼ ?Œì¼ ëª©ë¡

### 1.1 ledger_entries ì§ì ‘ ?‘ê·¼

| ?Œì¼ | ?¨í„´ | ?©ë„ | ?„í—˜ |
|------|------|------|------|
| `app/api/orders/place/route.ts` | `.from("ledger_entries")` | SELECT (?”ì•¡ ê³„ì‚°) | ?ˆì „ |
| `app/api/wallet/ledger/route.ts` | `.from('ledger_entries')` | SELECT | ?ˆì „ |
| `app/admin/orders/[order_id]/page.tsx` | `.from('ledger_entries')` | SELECT | ?ˆì „ |
| `e2e/e2e-payment-flow.spec.ts` | `.from('ledger_entries')` | SELECT (?ŒìŠ¤?? | ?ˆì „ |
| `scripts/e2e-payment-flow.mjs` | `.from('ledger_entries')` | SELECT (?ŒìŠ¤?? | ?ˆì „ |
| `lib/supabase/types.ts` | `ledger_entries` | ?€???•ì˜ | - |

### 1.2 ledger_entries INSERT/UPDATE/DELETE (??ì½”ë“œ)

| ?Œì¼ | ?íƒœ |
|------|------|
| (?†ìŒ) | **ì§ì ‘ INSERT/UPDATE/DELETE ?œê±° ?„ë£Œ** |

### 1.3 service_role / createAdminClient ?¬ìš©

| ?Œì¼ | ?©ë„ |
|------|------|
| `lib/supabase/admin.ts` | supabaseAdmin ?ì„± |
| `utils/supabase/server.ts` | createAdminClient() |
| `app/api/orders/place/route.ts` | orders INSERT |
| `app/api/payments/confirm/route.ts` | rpc_confirm_payment, rpc_finalize_order, payments INSERT |
| `app/api/admin/audit/route.ts` | admin_audit_logs INSERT |
| `app/api/admin/kpi/join-to-buy/route.ts` | KPI ì¡°íšŒ |
| `app/api/chat/route.ts` | SERVICE_KEY (ì±„íŒ…) |
| `app/api/market/tick/route.ts` | SERVICE_KEY (?œì„¸) |
| `e2e/e2e-payment-flow.spec.ts` | ?ŒìŠ¤?¸ìš© ledger ì¡°íšŒ |
| `scripts/e2e-payment-flow.mjs` | ?ŒìŠ¤?¸ìš© ledger ì¡°íšŒ |
| `scripts/reset-test-password.mjs` | ?ŒìŠ¤??ë¹„ë?ë²ˆí˜¸ ë¦¬ì…‹ |

---

## 2. ?˜ì •???Œì¼ ?µì½”

### 2.1 ? ê·œ: `supabase/migrations/20260225_rpc_post_ledger_for_order.sql`

```sql
-- ledger_entries INSERT ?„ìš© RPC (place route ?±ì—???¬ìš©)
-- SECURITY DEFINERë¡?service_role ?†ì´ ?¸ì¶œ ê°€??

CREATE OR REPLACE FUNCTION public.rpc_post_ledger_for_order(
  p_order_id uuid,
  p_user_id uuid,
  p_amount_krw numeric,
  p_product_id uuid DEFAULT NULL,
  p_quantity numeric DEFAULT 1
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'FORBIDDEN: ë³¸ì¸ ì£¼ë¬¸ë§??ì¥ ë°˜ì˜ ê°€??;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM orders o
    WHERE o.id = p_order_id AND o.user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'ORDER_NOT_FOUND_OR_FORBIDDEN';
  END IF;

  IF EXISTS (SELECT 1 FROM ledger_entries WHERE order_id = p_order_id AND entry_type = 'CASH_DEBIT') THEN
    RETURN jsonb_build_object('ok', true, 'idempotent', true);
  END IF;

  INSERT INTO ledger_entries (user_id, order_id, entry_type, currency, amount, asset_id, quantity, memo, metadata)
  VALUES (p_user_id, p_order_id, 'CASH_DEBIT', 'KRW', (p_amount_krw * -1), NULL, 0, 'PRODUCT_PURCHASE', '{}'::jsonb);

  IF p_product_id IS NOT NULL AND p_quantity > 0 THEN
    INSERT INTO ledger_entries (user_id, order_id, entry_type, currency, amount, asset_id, quantity, memo, metadata)
    VALUES (p_user_id, p_order_id, 'ASSET_CREDIT', 'KRW', 0, p_product_id, p_quantity, 'PRODUCT_PURCHASE', '{}'::jsonb);
  END IF;

  RETURN jsonb_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_post_ledger_for_order(uuid, uuid, numeric, uuid, numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_post_ledger_for_order(uuid, uuid, numeric, uuid, numeric) TO service_role;
```

### 2.2 ?˜ì •: `app/api/orders/place/route.ts`

```typescript
// ë³€ê²??? admin.from("ledger_entries").insert(ledgerPayload)
// ë³€ê²??? supabase.rpc("rpc_post_ledger_for_order", {...})

    const { error: ledgerError } = await supabase.rpc("rpc_post_ledger_for_order", {
      p_order_id: order.id,
      p_user_id: user.id,
      p_amount_krw: amountPositive,
      p_product_id: product_id.trim(),
      p_quantity: 1,
    });

    if (ledgerError) {
      return NextResponse.json(
        { error: "LEDGER_INSERT_FAILED", debug: ledgerError.message },
        { status: 500 }
      );
    }
```

---

## 3. ìµœì¢… êµ¬ì¡° ?¤ì´?´ê·¸??

```
?Œâ??€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€??
??ledger_entries INSERT ê²½ë¡œ (?¤ì§ ?„ë˜ 3ê°€ì§€)                                      ??
?”â??€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€??

[1] PG ê²°ì œ ?Œë¡œ??(payments/confirm)
    PG ì½œë°± ??POST /api/payments/confirm
      ??supabaseAdmin (service_role)
      ??rpc_confirm_payment (PAID)
      ??rpc_finalize_order (COMPLETED + ledger 2ê±?INSERT)
        ??SECURITY DEFINER, service_role ?¸ì¶œ

[2] place ?Œë¡œ??(?”ì•¡ ê²°ì œ)
    POST /api/orders/place
      ??createClient (authenticated) ??ledger SELECT (?”ì•¡ ?•ì¸)
      ??createAdminClient ??orders INSERT
      ??createClient.rpc("rpc_post_ledger_for_order") ??ledger 2ê±?INSERT
        ??SECURITY DEFINER, auth.uid() ê²€ì¦?

[3] rpc_invest (?ˆê±°??ëª¨ë°”??
    MobileProductDetail ??supabase.rpc("rpc_invest", { p_product_id })
      ??SECURITY DEFINER RPC
      ??orders INSERT + ledger 2ê±?INSERT (?´ë?)

?Œâ??€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€??
??ledger_entries SELECT ê²½ë¡œ (RLS ?ìš©)                                             ??
?”â??€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€??

[ì¡°íšŒ] GET /api/wallet/ledger ??createClient().from('ledger_entries').select() ??RLS
[ì¡°íšŒ] admin/orders/[id] ??createClient().from('ledger_entries').select() ??RLS (admin policy)
[ì¡°íšŒ] place route ??createClient().from('ledger_entries').select() ???”ì•¡ ê³„ì‚°

?Œâ??€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€??
??ledger_entries INSERT/UPDATE/DELETE ì§ì ‘ ?‘ê·¼                                     ??
?”â??€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€??

[ê¸ˆì?] .from('ledger_entries').insert/update/delete ????ì½”ë“œ?ì„œ 0ê±?
[ê¶Œí•œ] 20260222_ledger_entries_immutability.sql: anon, authenticated??INSERT/UPDATE/DELETE REVOKE
```

---

## 4. service_role ?¬ìš© ìµœì†Œ???ê?

| ?Œì¼ | ?„ìš” ?¬ë? | ë¹„ê³  |
|------|-----------|------|
| `app/api/orders/place/route.ts` | ?„ìš” | orders INSERT (RLS ?°íšŒ) |
| `app/api/payments/confirm/route.ts` | ?„ìš” | PG ì½œë°±, payments, orders, RPC ?¸ì¶œ |
| `app/api/admin/audit/route.ts` | ?„ìš” | admin_audit_logs INSERT |
| `app/api/admin/kpi/join-to-buy/route.ts` | ê²€??| KPI ì¡°íšŒë§Œì´ë©?anon/authenticated ê°€?¥í•  ???ˆìŒ |
| `app/api/chat/route.ts` | ê²€??| ì±„íŒ…??- ?„ìš” ??? ì? |
| `app/api/market/tick/route.ts` | ê²€??| ?œì„¸??- ?„ìš” ??? ì? |
| `e2e/*`, `scripts/*` | ?ŒìŠ¤??| ?œë²„/ë¡œì»¬ ?„ìš©, ?¸ì¶œ ì£¼ì˜ |

**?„í—˜ ?¨í„´**: ?†ìŒ. ledger_entries ì§ì ‘ INSERT??ëª¨ë‘ ?œê±°??

---

## 5. ?„ë£Œ ì²´í¬ë¦¬ìŠ¤??(8ê°?

- [x] 1. `ledger_entries` ì§ì ‘ INSERT/UPDATE/DELETE ??ì½”ë“œ ê²€????0ê±?
- [x] 2. `rpc_post_ledger_for_order` RPC ?ì„± (SECURITY DEFINER, ë©±ë“±, auth ê²€ì¦?
- [x] 3. `app/api/orders/place/route.ts` ledger INSERT ??RPC ?¸ì¶œë¡?êµì²´
- [x] 4. ledger SELECTë§??¬ìš©?˜ëŠ” ê³??•ì¸ (wallet/ledger, admin/orders, place ?”ì•¡)
- [x] 5. service_role ?¬ìš© ?„ì¹˜ ëª©ë¡??ë°?ê²€??
- [x] 6. ìµœì¢… êµ¬ì¡° ?¤ì´?´ê·¸???‘ì„±
- [x] 7. ?˜ì • ?Œì¼ ?µì½” ?°ì¶œ
- [x] 8. 20260222_ledger_entries_immutability.sql ê¸°ë°˜ ê¶Œí•œ ?•ì±… ? ì? (anon/authenticated INSERT/UPDATE/DELETE REVOKE)

---

## 6. ì¶”ê? ì°¸ê³ 

- **rpc_invest**: `supabase/rpc/rpc_invest.sql` - SECURITY DEFINER, ledger INSERT ?´ë?. ?´ë¼?´ì–¸?¸ì—???¸ì¶œ. migration??ë¯¸í¬????ë³„ë„ ?ìš© ?„ìš”.
- **rpc_finalize_order**: `supabase/migrations/20260224_settlement_update_guard.sql` ??- SECURITY DEFINER, ledger INSERT. payments/confirm?ì„œë§??¸ì¶œ.
