# ?°ì´??ë°±ì—… ?„ëµ

?°ì¹­ ì§ì „ ?ˆì •?”ë? ?„í•œ PostgreSQL ë°±ì—… ë°?ë³µêµ¬ ?ˆì°¨?…ë‹ˆ??

---

## 1. ë§¤ì¼ 02:00 Logical Backup

### cron ?¤ì • (Linux/macOS)

```bash
# crontab -e
0 2 * * * /usr/bin/pg_dump -h <DB_HOST> -U postgres -d <DB_NAME> -F c -f /backup/hanbang_$(date +\%Y\%m\%d).dump
```

### pg_dump ?ˆì‹œ (?˜ë™ ?¤í–‰)

```bash
# Custom format (?•ì¶•, ë³‘ë ¬ ë³µì› ê°€??
pg_dump -h localhost -U postgres -d postgres -F c -f hanbang_backup_$(date +%Y%m%d).dump

# Plain SQL (ê°€?…ì„±, ? íƒ??ë³µì›)
pg_dump -h localhost -U postgres -d postgres -F p -f hanbang_backup_$(date +%Y%m%d).sql

# Supabase ?„ë¡œ?íŠ¸ (Connection string ?¬ìš©)
pg_dump "postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres" -F c -f hanbang_backup.dump
```

### ?˜ê²½ ë³€???ˆì‹œ

```bash
export PGHOST=db.xxxx.supabase.co
export PGPORT=5432
export PGUSER=postgres
export PGPASSWORD=<your-password>
export PGDATABASE=postgres

pg_dump -F c -f hanbang_$(date +%Y%m%d).dump
```

---

## 2. Weekly Snapshot

- **ì£¼ê¸°**: ë§¤ì£¼ ?¼ìš”??03:00
- **ë°©ì‹**: ?¹ì¼ logical backup??ë³„ë„ ?”ë ‰?°ë¦¬??ë³´ê? (?? `/backup/weekly/`)
- **ë³´ê? ê¸°ê°„**: ìµœì†Œ 4ì£?

```bash
# cron
0 3 * * 0 cp /backup/hanbang_$(date +\%Y\%m\%d).dump /backup/weekly/
# 4ì£?ì´ˆê³¼ ë¶??? œ (? íƒ)
find /backup/weekly -name "hanbang_*.dump" -mtime +28 -delete
```

---

## 3. Restore ?ˆì°¨

### Custom format (.dump) ë³µì›

```bash
# 1) ê¸°ì¡´ DBê°€ ?ˆëŠ” ê²½ìš° - ?¤í‚¤ë§ˆë§Œ ë³µì› (?°ì´???œì™¸)
pg_restore -h localhost -U postgres -d postgres -c -F c hanbang_backup.dump

# 2) ë¹?DB???„ì²´ ë³µì›
pg_restore -h localhost -U postgres -d postgres -F c hanbang_backup.dump

# 3) ?¹ì • ?Œì´ë¸”ë§Œ ë³µì›
pg_restore -h localhost -U postgres -d postgres -t orders -t payments -F c hanbang_backup.dump
```

### Plain SQL (.sql) ë³µì›

```bash
psql -h localhost -U postgres -d postgres -f hanbang_backup.sql
```

### Supabase ë³µì› ??ì£¼ì˜

- Supabase ?€?œë³´?œì—?????„ë¡œ?íŠ¸ ?ì„± ?? `psql` ?ëŠ” `pg_restore`ë¡??°ì´??ë³µì›
- `auth.users` ??Supabase ?´ë? ?¤í‚¤ë§ˆëŠ” ? ì¤‘??ë³µì› (ê¸°ë³¸ ?œê³µ ?¤í‚¤ë§ˆì? ì¶©ëŒ ê°€??

---

## 4. ì²´í¬ë¦¬ìŠ¤??

| ??ª© | ì£¼ê¸° | ?´ë‹¹ |
|------|------|------|
| Logical backup ?¤í–‰ ?•ì¸ | ë§¤ì¼ | ?ë™??|
| Weekly snapshot ë³´ê? ?•ì¸ | ë§¤ì£¼ | ?ë™??|
| Restore ?ŒìŠ¤??| ??1??| ?´ì˜?€ |
| ë°±ì—… ?Œì¼ ?”í˜¸???¤í”„?¬ì´??ë³´ê? | ?¤ì • ??| ?¸í”„??|

---

## 5. ì°¸ê³ 

- `pg_dump`???¼ë¦¬??ë°±ì—…?¼ë¡œ, DBê°€ ?¤í–‰ ì¤‘ì´?´ë„ ?¼ê????¤ëƒ…???œê³µ
- ?€?©ëŸ‰ DB??`-j N` ?µì…˜?¼ë¡œ ë³‘ë ¬ ?¤í”„ ê°€??(Custom format)
- Supabase Pro ?´ìƒ: Point-in-Time Recovery (PITR) ?µì…˜ ê²€??
