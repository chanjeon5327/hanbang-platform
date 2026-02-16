# ?¸ì¦/?¸ì…˜ ?µí•© ?ê? ì²´í¬ë¦¬ìŠ¤??

> ?¸ì…˜ ë¶ˆì¼ì¹??œê±° + ?ˆì´?¸ë¦¬ë°??ìš© ?„ë£Œ ê¸°ì?

---

## ?„ë£Œ ê¸°ì? ì²´í¬ë¦¬ìŠ¤??

### 1. ë¡œê·¸??ë¡œê·¸?„ì›ƒ ?¨ì¼ ?¨ìˆ˜ ?µì¼
- [ ] **ë¡œê·¸??*: `login()` (`lib/auth/client.ts`) ??`/api/auth/login` ?¸ì¶œë§??¬ìš©
- [ ] **ë¡œê·¸?„ì›ƒ**: `signOut()` / `logout()` ??`/api/auth/logout` ?¸ì¶œë§??¬ìš©
- [ ] ë¡œê·¸???˜ì´ì§€, LoginModal, Admin ë¡œê·¸??ëª¨ë‘ `login()` ?¬ìš©
- [ ] Header, Admin ?ˆì´?„ì›ƒ ëª¨ë‘ API ê¸°ë°˜ `signOut`/`logout` ?¬ìš©

### 2. ?¸ì…˜?€ ì¿ í‚¤ ê¸°ë°˜(@supabase/ssr)ë§?? ë¢°
- [ ] `GET /api/auth/session` ???œë²„ `createClient()` (cookies)ë¡œë§Œ ?¸ì…˜ ì¡°íšŒ
- [ ] AuthProvider: `fetch('/api/auth/session')` ?¬ìš©, ?´ë¼?´ì–¸??`getSession()` ë¯¸ì‚¬??
- [ ] Admin AuthContext: `fetch('/api/auth/session?admin=1')` ?¬ìš©
- [ ] `onAuthStateChange` / `getSession` ?´ë¼?´ì–¸???¸ì¶œ ?œê±°??

### 3. localStorage ?”ì¬ ?œê±°
- [ ] ë¡œê·¸?„ì›ƒ ??`clearAuthStorage()` ?¸ì¶œ (sb-*, supabase, auth-token ???œê±°)
- [ ] ?¸ì…˜ ?†ì„ ??APIê°€ null ë°˜í™˜) `clearAuthStorage()` ?¸ì¶œ

### 4. ?ˆì´?¸ë¦¬ë°?
- [ ] `POST /api/auth/login` ??IP??5??ë¶?ì´ˆê³¼ ??429
- [ ] 429 ?‘ë‹µ??`Retry-After` ?¤ë” ?¬í•¨
- [ ] ë¡œê·¸???±ê³µ ???´ë‹¹ IP ì¹´ìš´??ë¦¬ì…‹

### 5. OAuth ì½œë°±
- [ ] `GET /auth/callback?code=xxx` ??`route.ts`?ì„œ ?œë²„ `exchangeCodeForSession` ì²˜ë¦¬
- [ ] ?´ë¼?´ì–¸??`exchangeCodeForSession` ?œê±° (page.tsx ?? œ)

---

## ?˜ì • ?Œì¼ ëª©ë¡

| ?Œì¼ | ë³€ê²??´ìš© |
|------|----------|
| `lib/auth/rateLimit.ts` | ? ê·œ: ë©”ëª¨ë¦??ˆì´?¸ë¦¬ë°?(5??ë¶? |
| `lib/auth/clearStorage.ts` | ? ê·œ: localStorage sb-* ???œê±° |
| `lib/auth/client.ts` | ? ê·œ: login(), logout() ?¨ì¼ ?¨ìˆ˜ |
| `app/api/auth/login/route.ts` | ? ê·œ: ?œë²„ ë¡œê·¸??+ ?ˆì´?¸ë¦¬ë°?|
| `app/api/auth/logout/route.ts` | ? ê·œ: ?œë²„ ë¡œê·¸?„ì›ƒ |
| `app/api/auth/session/route.ts` | ? ê·œ: ì¿ í‚¤ ê¸°ë°˜ ?¸ì…˜ + admin ?µì…˜ |
| `app/auth/callback/route.ts` | ? ê·œ: OAuth ì½”ë“œ êµí™˜ (?œë²„) |
| `app/auth/callback/page.tsx` | ?? œ |
| `components/auth/AuthProvider.tsx` | API ê¸°ë°˜ ?¸ì…˜/ë¡œê·¸?„ì›ƒ, clearStorage |
| `components/auth/LoginModal.tsx` | login() ?¬ìš©, onSuccess |
| `app/login/page.tsx` | login() ?¬ìš© |
| `app/admin/login/page.tsx` | login() ?¬ìš© |
| `context/AuthContext.tsx` | API ?¸ì…˜, API ë¡œê·¸?„ì›ƒ |
