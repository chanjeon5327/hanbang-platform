# ?ì„¸?˜ì´ì§€ ê±°ë˜?Œí˜• ?¤í™ (DETAIL_EXCHANGE_SPEC)

## 1. ?•ì²´??

- **ê±°ë˜?Œí˜•(Trade-first) + ?”ë°°??*
- ?í’ˆ ?€??2ì¢…ì— ?°ë¼ ?ì„¸ UI ë¶„ê¸°
- USD ê¸°ì¶• ?€??+ ë¡œì»¬?µí™” ?œì‹œ(?˜ìœ¨ ë³€??

## 2. ?í’ˆ ?€??

| ?€??| ?¤ëª… | UI |
|------|------|-----|
| `DIVIDEND_ONLY` | ?”ë°°?¹ë§Œ | ?¬ì/ë°°ë‹¹ ?¨ë„, "ê±°ë˜ ë¶ˆê?" ë¬¸êµ¬ |
| `DIVIDEND_TRADABLE` | ?”ë°°??ê±°ë˜ | TradingPanel v2 (?¸ê?/ì£¼ë¬¸/ì²´ê²°/?´ì£¼ë¬? |

## 3. DB ?¤í‚¤ë§?(content_items ì¶”ê? ì»¬ëŸ¼)

| ì»¬ëŸ¼ | ?€??| ê¸°ë³¸ê°?| ?¤ëª… |
|------|------|--------|------|
| product_type | text | DIVIDEND_ONLY | ?í’ˆ ?€??|
| pricing_currency | text | USD | ê¸°ì¶• ?µí™” |
| share_price_usd | numeric(20,6) | - | ì£¼ë‹¹ ê°€ê²?(USD) |
| total_raise_usd | numeric(20,6) | - | ì´?ëª¨ì§‘??(USD) |
| current_raise_usd | numeric(20,6) | - | ?„ì¬ ëª¨ì§‘??(USD) |
| dividend_monthly_usd_per_share | numeric(20,6) | - | ??ë°°ë‹¹ê¸?(USD/ì£? |
| dividend_monthly_rate | numeric(10,4) | - | ??ë°°ë‹¹ë¥?(%) |
| payout_day | smallint | 3 | ë§¤ì›” ?•ì‚°??(1~28) |

## 4. ?•ì‚° ê·œì¹™

- **ê¸°ì???*: ë§¤ì›” ë§ì¼ 23:59:59 ë³´ìœ ??ê¸°ì?
- **?•ì‚°??*: ë§¤ì›” `payout_day`??(ê¸°ë³¸ 3??
- ?¤ì œ ?˜ìµ?€ ì½˜í…ì¸??±ê³¼???°ë¼ ë³€??

## 5. API

| ?”ë“œ?¬ì¸??| ?¤ëª… |
|------------|------|
| GET /api/market/item/[id] | ?ì„¸ ì¡°íšŒ, ? ê·œ ì»¬ëŸ¼ + fx_rate ?¬í•¨ |
| GET /api/fx/usd | USD?’KRW ?˜ìœ¨ (?„ì‹œ) |
| GET /api/market/orderbook/[id] | ?¸ê?ì°?(mock ?ˆìš©) |
| GET /api/market/trades/[id] | ì²´ê²° ?´ì—­ (mock ?ˆìš©) |

## 6. UI êµ¬ì¡° (ë¦¬ë“¬???¹ì…˜)

1. ?ìƒ/?¸ë„¤??
2. ?€?´í? + OFFICIAL IP EXCHANGE + ?€??ë°°ì? (?”ë°°??/ ?”ë°°??ê±°ë˜)
3. PriceHeader (USD + ë¡œì»¬)
4. PriceChartBlock (USD ê¸°ë°˜, ë¡œì»¬ ë³€??
5. TradingPanel v2 (DIVIDEND_TRADABLE) / ê±°ë˜ ë¶ˆê? (DIVIDEND_ONLY)
6. DividendInfo (?•ì‚°?? ??ë°°ë‹¹ë¥? ? ?ì—…)
7. ExpectedReturnBox (???˜ìµë¥?ê¸°ì?)
8. LiveMomentumBar / RecentInvestLog / ProductChat

## 7. Sticky CTA ë¶„ê¸°

- DIVIDEND_ONLY: "?©XXX ?¬ì?˜ê¸°"
- DIVIDEND_TRADABLE: "?©XXX ?¬ì/ë§¤ìˆ˜"

## 8. orderbook_orders / trades (TODO)

- ?¤í‚¤ë§ˆë§Œ ì¶”ê?, ?¤ì²´ê²?ë¡œì§ TODO
- UI ?¨ê³„?ì„œ mock/dummy ?ˆìš©
