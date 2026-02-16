# Supabase TypeScript ?€???¬ìƒ???‘ì—… ?”ì•½

## 1. Supabase CLI ?¤ì¹˜

- **?íƒœ**: devDependencyë¡??¤ì¹˜ ?„ë£Œ (`pnpm add -D supabase`)
- postinstall ?¤í¬ë¦½íŠ¸ë¡?Windows amd64 ë°”ì´?ˆë¦¬ ?¤ìš´ë¡œë“œ ?„ë£Œ

## 2. ë¡œê·¸??

- **?íƒœ**: `supabase login` ?„ìš” ???¡ì„¸??? í° ?†ìŒ
- **?ê²© gen types**: `--project-id` ?¬ìš© ??`SUPABASE_ACCESS_TOKEN` ?„ìš”
- **?€??*: Docker ë¯¸ì„¤ì¹˜ë¡œ `--local` ?¬ìš© ë¶ˆê?

## 3. types.ts ì²˜ë¦¬

- **ë°±ì—…**: `lib/supabase/types.ts.backup` ?ì„±
- **ê¸°ì¡´ types.ts**: ?´ë? 1360ì¤?ë¶„ëŸ‰??gen types ì¶œë ¥ ì¡´ìž¬
- **ì¡°ì¹˜**: `supabase gen types` ë¯¸ì‹¤?? ê¸°ì¡´ types.ts???„ë½ ì»¬ëŸ¼/?Œì´ë¸??˜ë™ ë³´ê°•

## 4. ?˜ì •???´ìš©

| ?€???Œì´ë¸?| ë³€ê²??´ìš© |
|-------------|-----------|
| `orders` | `buyer_id`, `total_amount_krw` ì¶”ê? |
| `profiles` | `status`, `display_name` ì¶”ê? |
| `projects` | `category`, `video_url` ì¶”ê? |
| `rpc_place_order` | `p_market_id` ??`p_product_id`ë¡?ë³€ê²?|

## 5. never ì¶”ë¡  ?œê±°

- `app/api/payments/request/route.ts`: `orders` ?€??ë³´ê°•?¼ë¡œ ?€???¨ì–¸ ?œê±°
- `lib/admin/requireAdmin.ts`: `profiles` ?€??ë³´ê°•?¼ë¡œ ?€???¨ì–¸ ?œê±°
- `lib/auth/requireActiveUser.ts`: `profiles.status` ?€??ë³´ê°•?¼ë¡œ ?€???¨ì–¸ ?œê±°

## 6. strict ëª¨ë“œ ?€??

- `app/projects/[id]/page.tsx`: `current_amount`, `min_investment`, `category` null ì²˜ë¦¬
- `components/ProjectCard.tsx`: `category` null ì²˜ë¦¬

## 7. ë¹Œë“œ ê²°ê³¼

- **pnpm build**: ?µê³¼

## 8. ?´í›„ ê¶Œìž¥ ?¬í•­

1. **`supabase login` ?¤í–‰** ???„ëž˜ ëª…ë ¹?¼ë¡œ ?€???¬ìƒ??
   ```powershell
   pnpm exec supabase gen types typescript --project-id qolxkvqzkyfvmrqswqfg --schema public > lib/supabase/types.ts
   ```

2. **package.json ?¤í¬ë¦½íŠ¸ ì¶”ê?**:
   ```json
   "db:types": "supabase gen types typescript --project-id %SUPABASE_PROJECT_REF% --schema public > lib/supabase/types.ts"
   ```

3. `.env.local`??`SUPABASE_PROJECT_REF=qolxkvqzkyfvmrqswqfg` ?¤ì • ??`pnpm db:types` ?¤í–‰
