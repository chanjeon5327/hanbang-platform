# lib/supabase/types.ts ë¶„ì„ ë³´ê³ ??

## 1. ?„ì¬ Database ?€??êµ¬ì¡° ?ê?

### 1.1 ?¬í•¨???Œì´ë¸?(7ê°?

| ?Œì´ë¸?| Row/Insert/Update | ?©ë„ |
|--------|-------------------|------|
| `users` | ??| ?¬ìš©??ê¸°ë³¸ ?•ë³´ (schema.sql ê¸°ë°˜) |
| `projects` | ??| ?„ë¡œ?íŠ¸/?í’ˆ |
| `investments` | ??| ?¬ì ?´ì—­ |
| `transactions` | ??| ?…ì¶œê¸?ê±°ë˜ |
| `wallets` | ??| ì§€ê°??”ì•¡ |
| `notifications` | ??| ?Œë¦¼ |
| `kyc_verifications` | ??| KYC ?¸ì¦ |

### 1.2 ?„ë½???Œì´ë¸?(?¤ì œ migrations/ì½”ë“œ?ì„œ ?¬ìš© ì¤?

| ?Œì´ë¸?| ?¬ìš©ì²?| ?©ë„ |
|--------|--------|------|
| `profiles` | AuthContext, requireAdmin, requireActiveUser, AuthProvider | Supabase Auth ?•ì¥ ?„ë¡œ??|
| `orders` | payments/request, orders/place, admin/orders, ab/assign-buy ??| ì£¼ë¬¸/ê²°ì œ |
| `products` | sellerProducts, publicProducts, MobileProductDetail | ?í’ˆ |
| `content_items` | home/rails | ì½˜í…ì¸?|
| `join_funnel` | funnel/join, ab/assign-cohort | ê°€???¼ë„ |
| `chat_messages_v2` | api/chat | ì±„íŒ… |
| `admin_audit_logs` | api/admin/audit | ê´€ë¦¬ì ê°ì‚¬ ë¡œê·¸ |
| `settlement_batches` | admin/settlement | ?•ì‚° ë°°ì¹˜ |
| `ledger_entries` | wallet/ledger, admin/orders | ?ì¥ |
| `payments` | payments/confirm | ê²°ì œ ê¸°ë¡ |
| `v_join_to_buy_7d` | admin/kpi, ab/assign-buy | ë·?|
| ê¸°í? | admin_rail_config, admin_home_config, market_state, trades ??| ê°ì¢… ê¸°ëŠ¥ |

### 1.3 Views, Functions, Enums

- `Views`: `[_ in never]: never` ??ë·??€???†ìŒ
- `Functions`: `[_ in never]: never` ??RPC ?¨ìˆ˜ ?€???†ìŒ
- `Enums`: `[_ in never]: never` ??enum ?€???†ìŒ

---

## 2. orders, profilesê°€ ë¹ ì ¸ ?ˆëŠ” ?´ìœ 

### 2.1 types.ts??ì¶œì²˜

`types.ts`??**supabase/schema.sql**ê³?1:1 ?€?‘í•©?ˆë‹¤.

- `schema.sql`: users, projects, investments, transactions, wallets, notifications, kyc_verifications
- `types.ts`: ?™ì¼ 7ê°??Œì´ë¸”ë§Œ ?•ì˜

### 2.2 schema.sql vs migrations ë¶ˆì¼ì¹?

| êµ¬ë¶„ | users | profiles | orders |
|------|-------|----------|--------|
| schema.sql | ??(?¤ê³„ ë¬¸ì„œ) | ??| ??|
| migrations | ??| ??(20241220) | ??(20260129, XXXX) |
| types.ts | ??| ??| ??|

**ê²°ë¡ **: `types.ts`??`schema.sql` ê¸°ë°˜?¼ë¡œ ?‘ì„±?˜ì—ˆê³? ?´í›„ migrationsë¡?ì¶”ê???`profiles`, `orders` ?±ì? ë°˜ì˜?˜ì? ?Šì•˜?µë‹ˆ??

### 2.3 ?¤ê³„ ?´ë ¥ ì¶”ì •

1. **ì´ˆê¸°**: schema.sql ?¤ê³„ (users, projects, investments ?????¬ë¼?°ë“œ?€???¤í???
2. **Supabase ?„ì…**: profiles ?Œì´ë¸?ì¶”ê? (auth.users ?•ì¥, 20241220)
3. **ê²°ì œ ?„ì…**: orders, ledger, payments ??ì¶”ê? (20260129~)
4. **?€??ë¯¸ë™ê¸°í™”**: types.ts??1?¨ê³„?ì„œ ë©ˆì¶¤, 2~3?¨ê³„ migrations ë¯¸ë°˜??

---

## 3. ?ë™ ?ì„± vs ?˜ë™ ?€???¼ì¬ ?¬ë?

### 3.1 ?ë™ ?ì„± ?•ì‹ ?¬ìš©

- `Json` ?€?? `Database` ?¸í„°?˜ì´??êµ¬ì¡° (Row/Insert/Update)
- Supabase `gen types` ì¶œë ¥ ?•ì‹ê³??™ì¼

### 3.2 ?˜ë™/ë¶€ë¶??‘ì„± ì§•í›„

- ?ë‹¨ ì£¼ì„: `--project-id YOUR_PROJECT_ID` ???Œë ˆ?´ìŠ¤?€??
- `package.json`??`supabase` CLI ?†ìŒ
- `config.toml` ?†ìŒ (supabase init ë¯¸ì‹¤??ê°€?¥ì„±)
- schema.sqlê³??„ì „ ?¼ì¹˜ ??schema.sql??ë³´ê³  ?˜ë™ ?‘ì„±?ˆì„ ê°€?¥ì„±

### 3.3 ?ë‹¨

**?˜ë™ ?‘ì„±**??ê°€ê¹ìŠµ?ˆë‹¤. `gen types`ë¥???ë²??¤í–‰?????ìˆ˜ ?¸ì§‘?ˆê±°?? schema.sql??ë³´ê³  ì§ì ‘ ?‘ì„±??ê²ƒìœ¼ë¡?ë³´ì…?ˆë‹¤. ?ë™ ?ì„±ë§??¬ìš©?ˆë‹¤ë©?migrations ê¸°ì??¼ë¡œ ëª¨ë“  ?Œì´ë¸”ì´ ?¬í•¨?˜ì–´ ?ˆì–´???©ë‹ˆ??

---

## 4. supabase gen types ?¬ìƒ???„ìš”??

### 4.1 ?¬ìƒ??ê¶Œì¥

| ì¡°ê±´ | ê¶Œì¥ |
|------|------|
| Supabase ?„ë¡œ?íŠ¸ ?°ê²° ê°€??| ??`supabase gen types typescript --project-id <REF> --schema public > lib/supabase/types.ts` |
| ë¡œì»¬ DBë§??¬ìš© | ??`supabase start` ??`supabase gen types typescript --local > lib/supabase/types.ts` |

### 4.2 ?¬ìƒ????ì¤€ë¹?

1. **Supabase CLI ?¤ì¹˜**
   ```bash
   npm install -D supabase
   ```

2. **?„ë¡œ?íŠ¸ ?°ê²°**
   - `supabase link --project-ref <PROJECT_REF>` (?ê²©)
   - ?ëŠ” ë¡œì»¬: `supabase start`

3. **ë§ˆì´ê·¸ë ˆ?´ì…˜ ?ìš© ?•ì¸**
   - ?ê²©: Supabase Dashboard?ì„œ migrations ë°˜ì˜ ?¬ë? ?•ì¸
   - ë¡œì»¬: `supabase db reset` ??`gen types`

### 4.3 ?¬ìƒ????ì£¼ì˜

- ê¸°ì¡´ ?˜ë™ ?€???¨ì–¸(?? `PaymentOrder`, `ProfileRole`) ?œê±° ê°€??
- ?ì„±???€?…ì´ migrations?€ ?¼ì¹˜?˜ë©´ `never` ì¶”ë¡  ?´ì†Œ
- `schema.sql`ê³?migrationsê°€ ?¤ë¥´ë©? **migrationsê°€ ?¤ì œ ?¤í‚¤ë§?*?´ë?ë¡?gen types ê²°ê³¼ë¥??°ì„ 

---

## 5. never ì¶”ë¡  ë°©ì? êµ¬ì¡° ê°œì„ ??

### 5.1 ?¨ê¸° (gen types ?¬ìƒ????

**Option A: ?„ë½ ?Œì´ë¸??˜ë™ ì¶”ê?**

`lib/supabase/types.ts`??`Tables`??`profiles`, `orders` ???„ë½ ?Œì´ë¸”ì„ migrations ê¸°ì??¼ë¡œ ì¶”ê?:

```typescript
// Tables ?´ë???ì¶”ê?
profiles: {
  Row: {
    id: string
    email: string | null
    display_name: string | null
    avatar_url: string | null
    provider: string | null
    role: 'USER' | 'CREATOR' | 'ADMIN'
    status: 'ACTIVE' | 'SUSPENDED'
    created_at: string
    updated_at: string
  }
  Insert: { ... }
  Update: { ... }
},
orders: {
  Row: {
    id: string
    buyer_id: string
    product_id: string | null
    status: string
    total_amount_krw: number
    quantity: number
    created_at: string
    updated_at: string
    // ...
  }
  Insert: { ... }
  Update: { ... }
},
```

**Option B: ?€???¨ì–¸ ? ì? (?„ì¬ ë°©ì‹)**

- `PaymentOrder`, `ProfileStatus` ??ë¡œì»¬ ?€??+ `as` ?¨ì–¸
- ?¥ì : ?˜ì • ë²”ìœ„ ?‘ìŒ
- ?¨ì : ?Œì´ë¸?ì¶”ê? ?œë§ˆ???˜ë™ ?€???„ìš”, ?€?…ê³¼ ?¤ì œ ?¤í‚¤ë§?ë¶ˆì¼ì¹??„í—˜

### 5.2 ì¤‘ê¸° (ê¶Œì¥): gen types ?ë™??

1. **?¤í¬ë¦½íŠ¸ ì¶”ê?** (`package.json`):
   ```json
   "scripts": {
     "db:types": "supabase gen types typescript --project-id $SUPABASE_PROJECT_REF --schema public > lib/supabase/types.ts"
   }
   ```

2. **CI/CD?ì„œ ë§ˆì´ê·¸ë ˆ?´ì…˜ ???€???¬ìƒ??*
   - ë§ˆì´ê·¸ë ˆ?´ì…˜ ?ìš© ??`pnpm db:types` ??ì»¤ë°‹

3. **pre-commit ?ëŠ” PR ì²´í¬**
   - migrations ë³€ê²???types.ts diff ?•ì¸

### 5.3 ?¥ê¸°: Database ?€???„ì „??ê²€ì¦?

1. **?¬ìš© ?Œì´ë¸?vs ?•ì˜ ?Œì´ë¸?ë§¤ì¹­**
   - `grep -r "\.from\('" --include="*.ts" --include="*.tsx"` ê²°ê³¼?€ `Database['public']['Tables']` ??ë¹„êµ
   - ?„ë½ ?Œì´ë¸??ë™ ?ì? ?¤í¬ë¦½íŠ¸

2. **strict ëª¨ë“œ + ?€??ì²´í¬**
   - `tsconfig.json`??`strict: true` ? ì?
   - `pnpm build`ë¡?`never` ì¶”ë¡  ???€???¤ë¥˜ ì¡°ê¸° ë°œê²¬

3. **Views/Functions ?€??*
   - `v_join_to_buy_7d` ??ë·??¬ìš© ??gen types??Views ?¬í•¨
   - RPC ?¸ì¶œ ??Functions ?€?…ìœ¼ë¡??¸ì/ë°˜í™˜ ?€??ë³´ì¥

---

## ?”ì•½

| ??ª© | ?„í™© | ê¶Œì¥ ì¡°ì¹˜ |
|------|------|-----------|
| types.ts êµ¬ì¡° | schema.sql ê¸°ë°˜ 7ê°??Œì´ë¸?| gen typesë¡??¬ìƒ??|
| orders/profiles ?„ë½ | migrations???ˆìœ¼??types???†ìŒ | gen types ?ëŠ” ?˜ë™ ì¶”ê? |
| ?ë™/?˜ë™ ?¼ì¬ | ?˜ë™ ?‘ì„±??ê°€ê¹Œì? | gen typesë¡??µì¼ |
| gen types ?¬ìƒ??| ?„ìš” | Supabase ?°ê²° ???¤í–‰ |
| never ë°©ì? | ?¨ì–¸?¼ë¡œ ?„ì‹œ ?€??| gen types + CI ?ë™?”ë¡œ ê·¼ë³¸ ?´ê²° |
