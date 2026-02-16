# Supabase ?¤ì œ DB ?¤í‚¤ë§?(gen types ê¸°ì?)

## public.tables ?„ì²´ ëª©ë¡

- admin_audit_logs, admin_home_config, admin_rail_config
- chat_messages, chat_messages_v2 (ë¯¸í¬????ë³„ë„)
- interest_registrations, kyc_requests, kyc_verifications
- ledger_entries, market_state, ohlc_candles
- order_intents, orderbook_levels, **orders**
- portfolio, product_market_state, product_market_ticks, products
- **profiles**, projects
- seller_daily_settlement_finalizations, settlement_batch_orders, **settlement_batches**
- trades, ui_events, user_interest_ratings, user_tastes, users
- Views: admin_settlement_daily, seller_daily_settlement_*, ui_funnel_*, user_emails, user_taste_score

## ì£¼ìš” ?Œì´ë¸??ì„¸

### orders
| column | type | nullable |
|--------|------|----------|
| id | string | N |
| user_id | string | Y |
| product_id | string | N |
| price | number | N |
| quantity | number | N |
| status | string | Y |
| type | string | N |
| order_type | string | N |
| completed_at | string | Y |
| ledger_posted_at | string | Y |
| filled_quantity | number | Y |
| settled_at | string | Y |
| created_at | string | N |

??buyer_id, total_amount_krw ?†ìŒ ??user_id, price*quantity ?¬ìš©

### profiles
| column | type | nullable |
|--------|------|----------|
| id | string | N |
| email | string | Y |
| nickname | string | Y |
| balance | number | Y |
| role | string | N |
| created_at | string | N |

??status ?†ìŒ ??requireActiveUser??role/ë³„ë„ ë¡œì§ ?„ìš”

### ledger_entries
| column | type | nullable |
|--------|------|----------|
| id | string | N |
| user_id | string | N |
| order_id | string | N |
| entry_type | string | N |
| currency | string | N |
| amount | number | N |
| asset_id | string | Y |
| quantity | number | N |
| memo | string | Y |
| metadata | Json | Y |
| created_at | string | N |
| ledger_posted_at | string | Y |

### settlement_batches
| column | type | nullable |
|--------|------|----------|
| id | string | N |
| seller_id | string | N |
| settlement_date | string | N |
| gross_amount | number | N |
| net_amount | number | N |
| platform_fee | number | N |
| order_count | number | N |
| snapshot | Json | N |
| snapshot_hash | string | N |
| prev_hash | string | Y |
| confirmed_at | string | Y |
| confirmed_by | string | Y |

### payments, refunds
???¤ì œ DB???†ìŒ (migrations ë¯¸ì ???ëŠ” ë³„ë„ ?¤í‚¤ë§?

## Functions

### rpc_place_order
- Args: p_market_id, p_price, p_quantity, p_side
- Returns: Json

### place_order (ë³„ë„)
- Args: p_product_id, p_price, p_quantity, p_order_type, p_type
- Returns: Json

### rpc_admin_confirm_settlement
- Args: p_batch_id (?ëŠ” p_seller_id, p_settlement_date)
- Returns: undefined | Json

### rpc_confirm_payment, rpc_finalize_order
???¤ì œ DB???†ìŒ
