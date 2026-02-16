# HANBANG Screens Map

> ?”ë©´ë³?CTA / ?°ì´??/ ?Œì¼ ê²½ë¡œ

---

## 1) ?¬ì??? ì?) ???µì‹¬ ?”ë©´

### ë©”ì¸/?ìƒ‰ (`/`)

| ??ª© | ?´ìš© |
|------|------|
| **?Œì¼** | `app/page.tsx` |
| **?¡ì…˜** | ?ˆì¼ ?¤í¬ë¡? RailCard ?´ë¦­ ??/market/:id, ì§€ê°?ë²„íŠ¼ ??/wallet |
| **?°ì´??* | `/api/home/rails` ?ëŠ” FALLBACK_RAILS |
| **ì»´í¬?ŒíŠ¸** | HomeHero, CurationSection, InterestStrip, BottomNavigation |
| **?„ë£Œ ê¸°ì?** | ?´ë¦­?’ìƒ??ì§„ì… ë¹ ë¦„, ì¶”ì²œ ?´ìœ  ?¸ì¶œ ê°€??|

### ?ì„¸/ê±°ë˜ (`/market/[id]`)

| ??ª© | ?´ìš© |
|------|------|
| **?Œì¼** | `app/market/[id]/page.tsx` |
| **?¡ì…˜** | ë§¤ìˆ˜/ë§¤ë„ ?? ì§€?•ê?/?œì¥ê°€, ?˜ëŸ‰/ë¹„ìœ¨, ì£¼ë¬¸ ?œì¶œ, ê´€?¬í•©ë¥?|
| **?°ì´??* | `lastPrice` ?˜ë“œì½”ë”©, `/api/ab/assign-buy`, `/api/ab/assign-cohort`, `/api/funnel/join` |
| **ì»´í¬?ŒíŠ¸** | MarketHeader, MobilePriceChart, OrderBookSummary, OrderBookPanel, MobileOrderStickyBar, MobileOrderPanel, JoinFunnelButton |
| **?„ë£Œ ê¸°ì?** | ì°¨íŠ¸?’í˜¸ê°€?’ì£¼ë¬??ë¦„ ?Šê¸°ì§€ ?ŠìŒ |

### ê²°ì œ/?±ê³µ (`/order/success`)

| ??ª© | ?´ìš© |
|------|------|
| **?Œì¼** | `app/order/success/page.tsx` |
| **?¡ì…˜** | ì£¼ë¬¸ ?•ë³´ ?•ì¸, ??ì§€ê°?ë³´ê¸° ??/wallet, ?ˆìœ¼ë¡???/ |
| **?°ì´??* | `/api/orders/[id]`, order_id=demo ???°ëª¨ ?°ì´??|
| **?„ë£Œ ê¸°ì?** | ì£¼ë¬¸ ?íƒœ ?„ì´ + ?ì¥ ê¸°ë¡ ?•ì¸ ê°€??|

### ì§€ê°?(`/wallet`)

| ??ª© | ?´ìš© |
|------|------|
| **?Œì¼** | `app/wallet/page.tsx` |
| **?¡ì…˜** | ?…ê¸ˆ ??/wallet/deposit, ì¶œê¸ˆ ??/wallet/withdraw, ë³´ìœ  ?í’ˆ ë§¤ë„ |
| **?°ì´??* | useStore (userCash, holdings, history), `/api/wallet/ledger` |
| **?„ë£Œ ê¸°ì?** | ì´??ì‚°/?ì¥ ?´ì—­ ì¦‰ì‹œ ?œì‹œ |

### ë§ˆì´?˜ì´ì§€ (`/mypage`)

| ??ª© | ?´ìš© |
|------|------|
| **?Œì¼** | `app/mypage/page.tsx` |
| **?¡ì…˜** | ì£¼ë¬¸ ?´ì—­/?•ì‚° ?´ì—­/?…ì¶œê¸?ê¸°ë¡ ë§í¬ (?„ì¬ ?´ë¦­ë§? |
| **?°ì´??* | **?˜ë“œì½”ë”©** ??MyAssetSummary, MyInvestList, MyHistory ëª¨ë‘ ëª©ì—… |
| **ì»´í¬?ŒíŠ¸** | MyPageLayout, MyAssetSummary, MyInvestList, MyHistory |
| **?„ë£Œ ê¸°ì?** | orders/ledger ?°ë™ ??"?´ê? ë­??€ê³? ?ˆì´ ?´ë–»ê²?ë³€?ˆëŠ”ì§€" ?œëˆˆ???´í•´ |

---

## 2) ?ë§¤???¬ë¦¬?ì´??

### ì¶œí’ˆ/?í’ˆê´€ë¦?(`/creator/dashboard`, `/creator/register`)

| ??ª© | ?´ìš© |
|------|------|
| **?Œì¼** | `app/creator/dashboard/page.tsx`, `app/creator/register/page.tsx` |
| **?¡ì…˜** | ???„ë¡œ?íŠ¸ ?±ë¡, ?ì„¸ë³´ê¸°, ?˜ì •?˜ê¸° |
| **?°ì´??* | localStorage `creator_submitted_projects` |
| **?„ë£Œ ê¸°ì?** | ?ë§¤ ?„í™©/?•ì‚° ?ˆì •???•ì¸ ê°€??(seller_settlement_* ë·?ë¯¸ì—°?? |

---

## 3) ê´€ë¦¬ì

### ì£¼ë¬¸ ê´€ë¦?(`/admin/orders/[order_id]`)

| ??ª© | ?´ìš© |
|------|------|
| **?Œì¼** | `app/admin/orders/[order_id]/page.tsx` |
| **?¡ì…˜** | ì£¼ë¬¸ ?ì„¸ ì¡°íšŒ, ledger_entries ?™ë°˜ ?œì‹œ |
| **?°ì´??* | `orders`, `ledger_entries` (Supabase ì§ì ‘) |
| **?„ë£Œ ê¸°ì?** | ì£¼ë¬¸IDë¡?ì¦ë¹™ ì¶”ì¶œ ê°€??|

### ?•ì‚° ê´€ë¦?(`/admin/settlement`, `/admin/settlement/[id]`)

| ??ª© | ?´ìš© |
|------|------|
| **?Œì¼** | `app/admin/settlement/page.tsx`, `app/admin/settlement/[id]/page.tsx` |
| **?¡ì…˜** | ?•ì‚° ë°°ì¹˜ ëª©ë¡, ?ì„¸ ì¡°íšŒ, ?•ì‚° ?•ì • ë²„íŠ¼ |
| **?°ì´??* | `settlement_batches`, `rpc_admin_confirm_settlement` |
| **?„ë£Œ ê¸°ì?** | ?•ì • ???¬ìˆ˜??ë¶ˆê? + ?¤ëƒ…???´ì‹œ + ê°ì‚¬ë¡œê·¸ (admin_audit_logs ë¯¸êµ¬?? |

---

## 4) API ?¼ìš°???”ì•½

| ê²½ë¡œ | ë©”ì„œ??| ??•  |
|------|--------|------|
| `/api/orders/place` | POST | ì£¼ë¬¸ ?ì„± (rpc_place_order) |
| `/api/orders/[id]` | GET | ì£¼ë¬¸ ì¡°íšŒ |
| `/api/payment/stub` | POST | ê²°ì œ ?¤í… (rpc_confirm_payment) |
| `/api/webhook/payment` | POST | PG ì½œë°± (rpc_confirm_payment) |
| `/api/wallet/ledger` | GET | ?ì¥ ì¡°íšŒ (ledger_entries) |
| `/api/home/rails` | GET | ë©”ì¸ ?ˆì¼ (content_items) |
| `/api/funnel/join` | POST | ê´€?¬í•©ë¥?(join_funnel) |
| `/api/ab/assign-buy` | POST | ë§¤ìˆ˜ ë²„íŠ¼ AB (buy_button_exposure) |
| `/api/ab/assign-cohort` | POST | ? ì? ì½”í˜¸??(user_cohort) |
