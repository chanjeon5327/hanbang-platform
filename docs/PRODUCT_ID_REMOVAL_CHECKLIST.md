# product_id ?œê±° ê°€???œì  ì²´í¬ë¦¬ìŠ¤??

## ?„ì œ

- `content_id` ?€???´ì˜ ?„ë£Œ
- ëª¨ë“  ? ê·œ ì£¼ë¬¸??`content_id` ?€??
- ê¸°ì¡´ `product_id` ?°ì´??backfill ?„ë£Œ

## ?œê±° ???•ì¸ ?¬í•­

- [ ] `orders.content_id` NOT NULL ?„í™˜ (ê¸°ì¡´ row ëª¨ë‘ backfill)
- [ ] API/?„ë¡ ?¸ê? `content_id`ë§??¬ìš©
- [ ] `rpc_invest_and_notify` `p_product_id` ?¤ë²„ë¡œë“œ ?œê±°
- [ ] `product_chat_messages.product_id` ??`content_id` ì»¬ëŸ¼ëª?ë³€ê²?(? íƒ)
- [ ] `ledger_entries.asset_id` ?˜ë?ê°€ content_idë¡??µì¼??
- [ ] `v_join_to_buy_7d` ??ë·°ê? `content_id`ë§?ì°¸ì¡°
- [ ] `orders.product_id` FK ?œê±°
- [ ] `idx_orders_product_id` ?¸ë±???œê±°

## ?œê±° ?œì„œ (?ˆì‹œ)

1. `orders.content_id` NOT NULL alter
2. ëª¨ë“  ì¿¼ë¦¬/ë·?RPC?ì„œ `product_id` ì°¸ì¡° ?œê±°
3. `orders.product_id` ì»¬ëŸ¼ drop
4. `product_chat_messages.product_id` ??`content_id` rename (? íƒ ??

## ì£¼ì˜

- **product_id???¹ì¥ ?œê±°?˜ì? ?ŠëŠ”??*
- ?€???´ì˜ ??ì½”ë“œ ?„ì „ ?„í™˜ ??ë§ˆì?ë§‰ì— ?œê±°
