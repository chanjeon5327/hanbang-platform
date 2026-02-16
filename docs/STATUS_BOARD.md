# HANBANG Status Board

> Master Plan ê¸°ì? ?„ë£Œ/ì§„í–‰/ë§‰í˜/?¤ìŒ ?„í™©

---

## 1) ?¤í”„ë¦°íŠ¸ ?„í™©

| ?¤í”„ë¦°íŠ¸ | ?íƒœ | ?„ë£Œ ê¸°ì? | ë¹„ê³  |
|----------|------|----------|------|
| **1) E2E êµ¬ë§¤ ?Œë¡œ??* | ???„ë£Œ | ì£¼ë¬¸?’ê²°?œìŠ¤?â†’ê²€ì¦â†’?ì¥?’ì„±ê³µâ†’ì§€ê°?| place, stub, rpc_confirm_payment, ledger ?¸ë¦¬ê±?|
| **2) ê±°ë˜ ?ì„¸ ?…ë¹„?¸í˜•** | ?”„ ì§„í–‰ | ?¤ë”/ì°¨íŠ¸/?¸ê?/ì£¼ë¬¸?¨ë„/?¤í‹°??| market/[id] ì¡´ì¬, ?¤í‹°??disabled?’í•´???„ë£Œ |
| **3) ë§ˆì´?˜ì´ì§€ ?„ì„±** | ???€ê¸?| ???ì‚°/ì£¼ë¬¸/ë³´ìœ /?ì¥/?¤ì • | ?˜ë“œì½”ë”© ?°ì´?? orders/ledger ë¯¸ì—°ê²?|
| **4) ?ë§¤??ì¶œí’ˆ/?•ì‚°** | ???€ê¸?| ì¶œí’ˆ/?ë§¤?„í™©/?•ì‚° ì¡°íšŒ | creator/dashboard, seller_settlement_* ë·?|
| **5) ê´€ë¦¬ì ?•ì‚°/ê°ì‚¬** | ?”„ ì§„í–‰ | ë°°ì¹˜ ?•ì •/ë¶ˆë?/ê°ì‚¬ë¡œê·¸ | settlement UI ì¡´ì¬, rpc_admin_confirm_settlement ?¸ì¶œ |

---

## 2) ê³„ì¸µë³??¼ë²¨

### ???„ë£Œ (Done)
- E2E êµ¬ë§¤: `/api/orders/place`, `/api/payment/stub`, `/api/webhook/payment` ??`rpc_confirm_payment` ??`tg_post_ledger_on_order_completed`
- ì£¼ë¬¸ ?±ê³µ: `/order/success` (?°ëª¨ ëª¨ë“œ ?¬í•¨)
- ì§€ê°? `/wallet` ? ìŠ¤???…ë¹„?¸í˜• UI, `/api/wallet/ledger` ??ledger_entries
- ë§¤ìˆ˜ ë²„íŠ¼: `disabled={false}` (AB variant C ?œí•œ ?´ì œ)

### ?”„ ì§„í–‰ (In Progress)
- ê±°ë˜ ?ì„¸: `app/market/[id]/page.tsx`, OrderBook, MobileOrderPanel, MobilePriceChart
- ê´€ë¦¬ì ?•ì‚°: `app/admin/settlement`, `rpc_admin_confirm_settlement` (RPC ì¡´ì¬ ?¬ë? ?•ì¸ ?„ìš”)

### ???€ê¸?(Blocked/Pending)
- ë§ˆì´?˜ì´ì§€: `MyAssetSummary`, `MyInvestList`, `MyHistory` ??orders/ledger ë¯¸ì—°ê²?
- ?…ì¶œê¸? `/wallet/deposit`, `/wallet/withdraw` placeholder
- PG KCP ?¤ì œ ?°ë™

### ?š« ë§‰í˜ (Blocked)
- `rpc_admin_confirm_settlement`: migration ë¯¸í™•?? 404 ê°€??
- `admin_audit_logs`: ë¬¸ì„œë§??¸ê¸‰, ?¤í‚¤ë§??†ìŒ
- `settlement_batches`: ë·??Œì´ë¸?ì¡´ì¬ ?¬ë? ?•ì¸ ?„ìš”

---

## 3) ?Œì¼ ê²½ë¡œ ?”ì•½

| êµ¬ë¶„ | ê²½ë¡œ |
|------|------|
| E2E ì£¼ë¬¸ | `app/api/orders/place/route.ts`, `app/api/orders/[id]/route.ts` |
| ê²°ì œ | `app/api/payment/stub/route.ts`, `app/api/webhook/payment/route.ts` |
| ?ì¥ | `app/api/wallet/ledger/route.ts`, `supabase/migrations/202601290539_ledger.sql` |
| ë§ˆì´?˜ì´ì§€ | `app/mypage/page.tsx`, `components/mypage/*` |
| ê´€ë¦¬ì | `app/admin/settlement/*`, `app/admin/orders/[order_id]/page.tsx` |
| ?ë§¤??| `app/creator/dashboard/page.tsx`, `app/creator/register/page.tsx` |

---

## 4) ?¤ìŒ ?¡ì…˜

1. ë§ˆì´?˜ì´ì§€: `MyAssetSummary` / `MyInvestList` / `MyHistory` ??`orders`, `ledger_entries` API ?°ë™
2. ê´€ë¦¬ì: `rpc_admin_confirm_settlement` RPC ì¡´ì¬ ?•ì¸ ë°?migration ë³´ê°•
3. ?•ì‚°: `settlement_batches` ?Œì´ë¸?ë·??¤í‚¤ë§??•ì¸
