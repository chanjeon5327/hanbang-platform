# ê°œë°œ ?¸íŠ¸

## ?˜í”Œ ?í’ˆ ê°œìˆ˜ ?•ì¸

### Supabase SQL Editor?ì„œ ?¤í–‰

```sql
-- ?œì„± ì½˜í…ì¸??˜ìµê¶? ê°œìˆ˜
SELECT count(*) AS active_items FROM public.content_items WHERE status='active';

-- products ?Œì´ë¸?ê°œìˆ˜
SELECT count(*) AS products FROM public.products;
```

### ë¡œì»¬ APIë¡??•ì¸

`scripts/print-sample-count.mjs` ?¤í–‰:

```bash
node scripts/print-sample-count.mjs
```

ë¡œì»¬ ?œë²„(`pnpm dev`)ê°€ ???ˆëŠ” ?íƒœ?ì„œ `/api/market/all?limit=200` ?¸ì¶œ ??`items.length`ë¥?ì½˜ì†”??ì¶œë ¥?œë‹¤.
