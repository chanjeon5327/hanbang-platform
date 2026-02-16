# ?±ëŠ¥ ?…ê·¸?ˆì´??(2026-02-28)

## 1. MV êµ¬ì¡° ?¤ëª…

### popular_content_mv

| ??ª© | ?´ìš© |
|------|------|
| ?•ì˜ | `user_interests`??`content_id`ë³?ê´€??count ì§‘ê³„ |
| ê°±ì‹  | `refresh_popular_content_mv()` ?¨ìˆ˜ ?¸ì¶œ (REFRESH MATERIALIZED VIEW CONCURRENTLY) |
| ê¶Œì¥ ì£¼ê¸° | 5ë¶?(cron ?? |
| unique index | `content_id` (CONCURRENTLY ê°±ì‹  ?„ìˆ˜) |

```sql
-- ?˜ë™ ê°±ì‹ 
SELECT refresh_popular_content_mv();
```

---

## 2. ì±„íŒ… Rate Limit ?¤ê³„

| ?œí•œ | ê°?| ?¤ëª… |
|------|-----|------|
| ì´ˆë‹¹ | 1??| ìµœê·¼ 1ì´????ˆì½”??ì¡´ì¬ ??429 |
| 10ì´ˆë‹¹ | 5??| ìµœê·¼ 10ì´???5ê±?ì´ˆê³¼ ??429 |

### chat_rate_limit ?Œì´ë¸?

- `user_id`, `created_at` ?€??
- RLS: ë³¸ì¸ë§?insert/select
- ?¸ë±?? `(user_id, created_at desc)` ???œê°„ ë²”ìœ„ ì¡°íšŒ ìµœì ??

### ?•ë¦¬ ?„ëµ

- ?¥ê¸° ë³´ê? ???Œì´ë¸?ë¹„ë???ê°€??
- ?¥í›„: TTL ê¸°ë°˜ ?•ë¦¬(cron) ?ëŠ” Redis ?„ì… ???Œì´ë¸??œê±° ê²€??

---

## 3. ìºì‹± TTL ?„ëµ??

| API | revalidate | TTL |
|-----|------------|-----|
| `/api/home/popular` | 300 | 5ë¶?|
| `/api/home/deadline` | 60 | 1ë¶?|
| `/api/home/sponsored` | 120 | 2ë¶?|

### fetch ?¸ì¶œ

- `cache: 'no-store'` ?œê±° ??ê¸°ë³¸ Next.js ìºì‹œ ?¬ìš©
- Route Handler??`revalidate`???°ë¼ ISR ?™ì‘

---

## 4. ?¥í›„ Redis ?„ì… ê°€?¥ì„±

- **chat_rate_limit**: Redis INCR + EXPIREë¡??€ì²????¨ì¼ ?¤Â·ë©”ëª¨ë¦¬ ê¸°ë°˜?¼ë¡œ ?¨ìˆœ??
- **popular MV**: Redis ìºì‹œ ?ˆì´??ì¶”ê? ??DB ë¶€??ì¶”ê? ê°ì†Œ ê°€??
- ?„ì¬??Postgres ?¨ì¼ ?ŒìŠ¤ë¡??´ì˜, ?¸ë˜??ì¦ê? ??Redis ê²€??
