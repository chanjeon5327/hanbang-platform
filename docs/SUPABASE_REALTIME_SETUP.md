# Supabase Realtime ?¤ì • ê°€?´ë“œ (product_chat_messages)

## 1. ?•í™•???´ë¦­ ê²½ë¡œ (3ì¤?

1. **?„ë¡œ?íŠ¸ ? íƒ** ???¼ìª½ ?¬ì´?œë°” **Database** ?´ë¦­  
2. ?ë‹¨ ??—??**Publications** ?´ë¦­  
3. `supabase_realtime` ?‰ì—??**product_chat_messages** ? ê? ON  

> URL ì§ì ‘ ?‘ê·¼: `https://supabase.com/dashboard/project/[?„ë¡œ?íŠ¸ID]/database/publications`

---

## 2. SQL: Replication ?•ì¸/?ê?

### ?Œì´ë¸?ì¶”ê? (Replication ?œì„±??

```sql
-- product_chat_messagesë¥?supabase_realtime publication??ì¶”ê?
ALTER PUBLICATION supabase_realtime ADD TABLE public.product_chat_messages;
```

### Replication ?•ì¸ ì¿¼ë¦¬

```sql
-- 1) supabase_realtime???¬í•¨???Œì´ë¸?ëª©ë¡
SELECT schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
ORDER BY schemaname, tablename;

-- 2) product_chat_messages ?¬í•¨ ?¬ë?
SELECT EXISTS (
  SELECT 1 FROM pg_publication_tables
  WHERE pubname = 'supabase_realtime'
    AND schemaname = 'public'
    AND tablename = 'product_chat_messages'
) AS product_chat_messages_replicated;

-- 3) publication ëª©ë¡ ë°??Œì† ?Œì´ë¸?
SELECT p.pubname, pt.schemaname, pt.tablename
FROM pg_publication p
LEFT JOIN pg_publication_tables pt ON p.pubname = pt.pubname
WHERE p.pubname = 'supabase_realtime';
```

---

## 3. INSERT ?´ë²¤???˜ì‹  ?ŒìŠ¤??(ë¸Œë¼?°ì? 2ê°?

| ?¨ê³„ | ë¸Œë¼?°ì? A | ë¸Œë¼?°ì? B |
|------|------------|------------|
| 1 | `/market/a1b2c3d4-e5f6-4789-a012-345678901234` ?‘ì†, **ë¡œê·¸??* | ?™ì¼ URL ?‘ì† (ë¡œê·¸???¬ë? ë¬´ê?) |
| 2 | ì±„íŒ… ?…ë ¥ì°½ì— ë©”ì‹œì§€ ?…ë ¥ ???„ì†¡ | ì±„íŒ… ?ì—­ë§?ë³´ë©´???€ê¸?|
| 3 | - | **?ˆë¡œê³ ì¹¨ ?†ì´** ë©”ì‹œì§€ê°€ ?˜í??˜ë©´ ?±ê³µ |

> `a1b2c3d4-e5f6-4789-a012-345678901234`??FALLBACK_IDS.SAMPLE_1 (E2E ?œë“œ?€ ?™ì¼). DB???´ë‹¹ productê°€ ?†ìœ¼ë©?ë¨¼ì? ?œë“œ ?¤í–‰.

---

## 4. ?¤íŒ¨ ??ì²´í¬????ª© 5ê°?

| # | ì²´í¬ ??ª© | ?•ì¸ ë°©ë²• |
|---|-----------|-----------|
| 1 | **product_chat_messagesê°€ publication???¬í•¨?ëŠ”ì§€** | ??SQL `pg_publication_tables` ì¿¼ë¦¬ë¡??•ì¸ |
| 2 | **RLS ?•ì±…??SELECTë¥??ˆìš©?˜ëŠ”ì§€** | `product_chat_messages_select_all` ?•ì±… ì¡´ì¬ ?¬ë?, `USING (is_deleted = false)` ?•ì¸ |
| 3 | **Supabase URL / anon keyê°€ ?¬ë°”ë¥¸ì?** | `.env.local`??`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` ?•ì¸ |
| 4 | **productIdê°€ ? íš¨??UUID?¸ì?** | `/market/sample-1` ê°™ì? ë¬¸ì??id ?¬ìš© ??Realtime ?„í„° ?¤íŒ¨ ??UUID ?¬ìš© |
| 5 | **WebSocket ?°ê²° ì°¨ë‹¨ ?¬ë?** | ë¸Œë¼?°ì? DevTools ??Network ??WS ??—??`realtime` ?°ê²° ?íƒœ, ë°©í™”ë²??„ë¡??ì°¨ë‹¨ ?¬ë? ?•ì¸ |
