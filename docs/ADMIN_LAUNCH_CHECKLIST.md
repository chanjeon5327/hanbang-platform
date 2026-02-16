# ê´€ë¦¬ì ?œìŠ¤???°ì¹­ ë¦¬ìŠ¤???ê? ê²°ê³¼

## ?˜ì •/?ì„± ?Œì¼ ë¦¬ìŠ¤??

| ?Œì¼ | ë³€ê²??´ìš© |
|------|----------|
| `components/auth/AuthProvider.tsx` | ? ì? ?•ì?(SUSPENDED) ??ë¡œê·¸??ì°¨ë‹¨ ???¸ì…˜ ë¡œë“œ ??profiles.status ì²´í¬ ???ë™ ë¡œê·¸?„ì›ƒ |
| `app/api/chat/route.ts` | POST???¸ì¦ + requireActiveUser ì¶”ê? (ì±„íŒ… ?‘ì„± ì°¨ë‹¨) |
| `app/api/payments/request/route.ts` | requireActiveUser ?ìš© (ë§¤ìˆ˜/ê²°ì œ ì°¨ë‹¨) |
| `app/api/orders/place/route.ts` | requireActiveUser ?ìš© (ì£¼ë¬¸ ì°¨ë‹¨) |
| `app/api/admin/kpi/join-to-buy/route.ts` | requireAdmin ì¶”ê? (RBAC API ê²€ì¦? |
| `app/admin/orders/page.tsx` | orders ?¤í‚¤ë§ˆì— ë§ê²Œ total_amount_krw ?¬ìš©, Order ?€???•ë¦¬ |
| `supabase/migrations/20260219_chat_messages_is_deleted.sql` | chat_messages_v2??is_deleted ì»¬ëŸ¼ ì¶”ê? |
| `docs/ADMIN_CHAT_DELETE_POLICY.md` | ì±„íŒ…/ê³µì? ?? œ ?•ì±… ë¬¸ì„œ |
| `docs/ADMIN_LAUNCH_CHECKLIST.md` | ë³?ë¬¸ì„œ |

---

## ì²´í¬ 1~8 ê²°ê³¼

### 1) ê´€ë¦¬ì ë¡œê·¸??ë°©ì‹ ?¨ì¼?????µê³¼
- `context/AuthContext.tsx`: Supabase Auth ê¸°ë°˜ (`getSession`, `profiles.role`, `isAdminEmail`)
- `MASTER_ACCOUNT` / localStorage ?˜ë“œì½”ë”© ?†ìŒ
- `lib/admin/env.ts`: `NEXT_PUBLIC_ADMIN_EMAILS` ?˜ê²½ë³€?˜ë¡œ ê´€ë¦¬ì ?´ë©”??êµ¬ì„±

### 2) RBAC ?ŒìŠ¤ ?¨ì¼?????µê³¼
- `users/profiles` ?Œì´ë¸?`role` ê¸°ë°˜
- `AdminRoute`: ?„ë¡ ???¼ìš°??ë³´í˜¸
- API: `requireAdmin()` ??`app/api/admin/audit`, `app/api/admin/kpi/join-to-buy` ?ìš©

### 3) ê°ì‚¬ë¡œê·¸ ?„ë½ ?„ìˆ˜ ?ê? ???µê³¼
- `/admin/content`: CONTENT_APPROVE, CONTENT_REJECT, CONTENT_FORCE_DELETE
- `/admin/settlement`: ?•ì‚° ?•ì • ??logAdminAction
- `/admin/chat/moderation`: CHAT_DELETE, CHAT_USER_SUSPEND
- `/admin/reports`: REPORT_RESOLVE
- `/admin/kpc`: KPC_GRANT
- `/admin/notice`: NOTICE_CREATE
- `/admin/orders`: ì¡°íšŒë§? ë²„íŠ¼/?¡ì…˜ ?†ìŒ ???„ë½ ?†ìŒ

### 4) service role ?¬ìš© ìµœì†Œ????ë³´ì™„ ?„ë£Œ
- `app/api/admin/audit`: requireAdmin ??service role (ê°ì‚¬ ë¡œê·¸ insert) ???ˆìš©
- `app/api/payments/confirm`: PG ì½œë°±?????ˆìš©
- `app/api/chat`: GET?€ ê³µê°œ, POST???¸ì¦ ??service role ?¬ìš© (RLS ??insert ?„ìš”)
- `app/api/market/tick`: ê°œë°œ???¸ê? ?ì„± ???„ìš” ??ê´€ë¦¬ì ?„ìš© ?¸ì¦ ì¶”ê? ê¶Œì¥
- `app/api/admin/kpi/join-to-buy`: requireAdmin ??supabaseAdmin ???ˆìš©

### 5) ?•ì‚° RPC ?ˆì „?¥ì¹˜ ???µê³¼
- `rpc_admin_confirm_settlement`: settlement_batchesë¡??´ë? ?•ì • ??ok ë°˜í™˜ (idempotent)
- 2ì¤??´ë¦­/?¬í˜¸ì¶?ë°©ì?

### 6) ? ì? ?•ì? ë°˜ì˜ ???µê³¼
- ë¡œê·¸??ì°¨ë‹¨: `AuthProvider`?ì„œ ?¸ì…˜ ë¡œë“œ ??`profiles.status === 'SUSPENDED'`ë©?ì¦‰ì‹œ ë¡œê·¸?„ì›ƒ
- ì±„íŒ… ?‘ì„± ì°¨ë‹¨: `app/api/chat` POST??`requireActiveUser` ?ìš©
- ë§¤ìˆ˜/?¬ì ì°¨ë‹¨: `orders/place`, `payments/request`??`requireActiveUser` ?ìš©

### 7) ?´ì˜??ê³µì?/ì±„íŒ… ?? œ ?•ì±… ??ë³´ì™„ ?„ë£Œ
- `chat_messages_v2`: `is_deleted` ì»¬ëŸ¼ ì¶”ê? (migration 20260219)
- ?? œ ??`UPDATE ... SET is_deleted = true` (?Œí”„???? œ)
- `docs/ADMIN_CHAT_DELETE_POLICY.md`: ?•ì±… ë¬¸ì„œ ?•ë¦¬
- ì±„íŒ… ëª¨ë”?ˆì´???˜ì´ì§€: ?? œ/?•ì? ??`logAdminAction` ?¸ì¶œ

### 8) ê´€ë¦¬ì ?˜ì´ì§€ UX ìµœì†Œ ë§ˆê° ???µê³¼
- ?¬ì´?œë°”: `pathname` ê¸°ë°˜ `isActive` ?˜ì´?¼ì´??
- ?Œì´ë¸? orders ?˜ì´ì§€ limit 50 + total_amount_krw ?œì‹œ
- ?„í—˜ ë²„íŠ¼: ?•ì‚°?•ì •/ê°•ì œ?? œ/?•ì?/?¬ì¸?¸ì?ê¸‰ì— `confirm()` ?¬ìš©

---

## ?°ì¹­ ??ìµœì¢… ?´ì˜ ì²´í¬ë¦¬ìŠ¤??

### ?˜ê²½ë³€??
- [ ] `NEXT_PUBLIC_ADMIN_EMAILS` ?¤ì • (ë¹„ì–´ ?ˆìœ¼ë©?profiles.role='ADMIN'ë§?ê´€ë¦¬ì)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` ?œë²„ ?„ìš©?¼ë¡œë§??¬ìš©

### DB
- [ ] `profiles.role`, `profiles.status` ë§ˆì´ê·¸ë ˆ?´ì…˜ ?ìš©
- [ ] `settlement_batches` ë°?`rpc_admin_confirm_settlement` ?ìš©
- [ ] `chat_messages_v2.is_deleted` ë§ˆì´ê·¸ë ˆ?´ì…˜ ?ìš©

### ?´ì˜
- [ ] ê´€ë¦¬ì ê³„ì • ?ì„±: profiles.role='ADMIN' ?ëŠ” ADMIN_EMAILS ?±ë¡
- [ ] ?•ì? ? ì? ?ŒìŠ¤?? status=SUSPENDED ??ë¡œê·¸??ì±„íŒ…/ì£¼ë¬¸ ì°¨ë‹¨ ?•ì¸
- [ ] ê°ì‚¬ ë¡œê·¸ ?•ì¸: admin_audit_logs ?Œì´ë¸??•ìƒ ê¸°ë¡ ?¬ë?

### ëª¨ë‹ˆ?°ë§
- [ ] ?•ì‚° ?•ì • ì¤‘ë³µ ?¸ì¶œ ë°©ì? ?•ì¸
- [ ] PG ì½œë°± API ë³´ì•ˆ(IP ?”ì´?¸ë¦¬?¤íŠ¸ ?? ê²€??
