# products.id / market[id] ?€??ê¸°ì? ?•ì •

## 1. ?€??ê¸°ì? ??

| ??ª© | DB/?¤í‚¤ë§??€??| lib/supabase types | ?„ì¬ ?¬ìš© | ê²°ë¡  |
|------|----------------|-------------------|-----------|------|
| **products.id** | `uuid` (PK) | `string` | products ?Œì´ë¸?PK | **UUID** |
| **orders.product_id** | `uuid` NOT NULL, FK?’products(id) | `string` | ì£¼ë¬¸ ??product ì°¸ì¡° | **UUID** |
| **market[id]** (route param) | - | `string` | content_items.id ?ëŠ” fallback id | **UUID** (API: content_items.uuid, fallback: UUIDë¡??µì¼) |
| **chat.product_id** | `uuid` NOT NULL (product_chat_messages) | - | ì±„íŒ… ë©”ì‹œì§€???í’ˆ ?ë³„ | **UUID** |
| **user_interests** | `content_id` uuid, FK?’content_items(id) | `string` | content_items ì°¸ì¡° (product_id ?„ë‹˜) | **UUID** (content_id) |

## 2. ê²°ë¡ 

- **ê¸°ì?: UUID**
- DB ?¤í‚¤ë§?products, orders, product_chat_messages)??ëª¨ë‘ `uuid` ?¬ìš©
- `sample-1`, `sample-2` ??ë¬¸ì??id??**?œê±°**?˜ê³ , fallback/?”ë? ?°ì´?°ëŠ” **? íš¨??UUID**ë¡?êµì²´

## 3. ì°¸ê³ : content_items vs products

- `content_items`: ???ˆì¼/ì¶”ì²œ??(id: uuid)
- `products`: ì£¼ë¬¸/ê±°ë˜/ì±„íŒ…??(id: uuid)
- market ?˜ì´ì§€: API ??content_items.id ?¬ìš©, fallback ???”ë? UUID ?¬ìš©
- ì±„íŒ…/ì£¼ë¬¸: `products.id` ê¸°ë? (product_chat_messages, rpc_place_order)

## 4. ?˜ì • ?´ì—­ (?ìš©??

| ê²½ë¡œ | ë³€ê²??´ìš© |
|------|-----------|
| `lib/constants/fallbackIds.ts` | ? ê·œ: FALLBACK_IDS ?ìˆ˜ (UUID 10ê°? |
| `app/market/page.tsx` | FALLBACK_ITEMS id ??FALLBACK_IDS ?¬ìš© |
| `app/api/home/sponsored/route.ts` | MOCK_SPONSORED productId ??FALLBACK_IDS.SAMPLE_1 |
| `hooks/useSponsoredPick.ts` | MOCK_FALLBACK productId ??FALLBACK_IDS.SAMPLE_1 |
| `hooks/useRecommendedRails.ts` | FALLBACK_RAILS id ??FALLBACK_IDS ?¬ìš© |
| `app/notifications/page.tsx` | reference_id ??UUID |
| `components/notifications/NotificationBell.tsx` | reference_id ??UUID |
| `app/admin/chat/moderation/page.tsx` | marketId ??UUID |
| `app/api/chat/[productId]/route.ts` | productId UUID ê²€ì¦?ì¶”ê? (400 ë°˜í™˜) |
