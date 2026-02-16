# 2???¤í”„ë¦°íŠ¸ ì²´í¬ë¦¬ìŠ¤??

> ê¸°ì? ì»¤ë°‹: `d3f2396` (feat: ledger insert-only ë´‰ì¸ ë°?orders user_id ê¸°ì? ?µì¼)  
> ?‘ì„±?? 2026-02-14

---

## ?“Œ ë©”ì¸ (Home)

| # | ?‘ì—… | ?„ë£Œ ê¸°ì? | ê´€???Œì¼ |
|---|------|----------|-----------|
| 1 | ???ˆì¼ API ?°ë™ | `/api/home/rails` ?‘ë‹µ ê¸°ë°˜ ?ˆì¼ ?Œë”ë§? fallback ?†ì´ ?•ìƒ ?œì‹œ | [app/api/home/rails/route.ts](../app/api/home/rails/route.ts), [app/page.tsx](../app/page.tsx) |
| 2 | ?ì‚° ?”ì•½ ?œì‹œ | ë¡œê·¸????totalAssets, returnRate, holdingsValue ?•í™•???œì‹œ | [components/home/HomeView.tsx](../components/home/HomeView.tsx), [components/home/AssetCard.tsx](../components/home/AssetCard.tsx) |
| 3 | ?˜ë‹¨ ?¤ë¹„ê²Œì´??| ë§ˆì¼“/ë§ˆì´/?????„í™˜ ?•ìƒ ?™ì‘ | [components/home/BottomNavigation.tsx](../components/home/BottomNavigation.tsx) |
| 4 | ê²ŒìŠ¤???ˆì–´ë¡?| ë¹„ë¡œê·¸ì¸ ??CTA(ë¡œê·¸???Œì›ê°€?? ?¸ì¶œ | [components/home/GuestHero.tsx](../components/home/GuestHero.tsx) |
| 5 | ?ë ˆ?´ì…˜/?¸í„°?ˆìŠ¤???¤íŠ¸ë¦?| InterestStrip, CurationSection ?°ì´???°ë™ | [components/home/InterestStrip.tsx](../components/home/InterestStrip.tsx), [components/home/CurationSection.tsx](../components/home/CurationSection.tsx) |

---

## ?“Œ ë¡œê·¸??(Login)

| # | ?‘ì—… | ?„ë£Œ ê¸°ì? | ê´€???Œì¼ |
|---|------|----------|-----------|
| 1 | ?´ë©”??ë¹„ë?ë²ˆí˜¸ ë¡œê·¸??| Supabase signInWithPassword ?±ê³µ ??`/` ë¦¬ë‹¤?´ë ‰??| [app/login/page.tsx](../app/login/page.tsx) |
| 2 | ?¸ì…˜ ? ì? | localStorage ?¸ì…˜ ?ˆì • ê¸°ë¡, ?ˆë¡œê³ ì¹¨ ??? ì? | [utils/supabase/client.ts](../utils/supabase/client.ts), [components/auth/AuthProvider.tsx](../components/auth/AuthProvider.tsx) |
| 3 | ë¡œê·¸??ëª¨ë‹¬ | ëª¨ë‹¬ ?•íƒœ ë¡œê·¸??UI (?„ìš” ?? | [components/auth/LoginModal.tsx](../components/auth/LoginModal.tsx) |
| 4 | Auth ì½œë°± | OAuth ì½œë°± ì²˜ë¦¬ | [app/auth/callback/page.tsx](../app/auth/callback/page.tsx) |
| 5 | ?•ì? ? ì? ì°¨ë‹¨ | profiles.status=SUSPENDED ??ë¡œê·¸??ì°¨ë‹¨ ë°??ë™ ë¡œê·¸?„ì›ƒ | [components/auth/AuthProvider.tsx](../components/auth/AuthProvider.tsx) |

---

## ?“Œ ë§ˆì¼“ (Market)

| # | ?‘ì—… | ?„ë£Œ ê¸°ì? | ê´€???Œì¼ |
|---|------|----------|-----------|
| 1 | ë§ˆì¼“ ëª©ë¡ ?ˆì¼ | recommend/closing/popular/new ???ˆì¼ë³?ì¹´ë“œ ?Œë”ë§?| [app/market/page.tsx](../app/market/page.tsx), [components/market/MarketCard.tsx](../components/market/MarketCard.tsx) |
| 2 | ê²€???„í„° | ê²€?‰ì–´, ì¹´í…Œê³ ë¦¬, ë¦¬ìŠ¤?? ?˜ìµêµ¬ì¡° ?„í„° ?ìš© | [components/market/MarketFilterBar.tsx](../components/market/MarketFilterBar.tsx), [hooks/useDebounce.ts](../hooks/useDebounce.ts) |
| 3 | ê°œì¸???•ë ¬ | usePersonalizedSort ê¸°ë°˜ ì¶”ì²œ ?œì„œ | [hooks/usePersonalizedSort.ts](../hooks/usePersonalizedSort.ts) |
| 4 | ì¹´ë“œ ???ì„¸ ?´ë™ | MarketCard ?´ë¦­ ??`/market/[id]` ?´ë™ | [components/market/MarketCard.tsx](../components/market/MarketCard.tsx) |

---

## ?“Œ ?ì„¸ (Detail)

| # | ?‘ì—… | ?„ë£Œ ê¸°ì? | ê´€???Œì¼ |
|---|------|----------|-----------|
| 1 | ?ì„¸ ?˜ì´ì§€ ?ˆì´?„ì›ƒ | ?¸ë„¤???ìƒ, ?‘í’ˆëª? ê°€ê²? ëª¨ì§‘?•ë³´ ?œì‹œ | [app/market/[id]/page.tsx](../app/market/[id]/page.tsx) |
| 2 | ì²?•½/ë§¤ìˆ˜ ??| TradingPanel?ì„œ ì²?•½/ë§¤ìˆ˜ ?„í™˜, ?˜ëŸ‰ ?…ë ¥ | [components/market/TradingPanel.tsx](../components/market/TradingPanel.tsx) |
| 3 | ëª¨ì§‘ ?•ë³´ (ì²?•½?? | progress, participants, remainingText ?œì‹œ | [components/market/MobilizationInfo.tsx](../components/market/MobilizationInfo.tsx) |
| 4 | ê°€ê²?ì°¨íŠ¸/?¸ê? | PriceChartSection, OrderBookPanel (2ì°¨ê±°?˜í˜•) | [components/market/PriceChartSection.tsx](../components/market/PriceChartSection.tsx), [components/market/OrderBookPanel.tsx](../components/market/OrderBookPanel.tsx) |
| 5 | ?˜ìµ ?•ë³´ | RevenueInfoSection ?Œë”ë§?| [components/market/RevenueInfoSection.tsx](../components/market/RevenueInfoSection.tsx) |
| 6 | ëª¨ë°”???°ìŠ¤?¬íƒ‘ ë¶„ê¸° | ëª¨ë°”???˜ë‹¨ Sticky, ?°ìŠ¤?¬íƒ‘ ?°ì¸¡ ê³ ì • ?¨ë„ | [components/market/MobileOrderPanel.tsx](../components/market/MobileOrderPanel.tsx), [components/market/MobileOrderStickyBar.tsx](../components/market/MobileOrderStickyBar.tsx) |

---

## ?“Œ ì±„íŒ… (Chat)

| # | ?‘ì—… | ?„ë£Œ ê¸°ì? | ê´€???Œì¼ |
|---|------|----------|-----------|
| 1 | ì±„íŒ… UI | MarketChatSection: ë©”ì‹œì§€ ëª©ë¡, ?…ë ¥ì°? ë³¸ì¸ ë©”ì‹œì§€ ?°ì¸¡ ?•ë ¬ | [components/market/MarketChatSection.tsx](../components/market/MarketChatSection.tsx) |
| 2 | ì±„íŒ… API ?°ë™ | GET/POST `/api/chat` room_key ê¸°ë°˜ ë©”ì‹œì§€ ì¡°íšŒ/?„ì†¡ | [app/api/chat/route.ts](../app/api/chat/route.ts) |
| 3 | ë¡œê·¸??? ì?ë§??‘ì„± | ë¹„ë¡œê·¸ì¸ ???½ê¸°ë§? ?…ë ¥ ë¹„í™œ?±í™” | [components/market/MarketChatSection.tsx](../components/market/MarketChatSection.tsx) |
| 4 | ê´€ë¦¬ì ê³µì? ê³ ì • | pinned ë©”ì‹œì§€ ?ë‹¨ ê³ ì • ?œì‹œ | [components/market/MarketChatSection.tsx](../components/market/MarketChatSection.tsx) |
| 5 | ? ê³ /ì°¨ë‹¨ UI | ? ê³ /ì°¨ë‹¨ ë²„íŠ¼, ?•ì¸ ëª¨ë‹¬ | [components/market/MarketChatSection.tsx](../components/market/MarketChatSection.tsx) |
| 6 | ?•ì„¤ ?„í„° | filterProfanity, containsProfanity ?ìš© | [lib/chat/profanityFilter.ts](../lib/chat/profanityFilter.ts) |

---

## ?“Œ ë§ˆì´ (MyPage)

| # | ?‘ì—… | ?„ë£Œ ê¸°ì? | ê´€???Œì¼ |
|---|------|----------|-----------|
| 1 | ë§ˆì´?˜ì´ì§€ ?ˆì´?„ì›ƒ | MyPageLayout ?¤ë” + ë©”ì¸ ?ì—­ | [components/mypage/MyPageLayout.tsx](../components/mypage/MyPageLayout.tsx), [app/mypage/page.tsx](../app/mypage/page.tsx) |
| 2 | ?ì‚° ?”ì•½ | MyAssetSummary: ì´ì?? ë³´ìœ  ?„í™© | [components/mypage/MyAssetSummary.tsx](../components/mypage/MyAssetSummary.tsx) |
| 3 | ?¬ì ëª©ë¡ | MyInvestList: ë³´ìœ  ?˜ìµê¶?ëª©ë¡ | [components/mypage/MyInvestList.tsx](../components/mypage/MyInvestList.tsx) |
| 4 | ê±°ë˜ ?´ì—­ | MyHistory: ì£¼ë¬¸/ê²°ì œ ?´ë ¥ | [components/mypage/MyHistory.tsx](../components/mypage/MyHistory.tsx) |
| 5 | ì§€ê°??°ë™ | ì§€ê°??˜ì´ì§€ ?´ë™ | [app/wallet/page.tsx](../app/wallet/page.tsx), [app/wallet/layout.tsx](../app/wallet/layout.tsx) |

---

## ?“Œ ê´€ë¦¬ì (Admin)

| # | ?‘ì—… | ?„ë£Œ ê¸°ì? | ê´€???Œì¼ |
|---|------|----------|-----------|
| 1 | ê´€ë¦¬ì ?€?œë³´??| KPI(ì´ë§¤ì¶??˜ìˆ˜ë£??œì„±? ì?/ëª¨ì§‘?±ê³µë¥?, ìµœê·¼ ?•ì‚° | [app/admin/page.tsx](../app/admin/page.tsx) |
| 2 | RBAC | requireAdmin, AdminRouteë¡?ë¹„ê?ë¦¬ì ?‘ê·¼ ì°¨ë‹¨ | [lib/admin/requireAdmin.ts](../lib/admin/requireAdmin.ts), [components/AdminRoute.tsx](../components/AdminRoute.tsx) |
| 3 | ì£¼ë¬¸ ê´€ë¦?| orders ëª©ë¡, total_amount_krw ?œì‹œ | [app/admin/orders/page.tsx](../app/admin/orders/page.tsx), [app/admin/orders/[order_id]/page.tsx](../app/admin/orders/[order_id]/page.tsx) |
| 4 | ?•ì‚° | settlement ëª©ë¡, ?ì„¸, ?•ì • | [app/admin/settlement/page.tsx](../app/admin/settlement/page.tsx), [app/admin/settlement/[id]/page.tsx](../app/admin/settlement/[id]/page.tsx) |
| 5 | ì±„íŒ… ëª¨ë”?ˆì´??| ì±„íŒ… ?? œ, ? ì? ?•ì? | [app/admin/chat/moderation/page.tsx](../app/admin/chat/moderation/page.tsx) |
| 6 | ê³µì?/ì½˜í…ì¸?KPC | notice, content, kpc ?˜ì´ì§€ | [app/admin/notice/page.tsx](../app/admin/notice/page.tsx), [app/admin/content/page.tsx](../app/admin/content/page.tsx), [app/admin/kpc/page.tsx](../app/admin/kpc/page.tsx) |
| 7 | ê´€ë¦¬ì ë¡œê·¸??| admin ?„ìš© ë¡œê·¸??| [app/admin/login/page.tsx](../app/admin/login/page.tsx) |

---

## ?“Œ IA (Interest / ì¶”ì²œ)

| # | ?‘ì—… | ?„ë£Œ ê¸°ì? | ê´€???Œì¼ |
|---|------|----------|-----------|
| 1 | ê´€?¬ë„ ?‰ê? API | POST `/api/interest/rate` item_id, score ?€??| [app/api/interest/rate/route.ts](../app/api/interest/rate/route.ts) |
| 2 | ?¨ë³´??ì·¨í–¥ ?Œì•… | InterestRail ?‰ê? ??userTaste ?€??| [app/onboarding/page.tsx](../app/onboarding/page.tsx), [components/interest/InterestRail.tsx](../components/interest/InterestRail.tsx), [stores/userTaste.ts](../stores/userTaste.ts) |
| 3 | Interest ?ì„¸ | `/interest/[id]` SharedThumb, ë¡œê·¸ ?´ë²¤??| [app/interest/[id]/page.tsx](../app/interest/[id]/page.tsx), [components/interest/SharedThumb.tsx](../components/interest/SharedThumb.tsx) |
| 4 | ??ì¶”ì²œ ?°ë™ | user_interest_ratings ê¸°ë°˜ ?ˆì¼ ?•ë ¬ | [hooks/usePersonalizedSort.ts](../hooks/usePersonalizedSort.ts), [app/api/home/rails/route.ts](../app/api/home/rails/route.ts) |
| 5 | Interest ì¹´ë“œ/?„ë¦¬ë·?| InterestCard, InterestPreview ì»´í¬?ŒíŠ¸ | [components/interest/InterestCard.tsx](../components/interest/InterestCard.tsx), [components/interest/InterestPreview.tsx](../components/interest/InterestPreview.tsx) |

---

## ?“Œ ?¨ë³´??(Onboarding)

| # | ?‘ì—… | ?„ë£Œ ê¸°ì? | ê´€???Œì¼ |
|---|------|----------|-----------|
| 1 | ?¨ë³´???˜ì´ì§€ | ?¨ê³„???¤í…??+ ì·¨í–¥ ?‰ê? ?ˆì¼ | [app/onboarding/page.tsx](../app/onboarding/page.tsx) |
| 2 | InterestRail ?‰ê? | ì½˜í…ì¸ ë³„ ?ìˆ˜ ?…ë ¥, userTaste ë°˜ì˜ | [components/interest/InterestRail.tsx](../components/interest/InterestRail.tsx) |
| 3 | ???´ë™ CTA | ?‰ê? ?„ë£Œ ???ˆìœ¼ë¡??´ë™ | [app/onboarding/page.tsx](../app/onboarding/page.tsx) |

---

## ?“Œ PG ë¼ˆë? (ê²°ì œ)

| # | ?‘ì—… | ?„ë£Œ ê¸°ì? | ê´€???Œì¼ |
|---|------|----------|-----------|
| 1 | ê²°ì œ ?”ì²­ API | order_id ê²€ì¦? PENDING ?•ì¸, redirect_url ë°˜í™˜ | [app/api/payments/request/route.ts](../app/api/payments/request/route.ts) |
| 2 | ê²°ì œ ?•ì • API | pg_transaction_id, order_id ?˜ì‹ , rpc_confirm_payment ??rpc_finalize_order | [app/api/payments/confirm/route.ts](../app/api/payments/confirm/route.ts) |
| 3 | ê²°ì œ ?ŒìŠ¤???˜ì´ì§€ | KCP ?ŒìŠ¤??ëª¨ë“œ: `/order/pay` ?œë??ˆì´??| [app/order/pay/page.tsx](../app/order/pay/page.tsx) |
| 4 | ê²°ì œ ë¦¬í„´ ?˜ì´ì§€ | KCP ë¦¬ë‹¤?´ë ‰????confirm ?¸ì¶œ ??success ?´ë™ | [app/order/return/page.tsx](../app/order/return/page.tsx) |
| 5 | ê²°ì œ ?±ê³µ ?˜ì´ì§€ | order_id ê¸°ë°˜ ?±ê³µ ?”ë©´ | [app/order/success/page.tsx](../app/order/success/page.tsx) |
| 6 | ì£¼ë¬¸ ?ì„± | place order ??order_id ë°˜í™˜ | [app/api/orders/place/route.ts](../app/api/orders/place/route.ts) |
| 7 | ?¹í›… (? íƒ) | PG ?¹í›… ì²˜ë¦¬ | [app/api/webhook/payment/route.ts](../app/api/webhook/payment/route.ts) |

---

## ?“‹ ?”ì•½

| ?ì—­ | ?‘ì—… ??| ?µì‹¬ ?Œì¼ |
|------|---------|-----------|
| ë©”ì¸ | 5 | HomeView, home/rails API |
| ë¡œê·¸??| 5 | login/page, AuthProvider |
| ë§ˆì¼“ | 4 | market/page, MarketCard, MarketFilterBar |
| ?ì„¸ | 6 | market/[id], TradingPanel, MobilizationInfo |
| ì±„íŒ… | 6 | MarketChatSection, api/chat |
| ë§ˆì´ | 5 | MyPageLayout, MyAssetSummary, MyInvestList |
| ê´€ë¦¬ì | 7 | admin/page, requireAdmin, settlement |
| IA | 5 | interest/rate API, InterestRail, userTaste |
| ?¨ë³´??| 3 | onboarding/page, InterestRail |
| PGë¼ˆë? | 7 | payments/request, payments/confirm, order/pay |

---

*?Œì¼ ê²½ë¡œ???ˆí¬ ë£¨íŠ¸ ê¸°ì? ?ë? ê²½ë¡œ?…ë‹ˆ??*
