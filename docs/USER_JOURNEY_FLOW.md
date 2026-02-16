# HANBANG User Journey Flow

> ? ì? + ë§ˆì´?˜ì´ì§€ + ?ë§¤??+ ê´€ë¦¬ì ?„ì²´ ?ë¦„ (Mermaid)

---

## 1) ?„ì²´ ?Œë¡œ?°ì°¨??

```mermaid
flowchart TD
  %% =========================
  %% INVESTOR / USER JOURNEY
  %% =========================
  A[? ì…: ê´‘ê³ /ê²€??ê³µìœ ë§í¬] --> B[ë©”ì¸/?œë”©\n?·í”Œë¦?Š¤ ?ˆì¼ + ? ìŠ¤ ??
  B --> C{ë¡œê·¸???íƒœ?}
  C -- ?„ë‹ˆ??--> L[/login ?ëŠ” LoginModal]
  L --> L1[?´ë©”???Œì…œ OAuth]
  L1 --> C

  C -- ??--> O{ì²?ë°©ë¬¸/?¨ë³´???„ë£Œ?}
  O -- ?„ë‹ˆ??--> OB[ì±„ë„?‰ê? ?¨ë³´??nì±„ë„?‰ê? ?¨ë³´??
  OB --> OB1[ì·¨í–¥ë²¡í„° ?ì„±\ntaste_score ??
  OB1 --> R[ê°œì¸???ˆì¼/ì¶”ì²œ]
  O -- ??--> R

  R --> S[?ìƒ‰\n?ˆì¼/ì¹´í…Œê³ ë¦¬/ê²€??
  S --> D[?í’ˆ ?ì„¸\n?¤ëª…/ì§€??ë¦¬ìŠ¤??CTA]
  D --> T[ê±°ë˜ ?”ë©´ ?…ë¹„?¸í˜•\n?¤ë”/ì°¨íŠ¸/?¸ê?/ì£¼ë¬¸?¨ë„/?¤í‹°??
  T --> X{ë§¤ìˆ˜/ë§¤ë„?}
  X -- ?„ë‹ˆ??--> S
  X -- ??--> U[ì£¼ë¬¸ ?…ë ¥\nì§€?•ê?/?œì¥ê°€/?˜ëŸ‰]
  U --> U1[ì£¼ë¬¸ ?ì„±\norders: created]

  U1 --> P{KRW ê²°ì œ ?„ìš”?}
  P -- ??--> K[PG ê²°ì œ KCP\n?ëŠ” /api/payment/stub]
  K --> K1[?œë²„ ê²€ì¦?nrpc_confirm_payment]
  K1 --> Z[?íƒœ ?„ì´\npaid ??completed]
  P -- ?„ë‹ˆ??--> Z

  Z --> G[?ì¥ ?ë™ê¸°ë¡\nCASH_DEBIT + ASSET_CREDIT]
  G --> H[/order/success\nì£¼ë¬¸ID/?íƒœ]
  H --> MY[ë§ˆì´?˜ì´ì§€]
  H --> W[/wallet]

  %% =========================
  %% MY PAGE
  %% =========================
  subgraph MYPAGE[ë§ˆì´?˜ì´ì§€ ?¬ì???ˆë¸Œ]
    MY --> MY1[???ì‚° ?”ì•½\nKRW ?”ê³ /?‰ê??ìµ/ë³´ìœ ?˜ìµê¶?
    MY --> MY2[ë³´ìœ  ?ì‚°\n?í’ˆë³??˜ëŸ‰/?‰ë‹¨/?‰ê?]
    MY --> MY3[ì£¼ë¬¸ ?´ì—­\npending/paid/completed]
    MY --> MY4[?ì¥ ?´ì—­\nledger_entries]
    MY --> MY5[?…ê¸ˆ/ì¶œê¸ˆ\n?íƒœ/ì£¼ì˜/?˜ìˆ˜ë£?
    MY --> MY6[ê´€?¬ëª©ë¡??Œë¦¼]
    MY --> MY7[?„ë¡œ??ë³´ì•ˆ/?¤ì •]
  end

  %% =========================
  %% WALLET
  %% =========================
  W --> WD[ì§€ê°??ì„¸\n?”ê³ /?ì¥/?…ì¶œê¸?CTA]
  WD --> T

  %% =========================
  %% SELLER JOURNEY
  %% =========================
  subgraph SELLER[?ë§¤???¬ë¦¬?ì´??
    S0[/creator/dashboard] --> S1[?í’ˆ ?±ë¡/ì¶œí’ˆ\n/creator/register]
    S1 --> S2[?í’ˆ ê´€ë¦?n?íƒœ/?¸ì¶œ/?˜ì •]
    S2 --> S3[?ë§¤/ì£¼ë¬¸ ?„í™©]
    S3 --> S4[?•ì‚° ?´ì—­/?•ì‚° ?íƒœ\nseller_settlement_daily/monthly]
    S4 --> S5[?•ì‚° ?”ì²­/?•ë³´]
  end

  %% =========================
  %% ADMIN / SETTLEMENT
  %% =========================
  subgraph ADMIN[ê´€ë¦¬ì ì£¼ë¬¸Â·?•ì‚°Â·ê°ì‚¬]
    A0[/admin] --> A1[ì£¼ë¬¸ ê´€ë¦?n/admin/orders/order_id]
    A0 --> A2[?•ì‚° ê´€ë¦?n/admin/settlement]
    A2 --> A3[?•ì‚° ë°°ì¹˜ ?ì„±/ì¡°íšŒ]
    A3 --> A4[?•ì‚° ?•ì • RPC\nrpc_admin_confirm_settlement]
    A4 --> A5[orders.status = settled]
    A5 --> A6[ledger_posted_at ê¸°ë¡]
    A6 --> A7[ê°ì‚¬ë¡œê·¸ admin_audit_logs]
    A7 --> A8[?¬ìˆ˜??ë¶ˆê?]
    A0 --> A9[?í’ˆ/?ë§¤???¬ì‚¬]
  end
```

---

## 2) ?¤ì œ ?¼ìš°??ë§¤í•‘

| ?Œë¡œ???¸ë“œ | ?¤ì œ ?¼ìš°??| ?Œì¼ |
|-------------|-------------|------|
| ë©”ì¸/?œë”© | `/` | `app/page.tsx` |
| ë¡œê·¸??| `/login` | `app/login/page.tsx` |
| ?¨ë³´??| `/onboarding` | `app/onboarding/page.tsx` |
| ê±°ë˜ ?ì„¸ | `/market/[id]` | `app/market/[id]/page.tsx` |
| ì£¼ë¬¸ ?ì„± | POST `/api/orders/place` | `app/api/orders/place/route.ts` |
| ê²°ì œ ?¤í… | POST `/api/payment/stub` | `app/api/payment/stub/route.ts` |
| PG ?¹í›… | POST `/api/webhook/payment` | `app/api/webhook/payment/route.ts` |
| ì£¼ë¬¸ ?±ê³µ | `/order/success?order_id=` | `app/order/success/page.tsx` |
| ì§€ê°?| `/wallet` | `app/wallet/page.tsx` |
| ë§ˆì´?˜ì´ì§€ | `/mypage` | `app/mypage/page.tsx` |
| ?ë§¤???€??| `/creator/dashboard` | `app/creator/dashboard/page.tsx` |
| ê´€ë¦¬ì ?•ì‚° | `/admin/settlement` | `app/admin/settlement/page.tsx` |
| ê´€ë¦¬ì ì£¼ë¬¸ | `/admin/orders/[order_id]` | `app/admin/orders/[order_id]/page.tsx` |

---

## 3) ?°ì´???ŒìŠ¤ ?°ê²°

| ?”ë©´ | ?°ì´???ŒìŠ¤ | API/?Œì´ë¸?|
|------|-------------|------------|
| ë©”ì¸ ?ˆì¼ | `content_items`, `v_content_metrics_7d` | `/api/home/rails` |
| ì£¼ë¬¸ | `orders` | `rpc_place_order`, `rpc_confirm_payment` |
| ?ì¥ | `ledger_entries` | `/api/wallet/ledger`, `tg_post_ledger_on_order_completed` |
| ë§ˆì´?˜ì´ì§€ | **ë¯¸ì—°ê²?* | `MyAssetSummary` ???˜ë“œì½”ë”© |
| ê´€ë¦¬ì ?•ì‚° | `settlement_batches` | `rpc_admin_confirm_settlement` |
| ?ë§¤???•ì‚° | `seller_settlement_daily/monthly` | ë·?(RLS ?•ì±…) |
