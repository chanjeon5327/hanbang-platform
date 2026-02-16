# Supabase CLIë¡?TypeScript ?€???¬ìƒ??ê°€?´ë“œ

**?˜ê²½**: Windows, pnpm

---

## ?¬ì „ ?”êµ¬?¬í•­

1. **Node.js** (pnpm ?¬ìš© ê°€??
2. **Supabase ?„ë¡œ?íŠ¸** (?ê²© ?¸ìŠ¤???ëŠ” ë¡œì»¬)
3. **Docker Desktop** (ë¡œì»¬ DB ?¬ìš© ??

---

## ë°©ë²• A: ?ê²© ?„ë¡œ?íŠ¸?ì„œ ?ì„± (ê¶Œì¥)

Supabase Dashboard??ë°°í¬???„ë¡œ?íŠ¸??**?¤ì œ ?¤í‚¤ë§?*ë¥?ê¸°ì??¼ë¡œ ?€?…ì„ ?ì„±?©ë‹ˆ??

### 1?¨ê³„: Supabase CLI ?¤ì¹˜

```powershell
pnpm add -D supabase
```

?ëŠ” ?„ì—­ ?¤ì¹˜:

```powershell
npm install -g supabase
```

### 2?¨ê³„: Supabase ë¡œê·¸??

```powershell
pnpm supabase login
```

- ë¸Œë¼?°ì?ê°€ ?´ë¦¬ë©?Supabase ê³„ì •?¼ë¡œ ë¡œê·¸??
- [Dashboard > Account > Access Tokens](https://supabase.com/dashboard/account/tokens)?ì„œ ? í°??ë°œê¸‰??`--token` ?µì…˜?¼ë¡œ ?„ë‹¬???˜ë„ ?ˆìŒ

### 3?¨ê³„: ?„ë¡œ?íŠ¸ ID ?•ì¸

- [Supabase Dashboard](https://supabase.com/dashboard) ???„ë¡œ?íŠ¸ ? íƒ
- **Settings** ??**General** ??**Reference ID** (?? `qolxkvqzkyfvmrqswqfg`)

?ëŠ” ?„ë¡œ?íŠ¸ URL?ì„œ ì¶”ì¶œ:
- `https://<PROJECT_REF>.supabase.co` ??`<PROJECT_REF>`ê°€ ?„ë¡œ?íŠ¸ ID

### 4?¨ê³„: ?€???ì„±

```powershell
pnpm supabase gen types typescript --project-id <PROJECT_REF> --schema public > lib/supabase/types.ts
```

?ˆì‹œ (?„ë¡œ?íŠ¸ IDê°€ `qolxkvqzkyfvmrqswqfg`??ê²½ìš°):

```powershell
pnpm supabase gen types typescript --project-id qolxkvqzkyfvmrqswqfg --schema public > lib/supabase/types.ts
```

### 5?¨ê³„: ?˜ê²½ë³€?˜ë¡œ ?„ë¡œ?íŠ¸ ID ?¬ìš© (? íƒ)

`.env.local`??ì¶”ê?:

```
SUPABASE_PROJECT_REF=qolxkvqzkyfvmrqswqfg
```

PowerShell?ì„œ:

```powershell
$env:SUPABASE_PROJECT_REF = "qolxkvqzkyfvmrqswqfg"
pnpm supabase gen types typescript --project-id $env:SUPABASE_PROJECT_REF --schema public > lib/supabase/types.ts
```

---

## ë°©ë²• B: ë¡œì»¬ DB?ì„œ ?ì„±

ë¡œì»¬ Supabase?ì„œ migrationsë¥??ìš©?????€?…ì„ ?ì„±?©ë‹ˆ??

### 1?¨ê³„: Supabase CLI ?¤ì¹˜

```powershell
pnpm add -D supabase
```

### 2?¨ê³„: ?„ë¡œ?íŠ¸ ì´ˆê¸°??(supabase ?´ë”ê°€ ?†ì„ ??

```powershell
pnpm supabase init
```

- `supabase/config.toml` ?ì„±
- ?´ë? `supabase/migrations`ê°€ ?ˆìœ¼ë©?ê·¸ë?ë¡??¬ìš©

### 3?¨ê³„: ë¡œì»¬ Supabase ?œì‘

```powershell
pnpm supabase start
```

- Docker Desktop ?„ìš”
- Postgres, Studio, Auth ??ì»¨í…Œ?´ë„ˆ ?¤í–‰
- `supabase/migrations`ê°€ ?ë™ ?ìš©??

### 4?¨ê³„: ?€???ì„±

```powershell
pnpm supabase gen types typescript --local --schema public > lib/supabase/types.ts
```

### 5?¨ê³„: ë¡œì»¬ Supabase ì¤‘ì? (? íƒ)

```powershell
pnpm supabase stop
```

---

## ë°©ë²• C: ?„ë¡œ?íŠ¸ ?°ê²°(link) ???ì„±

?ê²© ?„ë¡œ?íŠ¸ë¥??°ê²°???ë©´ `--linked`ë¡??€?…ì„ ?ì„±?????ˆìŠµ?ˆë‹¤.

### 1?¨ê³„: ë¡œê·¸??ë°??°ê²°

```powershell
pnpm supabase login
pnpm supabase link --project-ref <PROJECT_REF>
```

- DB ë¹„ë?ë²ˆí˜¸ ?…ë ¥ ???„ë¡¬?„íŠ¸ ?œì‹œ??

### 2?¨ê³„: ?€???ì„±

```powershell
pnpm supabase gen types typescript --linked --schema public > lib/supabase/types.ts
```

---

## package.json ?¤í¬ë¦½íŠ¸ ì¶”ê?

```json
{
  "scripts": {
    "db:types": "supabase gen types typescript --project-id %SUPABASE_PROJECT_REF% --schema public > lib/supabase/types.ts"
  }
}
```

> **Windows PowerShell**?ì„œ??`%VAR%` ?€??`$env:VAR` ?¬ìš©:
>
> ```powershell
> $env:SUPABASE_PROJECT_REF = "qolxkvqzkyfvmrqswqfg"
> pnpm db:types
> ```

?¬ë¡œ???Œë«?¼ì„ ?„í•´ [cross-env](https://www.npmjs.com/package/cross-env) ?ëŠ” `dotenv-cli` ?¬ìš©:

```json
{
  "scripts": {
    "db:types": "supabase gen types typescript --project-id $SUPABASE_PROJECT_REF --schema public > lib/supabase/types.ts"
  }
}
```

`.env.local`??`SUPABASE_PROJECT_REF`ê°€ ?ˆìœ¼ë©?

```powershell
# PowerShell?ì„œ .env.local ë¡œë“œ ???¤í–‰
Get-Content .env.local | ForEach-Object { if ($_ -match '^SUPABASE_PROJECT_REF=(.+)$') { $env:SUPABASE_PROJECT_REF = $matches[1] } }
pnpm supabase gen types typescript --project-id $env:SUPABASE_PROJECT_REF --schema public > lib/supabase/types.ts
```

---

## gen types ?µì…˜

| ?µì…˜ | ?¤ëª… |
|------|------|
| `--project-id <string>` | ?ê²© ?„ë¡œ?íŠ¸ ID |
| `--local` | ë¡œì»¬ DB ?¬ìš© |
| `--linked` | ?°ê²°???„ë¡œ?íŠ¸ ?¬ìš© |
| `--db-url <string>` | DB URL ì§ì ‘ ì§€??|
| `--schema <strings>` | ?¤í‚¤ë§?(ê¸°ë³¸: public) |
| `--lang typescript` | ì¶œë ¥ ?¸ì–´ (ê¸°ë³¸ê°? |

---

## ?ì„± ???•ì¸

1. **ë¹Œë“œ ?•ì¸**

   ```powershell
   pnpm build
   ```

2. **?€???¨ì–¸ ?œê±°**

   - `lib/supabase/types.ts`??`orders`, `profiles` ?±ì´ ?¬í•¨?˜ë©´
   - `app/api/payments/request/route.ts`??`PaymentOrder` ?€???¨ì–¸
   - `lib/admin/requireAdmin.ts`??`ProfileRole` ?€???¨ì–¸
   - `lib/auth/requireActiveUser.ts`??`ProfileStatus` ?€???¨ì–¸
   - ??ì½”ë“œë¥??œê±°?˜ê³  Supabase ?€?…ì„ ê·¸ë?ë¡??¬ìš©?˜ë„ë¡??˜ì • ê°€??

---

## ë¬¸ì œ ?´ê²°

### "Missing SUPABASE_ACCESS_TOKEN" ?ëŠ” "project not found"

- `pnpm supabase login` ?¬ì‹¤??
- ?„ë¡œ?íŠ¸ IDê°€ ?¬ë°”ë¥¸ì? ?•ì¸

### "Docker is not running" (ë¡œì»¬ ?¬ìš© ??

- Docker Desktop ?¤í–‰ ??`supabase start` ?¬ì‹œ??

### PowerShell?ì„œ ë¦¬ë‹¤?´ë ‰???¤ë¥˜

- `>` ?€??`Out-File` ?¬ìš©:

  ```powershell
  pnpm supabase gen types typescript --project-id <REF> --schema public | Out-File -FilePath lib/supabase/types.ts -Encoding utf8
  ```

### UTF-8 ?¸ì½”??

- PowerShell ê¸°ë³¸ ?¸ì½”?©ì´ BOM?´ë©´ ë¬¸ì œê°€ ?????ˆìŒ
- `-Encoding utf8NoBOM` (PowerShell 6+) ?¬ìš©:

  ```powershell
  pnpm supabase gen types typescript --project-id <REF> --schema public | Out-File -FilePath lib/supabase/types.ts -Encoding utf8NoBOM
  ```

---

## ?”ì•½

| ë°©ë²• | ëª…ë ¹ | ì¡°ê±´ |
|------|------|------|
| ?ê²© | `--project-id <REF>` | ë¡œê·¸??+ ?„ë¡œ?íŠ¸ ID |
| ë¡œì»¬ | `--local` | ë¡œì»¬ Supabase ?¤í–‰ ì¤?|
| ?°ê²° | `--linked` | `supabase link` ?„ë£Œ |

**ê¶Œì¥**: `--project-id`ë¡??ê²© ?„ë¡œ?íŠ¸ ?¤í‚¤ë§ˆì—???€???ì„±?˜ëŠ” ë°©ë²• A ?¬ìš©.
