# HANBANG ?Œë«???„ë¡œ?íŠ¸ ?íƒœ ë¦¬í¬??

> ?¸ë? ?‘ì—…???„ë‹¬???”ì•½ (2025.02 ê¸°ì?)

---

## 1) ì£¼ìš” ?˜ì´ì§€ ?¼ìš°??(app/*)

### ê³µìš©
- `/` ??`app/page.tsx` (??
- `/login` ??`app/login/page.tsx`
- `/signup` ??`app/signup/page.tsx`
- `/market` ??`app/market/page.tsx` (ë§ˆì¼“ ëª©ë¡)
- `/market/[id]` ??`app/market/[id]/page.tsx` (ë§ˆì¼“ ?ì„¸, ì²?•½/ë§¤ìˆ˜)
- `/wallet` ??`app/wallet/page.tsx`
- `/wallet/deposit`, `/wallet/withdraw`, `/wallet/swap` ???…ì¶œê¸??¤ì™‘
- `/mypage` ??`app/mypage/page.tsx`
- `/order/success` ??`app/order/success/page.tsx` (ê²°ì œ ?„ë£Œ)
- `/order/pay` ??`app/order/pay/page.tsx` (?ŒìŠ¤??ê²°ì œ ?œë??ˆì´??
- `/order/return` ??`app/order/return/page.tsx` (KCP ê²°ì œ ??ë¦¬í„´)

### ?¬ì/?„ë¡œ?íŠ¸
- `/invest`, `/invest/[id]`, `/invest/list`, `/invest/product/[id]`
- `/projects/[id]`, `/projects/[id]/invest`
- `/active-invest`, `/active-invest/[id]`

### ê¸°í?
- `/interest/[id]`, `/creator/dashboard`, `/creator/register`, `/settings`, `/notice`, `/onboarding`, `/ranking`, `/closing-soon`, `/lobby`, `/demo`

### ê´€ë¦¬ì (admin)
- `/admin` ??ë¦¬í¬???€?œë³´????`app/admin/page.tsx`
- `/admin/login` ??`app/admin/login/page.tsx`
- `/admin/users` ??? ì? ê´€ë¦???`app/admin/users/page.tsx`
- `/admin/content` ???‘í’ˆ ?¹ì¸/ê°•ì œ?? œ ??`app/admin/content/page.tsx`
- `/admin/orders` ??ì£¼ë¬¸/ê²°ì œ ?•ì¸ ??`app/admin/orders/page.tsx`
- `/admin/orders/[order_id]` ??ì£¼ë¬¸ ?ì„¸ ??`app/admin/orders/[order_id]/page.tsx`
- `/admin/settlement` ???•ì‚° ëª©ë¡ ??`app/admin/settlement/page.tsx`
- `/admin/settlement/[id]` ???•ì‚° ?•ì • ??`app/admin/settlement/[id]/page.tsx`
- `/admin/chat/moderation` ??ì±„íŒ… ëª¨ë”?ˆì´????`app/admin/chat/moderation/page.tsx`
- `/admin/reports` ??? ê³  ì²˜ë¦¬ ??`app/admin/reports/page.tsx`
- `/admin/kpc` ??KPC ?¬ì¸??ì§€ê¸???`app/admin/kpc/page.tsx`
- `/admin/notice` ??ê³µì??¬í•­ ??`app/admin/notice/page.tsx`
- `/admin/settings`, `/admin/settings/admins` ???¤ì •
- `/admin/funnel`, `/admin/home-config`, `/admin/rail-config`, `/admin/projects` ???´ì˜ ?¤ì •

---

## 2) ?¸ì¦/?¸ì…˜ êµ¬ì¡°

### ?¬ìš©???¸ì¦ (ë©”ì¸ ??
- **Provider**: `components/auth/AuthProvider.tsx` ??`app/providers.tsx`?ì„œ ?˜í•‘
- **API**: `useAuth()` ??`user`, `session`, `loading`, `signOut`, `openLoginModal`, `closeLoginModal`
- **ë¡œê·¸?„ì›ƒ**: `components/auth/AuthProvider.tsx` ??`signOut()` ??Supabase `signOut()` ??`/`ë¡??´ë™
- **?¸ì…˜**: Supabase Auth ê¸°ë°˜, `supabase.auth.getSession()`, `onAuthStateChange`

### ê´€ë¦¬ì ?¸ì¦
- **Provider**: `context/AuthContext.tsx` ??`app/admin/layout.tsx` ?´ë??ì„œë§??¬ìš©
- **API**: `useAuth()` ??`adminUser`, `isAuthenticated`, `login`, `logout`, `hasPermission`
- **ë¡œê·¸?„ì›ƒ**: `context/AuthContext.tsx` ??`localStorage.removeItem("admin_auth")` ??`/` ?´ë™
- **?¸ì¦ ë°©ì‹**: MASTER_ACCOUNT ?˜ë“œì½”ë”© + localStorage (`chanjeon5327@gmail.com`)

---

## 3) ê²°ì œ/ì£¼ë¬¸/?ì¥ ?Œë¡œ??

### RPC ëª©ë¡
| RPC | ??•  | ?¸ì¶œ ê²½ë¡œ |
|-----|------|-----------|
| `rpc_place_order` | ì£¼ë¬¸ ?ì„±, status=PENDING | `app/api/orders/place/route.ts` |
| `rpc_confirm_payment` | PENDING ??PAID | `app/api/payments/confirm/route.ts`, `app/api/payment/stub/route.ts`, `app/api/webhook/payment/route.ts` |
| `rpc_finalize_order` | PAID ??COMPLETED, ?ì¥ ë°˜ì˜ | `app/api/payments/confirm/route.ts` |
| `rpc_admin_confirm_settlement` | ?•ì‚° ë°°ì¹˜ ?•ì • | `app/admin/settlement/[id]/page.tsx` (migration ë¯¸í™•?? |
| `rpc_increment_content_metric` | content ì§€??ì¦ê? | `app/api/funnel/join/route.ts`, `app/api/metrics/event/route.ts` |
| `rpc_invest` | ëª¨ë°”???¬ì (?ˆê±°?? | `components/mobile/MobileProductDetail.tsx` |
| `transition_order_status` | DB ?„ì´ ê·œì¹™ ê²€ì¦?| migration ???•ì˜, ?±ì—??ì§ì ‘ ?¸ì¶œ?€ ?œë¬¾ |

### orders.status ?„ì´
```
PENDING ??PAID (rpc_confirm_payment)
PAID ??COMPLETED (rpc_finalize_order, ?ì¥ ë°˜ì˜)
PENDING ??CANCELLED
PAID ??REFUNDED (ê´€ë¦¬ì ?˜ë¶ˆ)
COMPLETED ??SETTLED, REFUNDED
```

### payments ?Œì´ë¸?
- **ê²½ë¡œ**: `supabase/migrations/20260213_payment_flow_standard.sql`
- **ì»¬ëŸ¼**: `id`, `order_id`, `pg_transaction_id` (UNIQUE), `status` (payment_status), `amount`, `created_at`

### refunds ?Œì´ë¸?
- **ê²½ë¡œ**: ?™ì¼ migration
- **ì»¬ëŸ¼**: `id`, `order_id`, `status` (refund_status), `amount`, `created_at`

### ledger_entries
- ë©±ë“±: `idx_ledger_order_entry` on `(order_id, entry_type)`

---

## 4) ì±„íŒ…/?Œë¦¼

### ì±„íŒ…
- **ì»´í¬?ŒíŠ¸**: `components/market/MarketChatSection.tsx` ??ë§ˆì¼“ ?ì„¸??ë°°ì¹˜
- **API**: `app/api/chat/route.ts` ??GET/POST, `chat_messages_v2` ?Œì´ë¸??¬ìš©
- **DB**: `chat_messages_v2` (room_key, sender, text) ??êµ¬í˜„?? `market_chat_messages` ?¤ê³„??`docs/schema/chat_and_notifications.sql`?ë§Œ ì¡´ì¬

### ?Œë¦¼
- **ì»´í¬?ŒíŠ¸**: `components/notifications/NotificationBell.tsx` ???¤ë”??ë°°ì¹˜
- **DB**: `docs/schema/chat_and_notifications.sql` ?¤ê³„ë§?(notifications ?Œì´ë¸?, `supabase/schema.sql`??notifications ì¡´ì¬ ??ë¶€ë¶?êµ¬í˜„
- **?„ì¬**: MOCK_NOTIFICATIONS ?”ë? ?°ì´???¬ìš©, `GET /api/notifications` ë¯¸êµ¬??

---

## 5) ê´€ë¦¬ì

### ì£¼ìš” ?˜ì´ì§€
- `app/admin/layout.tsx` ??ì¢Œì¸¡ ?¬ì´?œë°”, RBAC ë©”ë‰´, ?ë‹¨ ê´€ë¦¬ì ?œì‹œ
- ?€?œë³´?? ? ì?, ?‘í’ˆ?¹ì¸, ì£¼ë¬¸, ?•ì‚°, ì±„íŒ…ëª¨ë”?ˆì´?? ? ê³ , KPC, ê³µì?, ?¤ì •

### ê°ì‚¬ ë¡œê·¸
- **?Œì´ë¸?*: `admin_audit_logs` ??`supabase/migrations/20260212_admin_audit_logs.sql`
- **API**: POST `app/api/admin/audit/route.ts` ??`lib/admin/auditLog.ts`??`logAdminAction()` ?¸ì¶œ
- **ê¸°ë¡ ?„ì¹˜**:
  - `app/admin/content/page.tsx` ??CONTENT_APPROVE, CONTENT_REJECT, CONTENT_FORCE_DELETE
  - `app/admin/settlement/[id]/page.tsx` ??SETTLEMENT_CONFIRM
  - `app/admin/chat/moderation/page.tsx` ??CHAT_DELETE, CHAT_USER_SUSPEND
  - `app/admin/reports/page.tsx` ??REPORT_RESOLVE
  - `app/admin/kpc/page.tsx` ??KPC_GRANT
  - `app/admin/notice/page.tsx` ??NOTICE_CREATE

---

## 6) TODO (ë¯¸ì™„, ?°ì¹­ ê¸°ì?)

1. **rpc_admin_confirm_settlement** ??migration ë¯¸í™•?? ?•ì‚° ?•ì • RPC ì¡´ì¬ ?¬ë? ?•ì¸ ?„ìš”
2. **settlement_batches** ???Œì´ë¸?ë·??¤í‚¤ë§??•ì¸ ë°?migration ë³´ê°•
3. **market id ??product id ë§¤í•‘** ??`market/[id]`??idê°€ content_items?¸ì? products?¸ì? ëª…í™•?? rpc_place_order(product_id) ?°ë™ ê²€ì¦?
4. **KCP ?¤ì œ ?°ë™** ??`KCP_TEST_MODE=false` ??ê²°ì œì°?URLÂ·?¸ì¦Â·?œëª… ê²€ì¦??„ì„±
5. **ê´€ë¦¬ì ê³„ì •** ??MASTER_ACCOUNT ?˜ë“œì½”ë”© ?œê±°, Supabase Auth ?ëŠ” ë³„ë„ admin ?Œì´ë¸?ê¸°ë°˜ ì²´ê³„ë¡??„í™˜
6. **?Œë¦¼ API** ??`GET /api/notifications` êµ¬í˜„, notifications ?Œì´ë¸”ì? ?°ë™
7. **ì±„íŒ… ? ê³ /ëª¨ë”?ˆì´??DB** ??`market_chat_reports`, `market_chat_messages` ?¤ê³„ ??migration ?ìš©
8. **RBAC users ?Œì´ë¸?* ??profiles??`role`, `status` ì»¬ëŸ¼ migration ë¯¸ì ??
9. **?˜ë¶ˆ ?Œë¡œ??* ??refunds ?Œì´ë¸?êµ¬ì¡°ë§?ì¡´ì¬, RPCÂ·APIÂ·UI ë¯¸êµ¬??
10. **content_items ??products** ??ì²?•½/ë§¤ìˆ˜ ??content_id vs product_id ??•  ?•ë¦¬ ë°?ë§ˆì´ê·¸ë ˆ?´ì…˜

**Dividend Engine:** `scripts/run-dividend-smoke-test.mjs` ??create?’execute?’ledger ê²€ì¦?(ë§ˆì´ê·¸ë ˆ?´ì…˜ 20260316, 20260317 ?ìš© ???¤í–‰)

---

---

*ë¬¸ì„œ ê²½ë¡œ: docs/PROJECT_STATUS_REPORT.md*
