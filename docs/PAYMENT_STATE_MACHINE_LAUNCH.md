# ê²°ì œ-?¬ì ?íƒœë¨¸ì‹  ?°ì¹­ ì¤€ë¹?ë¬¸ì„œ

## 1. ? ê·œ/?˜ì • ?Œì¼ ?µì½”

### ë§ˆì´ê·¸ë ˆ?´ì…˜
| ?Œì¼ | ?¤ëª… |
|------|------|
| `20260216_order_status_machine.sql` | orders.status ENUM 6?¨ê³„ ê³ ì • |
| `20260216_payments_pg_table.sql` | payments ?Œì´ë¸?PG ?€??|
| `20260216_rpc_invest_from_payment.sql` | rpc_invest_and_notify_from_payment |

### API
| ?Œì¼ | ?¤ëª… |
|------|------|
| `app/api/payments/request/route.ts` | POST ê²°ì œ ?”ì²­ ??order+payments ?ì„±, redirect URL |
| `app/api/payments/confirm/route.ts` | GET/POST PG ì½œë°±, ?Œë“œë°•ìŠ¤ ?ë™ ?¹ì¸ |
| `app/api/admin/payments/route.ts` | GET ê´€ë¦¬ì ê²°ì œ ëª©ë¡ |
| `app/api/orders/place/route.ts` | @deprecated ì²˜ë¦¬ |

### ?„ë¡ ??
| ?Œì¼ | ?¤ëª… |
|------|------|
| `app/admin/payments/page.tsx` | ê²°ì œ ëª¨ë‹ˆ?°ë§, ?íƒœ ?„í„°, ?¬ì‹œ??ë²„íŠ¼ |
| `app/admin/layout.tsx` | ê²°ì œ ëª¨ë‹ˆ?°ë§ ë©”ë‰´ ì¶”ê? |

### ë¬¸ì„œ
| ?Œì¼ | ?¤ëª… |
|------|------|
| `docs/ORDER_STATE_MACHINE.md` | ?íƒœ ?„ì´ ?¤ì´?´ê·¸??|
| `docs/PAYMENT_STATE_MACHINE_LAUNCH.md` | ë³?ë¬¸ì„œ |

---

## 2. ë§ˆì´ê·¸ë ˆ?´ì…˜ ?¤í–‰ ?œì„œ

1. `20260216_order_status_machine.sql`
2. `20260216_payments_pg_table.sql`
3. `20260216_rpc_invest_from_payment.sql`

---

## 3. PG ?°ê²° ??ë³€ê²½í•´????ë¶€ë¶?(5ì¤??”ì•½)

1. **getPgRedirectUrl** (`app/api/payments/request/route.ts`): ?¤ì œ PG SDKë¡?ê²°ì œ ?”ì²­ URL ?ì„±
2. **confirm POST** (`app/api/payments/confirm/route.ts`): PG ?¹ì¸ ê²€ì¦?ë¡œì§ ì¶”ê? (sandbox ë¶„ê¸° ?œê±°)
3. **PG_SANDBOX=false**: `.env`?ì„œ `PG_SANDBOX=false`ë¡??¤ì •
4. **PG ì½œë°± URL**: PG ?¬ì— ?±ë¡??confirm URL (`/api/payments/confirm`)
5. **pg_transaction_id**: PG ?¹ì¸ ?‘ë‹µ?ì„œ transaction_id ì¶”ì¶œ ??payments???€??

---

## 4. ?ìš© ê°€???íƒœ ì²´í¬ë¦¬ìŠ¤??(20ê°?

### DB/ë§ˆì´ê·¸ë ˆ?´ì…˜
- [ ] order_status 6?¨ê³„ ENUM ?ìš©
- [ ] payments ?Œì´ë¸?user_id, content_id, pg_provider, approved_at ì¡´ì¬
- [ ] idx_payments_order, idx_payments_user, unique(pg_transaction_id) ì¡´ì¬
- [ ] rpc_invest_and_notify_from_payment ?¨ìˆ˜ ì¡´ì¬

### ê²°ì œ ?Œë¡œ??
- [ ] POST /api/payments/request ??order(PAYMENT_REQUESTED) + payment(INIT) ?ì„±
- [ ] redirect_url ë°˜í™˜ (?Œë“œë°•ìŠ¤ ??/api/payments/confirm?payment_id=...&sandbox=1)
- [ ] GET /api/payments/confirm ???Œë“œë°•ìŠ¤ ???ë™ ?¹ì¸ ??INVEST_CONFIRMED
- [ ] POST /api/payments/confirm ???™ì¼ ì²˜ë¦¬ (PG ì½œë°±??
- [ ] PG_SANDBOX=true ??mock ?¹ì¸ ?™ì‘

### RPC
- [ ] rpc_invest_and_notify_from_payment: PAYMENT_REQUESTED/APPROVED ??INVEST_CONFIRMED
- [ ] advisory lock (pg_advisory_xact_lock) ?ìš©
- [ ] ì¤‘ë³µ ?¤í–‰ ??idempotent return
- [ ] set_config('app.allow_settlement','on') ?¬ìš©

### ê´€ë¦¬ì
- [ ] /admin/payments ?˜ì´ì§€ ?™ì‘
- [ ] ?íƒœ ?„í„° (INIT, PAYMENT_APPROVED ??
- [ ] ?¬ì‹œ??ë²„íŠ¼ (INIT ??confirm API ?¸ì¶œ)
- [ ] GET /api/admin/payments requireAdmin ê²€ì¦?

### ë³´ì•ˆ/?˜ê²½
- [ ] PG_SANDBOX ?˜ê²½ë³€??.env.example ë¬¸ì„œ??
- [ ] /api/orders/place deprecated ì£¼ì„
- [ ] payments RLS: user ë³¸ì¸ë§?SELECT

### ë¬¸ì„œ
- [ ] docs/ORDER_STATE_MACHINE.md ?íƒœ ?„ì´ ?¤ì´?´ê·¸??

### ë§ˆì¼“ ?°ë™ (PG ?°ê²° ??
- [ ] ë§ˆì¼“ ?ì„¸ ?¬ì ë²„íŠ¼ ??POST /api/payments/request ?¸ì¶œ ??redirect_urlë¡??´ë™
