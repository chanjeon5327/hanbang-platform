-- 검증 SQL 15개 (2026-02-15 content_id 이행)

-- 1) products.content_id 존재
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'content_id';

-- 2) products.content_id FK
SELECT tc.constraint_name, tc.table_name, kcu.column_name, ccu.table_name AS foreign_table
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'products' AND kcu.column_name = 'content_id';

-- 3) orders.content_id 존재
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'content_id';

-- 4) orders.content_id FK
SELECT tc.constraint_name, kcu.column_name, ccu.table_name AS foreign_table
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'orders' AND kcu.column_name = 'content_id';

-- 5) idx_orders_content_id 존재
SELECT indexname FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'orders' AND indexname = 'idx_orders_content_id';

-- 6) orders.idempotency_key 존재
SELECT column_name FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'idempotency_key';

-- 7) idx_orders_idempotency_key unique
SELECT indexname, indexdef FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'orders' AND indexname = 'idx_orders_idempotency_key';

-- 8) rpc_invest_and_notify 4-param 시그니처
SELECT proname, pg_get_function_arguments(oid) FROM pg_proc
WHERE proname = 'rpc_invest_and_notify';

-- 9) products backfill: content_id NOT NULL
SELECT count(*) AS null_count FROM public.products WHERE content_id IS NULL;

-- 10) orders backfill: content_id 채워진 비율
SELECT
  count(*) AS total,
  count(content_id) AS with_content_id,
  round(100.0 * count(content_id) / nullif(count(*), 0), 2) AS pct
FROM public.orders;

-- 11) v_join_to_buy_7d 뷰 정상
SELECT * FROM public.v_join_to_buy_7d LIMIT 1;

-- 12) content_items.id = orders.content_id 매칭
SELECT count(*) FROM public.orders o
JOIN public.content_items ci ON ci.id = o.content_id;

-- 13) products.content_id = content_items.id 매칭
SELECT count(*) FROM public.products p
JOIN public.content_items ci ON ci.id = p.content_id;

-- 14) user_interests.content_id
SELECT column_name FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'user_interests' AND column_name = 'content_id';

-- 15) product_chat_messages.product_id (content_id 의미)
SELECT column_name FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'product_chat_messages' AND column_name = 'product_id';
