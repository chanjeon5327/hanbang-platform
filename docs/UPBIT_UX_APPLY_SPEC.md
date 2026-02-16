# HANBANG Ã— ?…ë¹„??UX ?‘ëª© ?¤í™

> ?…ë¹„???¬ìš©ë²?Shorts 6ê°??ˆí¼?°ìŠ¤ ê¸°ë°˜ ?•ë¦¬ (?Œì›ê°€??KYC/?í™”ì¶œê¸ˆ/KRWê±°ë˜/?…ê¸ˆ/ì¶œê¸ˆ)

---

## 1) ì§„ì… ê²½ë¡œ?€ ?µì‹¬ ì»´í¬?ŒíŠ¸

### 1.1 ë¡œê·¸???¨ë³´??

| ?¼ìš°??| ì§„ì… ê²½ë¡œ | ?µì‹¬ ì»´í¬?ŒíŠ¸ |
|--------|-----------|---------------|
| `/login` | ???¤ë” ì§€ê°‘ë²„????`Header.tsx` `href="/login"`, `AuthStatus` ??ë¡œê·¸???´ë¦­ | `app/login/page.tsx` |
| `/signup` | ë¡œê·¸???˜ì´ì§€ ??ë§í¬, `Header` | `app/signup/page.tsx` ??`MobileSignup` |
| `/onboarding` | (ì§ì ‘ `/onboarding` ?ëŠ” ì¶”ì²œ ?Œë¡œ?? | `app/onboarding/page.tsx` ??`InterestRail` ??`InterestCard` |
| `LoginModal` | `InvestmentButton`, `MobileProductDetail` ??| `components/auth/LoginModal.tsx` |

### 1.2 ì§€ê°?(?…ì¶œê¸?

| ?¼ìš°??| ì§„ì… ê²½ë¡œ | ?µì‹¬ ì»´í¬?ŒíŠ¸ |
|--------|-----------|---------------|
| `/wallet` | `BottomNavigation`(ì§€ê°???, `app/page.tsx` ì§€ê°‘ë²„?? `Header` | `app/wallet/page.tsx` |
| `/wallet/deposit` | `/wallet` ???…ê¸ˆ CTA | `app/wallet/deposit/page.tsx` |
| `/wallet/withdraw` | `/wallet` ??ì¶œê¸ˆ CTA | `app/wallet/withdraw/page.tsx` |

### 1.3 ê±°ë˜ ?ì„¸

| ?¼ìš°??| ì§„ì… ê²½ë¡œ | ?µì‹¬ ì»´í¬?ŒíŠ¸ |
|--------|-----------|---------------|
| `/market/[id]` | ??`RailCard`, `InterestStrip`, `CurationSection`, `HomeHero` | `app/market/[id]/page.tsx` |
| (?´ë?) | - | `MarketHeader`, `MobilePriceChart`, `OrderBookSummary`, `OrderBookPanel`, `MobileOrderStickyBar`, `MobileOrderPanel`, `SideToggle` |

---

## 2) ?…ë¹„??UX ?¨í„´ (10ê°?

| # | ?¨í„´ | ?¤ëª… | ë§ˆì´?¬ë¡œì¹´í”¼ ?ˆì‹œ |
|---|------|------|-------------------|
| 1 | **?¤í¬ ë°°ê²½ + ?¨ë„ ì¹´ë“œ** | ë°°ê²½ `#0d0d0d`, ì¹´ë“œ `#161616`, ?Œë‘ë¦?`#2b2b2b` | - |
| 2 | **?¨ê³„???¤í…??* | ???Œì›ê°€????ê³ ê°?•ì¸ ???í™”?…ê¸ˆ ?œì„œ ?œì‹œ | "ê°€???ˆì°¨", "1. ë¡œê·¸????2. ê³ ê°?•ì¸ ??3. ?í™”?…ê¸ˆ" |
| 3 | **?íƒœ ë°°ì?** | ?„ì¬ ?¨ê³„/ë§ˆì¼“ êµ¬ë¶„ ë°°ì? | "KRW ë§ˆì¼“", "?„ì¬", "?¤ì‹œê°?, "?•ìƒ" |
| 4 | **?…ê¸ˆ/ì¶œê¸ˆ CTA 2??* | ?…ê¸ˆÂ·ì¶œê¸ˆ ë²„íŠ¼???˜ë???ë°°ì¹˜ | "?…ê¸ˆ", "ì¶œê¸ˆ", "KRW ì¶©ì „", "ê³„ì¢Œë¡??´ì²´" |
| 5 | **?˜ìˆ˜ë£?ì²˜ë¦¬?íƒœ ì¹´ë“œ** | ?˜ìˆ˜ë£ŒÂ·ì²˜ë¦¬ìƒ?œÂ·ì£¼?˜ë¬¸êµ¬ë? ??ì¹´ë“œ??| "?…ê¸ˆ ?˜ìˆ˜ë£?ë¬´ë£Œ", "ì¶œê¸ˆ ?˜ìˆ˜ë£?1ê±´ë‹¹ 1,000??, "ì²˜ë¦¬ ?íƒœ ?•ìƒ" |
| 6 | **ê°€ê²??¤ë”** | ?ë‹¨???„ì¬ê°€Â·?±ë½ë¥ Â?2ì£?ê³??€ | "??2,300", "+3.2%", "?„ì¼?€ë¹?, "52ì£¼é«˜/52ì£¼ä½" |
| 7 | **ì°¨íŠ¸ + ?€?„í”„?ˆì„ ì¹?* | ì°¨íŠ¸ ?˜ë‹¨ 1D/1W/1M ë²„íŠ¼ | "1D", "1W", "1M" |
| 8 | **?¸ê?ì°?3??* | ë§¤ë„?¸ê? | ?˜ëŸ‰ | ë§¤ìˆ˜?¸ê?, ë¹„ìœ¨ ë°?| "ë§¤ë„?¸ê?", "?˜ëŸ‰", "ë§¤ìˆ˜?¸ê?", "??•˜???„ì²´ ?¸ê? ë³´ê¸°" |
| 9 | **ë§¤ìˆ˜/ë§¤ë„ ? ê? + ì§€?•ê?/?œì¥ê°€** | ì£¼ë¬¸ ?¨ë„ ?ë‹¨ ? ê? | "ë§¤ìˆ˜", "ë§¤ë„", "ì§€?•ê?", "?œì¥ê°€" |
| 10 | **?˜ë‹¨ ê³ ì • ì£¼ë¬¸ë°?* | ?„ì¬ê°€Â·?±ë½ë¥?+ ë§¤ìˆ˜/ë§¤ë„ CTA | "?„ì¬ê°€", "ë§¤ìˆ˜", "ë§¤ë„" |

---

## 3) HANBANG ?ìš© ë§µí•‘??

| ?°ì„ ?œìœ„ | ?”ë©´ | ì»´í¬?ŒíŠ¸ | ?ìš© ?¨í„´ | ë¹„ê³  |
|---------|------|----------|----------|------|
| P0 | `/login` | `app/login/page.tsx` | 1, 2, 3 | ?´ë? ?ìš©?? ë§ˆì´?¬ë¡œì¹´í”¼ë§??ê? |
| P0 | `LoginModal` | `components/auth/LoginModal.tsx` | 1, 2, 3 | ëª¨ë‹¬ ???¤í…?¼Â·ë°°ì§€ |
| P0 | `/onboarding` | `app/onboarding/page.tsx` | 1, 2, 3 | ?¤í…?¼Â·ë‹¤??ë°°ê²½ |
| P0 | `/wallet` | `app/wallet/page.tsx` | 1, 4, 5 | ?…ê¸ˆ/ì¶œê¸ˆ CTAÂ·?˜ìˆ˜ë£?ì¹´ë“œ(?´ë? ?ìš©) |
| P0 | `/wallet/deposit` | `app/wallet/deposit/page.tsx` | 1, 2, 3 | placeholder ???…ë¹„?¸í˜• ?ˆì´?„ì›ƒ |
| P0 | `/wallet/withdraw` | `app/wallet/withdraw/page.tsx` | 1, 2, 3 | placeholder ???…ë¹„?¸í˜• ?ˆì´?„ì›ƒ |
| P0 | `/market/[id]` | `MarketHeader` | 1, 6 | ê°€ê²??¤ë”Â·52ì£?ê³??€(?´ë? ?ìš©) |
| P0 | `/market/[id]` | `MobilePriceChart` | 1, 7 | ì°¨íŠ¸Â·?€?„í”„?ˆì„ ì¹??´ë? ?ˆìŒ) |
| P0 | `/market/[id]` | `OrderBook` | 1, 8 | ?¸ê?ì°?3?´Â·ë¹„??ë°??´ë? ?ìš©) |
| P0 | `/market/[id]` | `MobileOrderPanel` | 1, 9 | ì§€?•ê?/?œì¥ê°€Â·ë¹„ìœ¨ ë²„íŠ¼(?´ë? ?ìš©) |
| P0 | `/market/[id]` | `MobileOrderStickyBar` | 1, 10 | ?˜ë‹¨ ê³ ì • ë°??´ë? ?ìš©) |
| P1 | `/signup` | `MobileSignup` | 1, 2, 3 | ?¤í¬ ë°°ê²½Â·?¤í…???•ë ¬ |

---

## 4) ?„í—˜?”ì†Œ ë°??ˆë? ê±´ë“œë¦¬ë©´ ???˜ëŠ” ë¶€ë¶?

### 4.1 ?„í—˜?”ì†Œ (ë¡œì§ ê¹¨ì§ˆ ???ˆëŠ” ì§€??

| ?„ì¹˜ | ?„í—˜ | ?„í™” ë°©ë²• |
|------|------|----------|
| `app/login/page.tsx` | `createClient` from `@/utils/supabase/client` | import ê²½ë¡œ ? ì? |
| `app/wallet/page.tsx` | `useStore()` ??`userCash`, `holdings`, `history`, `sellStock` | StoreContext ?˜ì¡´??? ì? |
| `app/market/[id]/page.tsx` | `params.id` ??API `/api/ab/assign-buy`, `/api/ab/assign-cohort` | API ?¸ì¶œÂ·?Œë¼ë¯¸í„° ? ì? |
| `MobileOrderPanel` | `fetch('/api/orders/place', ...)` | body `productId`, `side`, `price`, `quantity` ? ì? |
| `OrderBook` | ?¸ê? ?°ì´??êµ¬ì¡° | `sellRows`, `buyRows`, `currentPrice` ?•ì‹ ? ì? |
| `onboarding` | `useUserTaste` (zustand) | zustand ë¯¸ì„¤ì¹????°í????ëŸ¬ ê°€????ë¹Œë“œ ?•ì¸ |

### 4.2 ?ˆë? ê±´ë“œë¦¬ë©´ ???˜ëŠ” ë¶€ë¶?

- **API ?¼ìš°??*: `app/api/**` ?„ì²´
- **DB/RPC**: `supabase/migrations/**`, `utils/supabase/**` ë¡œì§
- **ì£¼ë¬¸ ?Œë¡œ??*: `app/api/orders/place/route.ts`, `rpc_place_order` ?¸ì¶œ êµ¬ì¡°
- **ê²°ì œ ?¹í›…**: `app/api/webhook/payment/route.ts`
- **StoreContext**: `context/StoreContext.tsx` ??`buyStock`, `sellStock`, `userCash`, `holdings`, `history` ?œê·¸?ˆì²˜
- **Auth**: Supabase `signInWithPassword`, `signUp` ?¸ì¶œ ë°©ì‹

---

## 5) Compose ?¤í–‰???„ë¡¬?„íŠ¸ (???©ì–´ë¦?

```
[ì§ˆë¬¸]
?…ë¹„???¬ìš©ë²?Shorts 6ê°??Œì›ê°€??KYC/?í™”ì¶œê¸ˆ/KRWê±°ë˜/?…ê¸ˆ/ì¶œê¸ˆ)ë¥?ì°¸ê³ ?´ì„œ,
HANBANG ?Œë«?¼ì˜ /login(?¨ë³´??, /wallet(?…ì¶œê¸?, ê±°ë˜ ?ì„¸(ì°¨íŠ¸/?¸ê?/ì£¼ë¬¸?¨ë„) UIë¥??…ë¹„?¸í˜•?¼ë¡œ ?‘ëª©?´ë¼.

[ë²”ìœ„]
- /login: app/login/page.tsx ???¨ê³„???¤í…?? ?íƒœ ë°°ì?, ?¤í¬ ë°°ê²½
- LoginModal: components/auth/LoginModal.tsx ???™ì¼ ?¨í„´
- /onboarding: app/onboarding/page.tsx ???¤í…?? ?¤í¬ ?¨ë„
- /wallet: app/wallet/page.tsx ???…ê¸ˆ/ì¶œê¸ˆ CTA, ?˜ìˆ˜ë£?ì²˜ë¦¬?íƒœ ì¹´ë“œ (?´ë? ?ˆìœ¼ë©?ë§ˆì´?¬ë¡œì¹´í”¼ë§??ê?)
- /wallet/deposit, /wallet/withdraw: placeholder ???…ë¹„?¸í˜• ?¤ë”Â·ì¹´ë“œ ?ˆì´?„ì›ƒ
- /market/[id]: MarketHeader, MobilePriceChart, OrderBook, MobileOrderPanel, MobileOrderStickyBar ??ê°€ê²??¤ë”, ì°¨íŠ¸+?€?„í”„?ˆì„, ?¸ê? 3?? ì§€?•ê?/?œì¥ê°€, ?˜ë‹¨ ?¤í‹°??

[?…ë¹„???¨í„´]
1. ?¤í¬ ë°°ê²½ #0d0d0d, ?¨ë„ #161616, ?Œë‘ë¦?#2b2b2b
2. ë§¤ìˆ˜ ?Œë‘ #1e88e5, ë§¤ë„ ë¹¨ê°• #e53935, ?ìŠ¹ ì´ˆë¡ #00c48c
3. ?¨ê³„???¤í…??(?Œì›ê°€?…â†’ê³ ê°?•ì¸?’ì›?”ì…ê¸?
4. ?íƒœ ë°°ì?: "KRW ë§ˆì¼“", "?¤ì‹œê°?, "?„ì¬"
5. ?…ê¸ˆ/ì¶œê¸ˆ CTA 2??ê·¸ë¦¬??
6. ?˜ìˆ˜ë£?ì²˜ë¦¬?íƒœ/ì£¼ì˜ë¬¸êµ¬ ì¹´ë“œ
7. ê°€ê²??¤ë”: ?„ì¬ê°€, ?±ë½ë¥? 52ì£?ê³??€
8. ?¸ê?ì°? ë§¤ë„?¸ê?|?˜ëŸ‰|ë§¤ìˆ˜?¸ê?, ë¹„ìœ¨ ë°?
9. ë§¤ìˆ˜/ë§¤ë„ ? ê? + ì§€?•ê?/?œì¥ê°€ ??+ 25%/50%/75%/100% ë²„íŠ¼
10. ?˜ë‹¨ ê³ ì • ì£¼ë¬¸ë°?

[?œì•½]
- Tailwind + ?¸ë¼??styleë§??¬ìš©. ??UI ?¼ì´ë¸ŒëŸ¬ë¦?ì¶”ê? ê¸ˆì?.
- ë¹„ì¦ˆ?ˆìŠ¤ ë¡œì§/DB/RPC/API route ?ˆë? ?˜ì • ê¸ˆì?.
- StoreContext, useStore, fetch('/api/orders/place'), Supabase auth ?¸ì¶œ êµ¬ì¡° ? ì?.
- ëª¨ë°”???°ì„ .

[ì¶œë ¥]
- ë³€ê²½ëœ ?Œì¼ ëª©ë¡
- ë¡œì»¬ ?•ì¸: pnpm dev ??http://localhost:3000
- ì»¤ë°‹ ë©”ì‹œì§€: ?œê? + ?ì— "YYYY-MM-DD HH:mm" ?€?„ìŠ¤?¬í”„
```
