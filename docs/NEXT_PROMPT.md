# HANBANG ?¤ìŒ ?¤í”„ë¦°íŠ¸ ??Compose ?„ë¡¬?„íŠ¸

> ê°€??ê°€ì¹????¤ìŒ 1ê°??¤í”„ë¦°íŠ¸???„ë¡¬?„íŠ¸

---

## ?¤í”„ë¦°íŠ¸: ë§ˆì´?˜ì´ì§€ ?„ì„± (?¬ì???ˆë¸Œ)

### ëª©í‘œ

ë§ˆì´?˜ì´ì§€(`/mypage`)?ì„œ **???ì‚° ?”ì•½ / ë³´ìœ  ?ì‚° / ì£¼ë¬¸ ?´ì—­ / ?ì¥ ?´ì—­**??orders, ledger_entries ê¸°ë°˜?¼ë¡œ ?¤ì œ ?°ì´?°ë¡œ ?œì‹œ?œë‹¤.

### ë²”ìœ„

- **MyAssetSummary**: `GET /api/wallet/ledger` ?ëŠ” `orders` ì§‘ê³„ë¡?ì´??ì‚°Â·?ˆìˆ˜ê¸ˆÂ·í‰ê°€?ìµ ê³„ì‚°
- **MyInvestList**: `ledger_entries`(ASSET_CREDIT) ?ëŠ” `orders` + `products` ì¡°ì¸?¼ë¡œ ë³´ìœ  ?˜ìµê¶?ëª©ë¡
- **MyHistory**: `orders` ?ëŠ” `ledger_entries` ê¸°ë°˜ ì£¼ë¬¸/ê±°ë˜ ?´ì—­
- **ì£¼ë¬¸ ?´ì—­ / ?•ì‚° ?´ì—­ / ?…ì¶œê¸?ê¸°ë¡**: ë§í¬ ?´ë¦­ ???´ë‹¹ ?”ë©´?¼ë¡œ ?´ë™ (?ëŠ” ëª¨ë‹¬)

### ?œì•½

- DB ?¤í‚¤ë§?ê¸°ì¡´ RPC ìµœë???? ì?
- ë¡œì§ ë³€ê²?ìµœì†Œ??
- Tailwind ? ì?, ??UI ?¼ì´ë¸ŒëŸ¬ë¦?ì¶”ê? ê¸ˆì?
- ëª¨ë°”???°ì„ 

### ?„ë£Œ ê¸°ì?

- [ ] MyAssetSummary: ordersÂ·ledger ì§‘ê³„ ê¸°ë°˜ ì´??ì‚° ?œì‹œ
- [ ] MyInvestList: ?¤ì œ ë³´ìœ  ?ì‚°(?í’ˆë³??˜ëŸ‰/?‰ë‹¨) ?œì‹œ
- [ ] MyHistory ?ëŠ” ì£¼ë¬¸ ?´ì—­: orders(status ?¬í•¨) ëª©ë¡ ?œì‹œ
- [ ] ?ì¥ ?´ì—­: ledger_entries ?ëŠ” `/api/wallet/ledger` ?°ë™
- [ ] ?€??ë¹Œë“œ ?ëŸ¬ ?†ìŒ

### ì°¸ê³  ?Œì¼

| ?Œì¼ | ?©ë„ |
|------|------|
| `app/mypage/page.tsx` | ë§ˆì´?˜ì´ì§€ ì§„ì…??|
| `components/mypage/MyAssetSummary.tsx` | ?ì‚° ?”ì•½ ì¹´ë“œ |
| `components/mypage/MyInvestList.tsx` | ë³´ìœ  ?˜ìµê¶?ëª©ë¡ |
| `components/mypage/MyHistory.tsx` | ê¸°ë¡ ë©”ë‰´ |
| `app/api/wallet/ledger/route.ts` | ?ì¥ API (?¸ì…˜ ê¸°ë°˜) |
| `app/api/orders/[id]/route.ts` | ì£¼ë¬¸ ì¡°íšŒ |
| `supabase/migrations/202601290539_ledger.sql` | ledger_entries ?¤í‚¤ë§?|

---

## Cursor Compose ?„ë¡¬?„íŠ¸ (ë³µì‚¬??

```
[HANBANG ë§ˆì´?˜ì´ì§€ ?„ì„± ?¤í”„ë¦°íŠ¸]

ëª©í‘œ:
- /mypage?ì„œ ???ì‚°/ë³´ìœ /ì£¼ë¬¸/?ì¥??orders, ledger_entries ê¸°ë°˜ ?¤ì œ ?°ì´?°ë¡œ ?œì‹œ

ë²”ìœ„:
- MyAssetSummary: ordersÂ·ledger ì§‘ê³„ë¡?ì´??ì‚°/?ˆìˆ˜ê¸??‰ê??ìµ
- MyInvestList: ledger_entries(ASSET_CREDIT) ?ëŠ” orders+productsë¡?ë³´ìœ  ?˜ìµê¶?
- MyHistory: orders ëª©ë¡ ?ëŠ” ledger ê¸°ë°˜ ê±°ë˜ ?´ì—­
- ì£¼ë¬¸ ?´ì—­/?•ì‚° ?´ì—­/?…ì¶œê¸?ë§í¬ ???´ë‹¹ ?”ë©´ ?ëŠ” ëª¨ë‹¬

?œì•½:
- DB/RPC ìµœë???? ì?, ë¡œì§ ë³€ê²?ìµœì†Œ
- Tailwind ? ì?, ??UI ?¼ì´ë¸ŒëŸ¬ë¦?ê¸ˆì?
- ëª¨ë°”???°ì„ 

ì°¸ê³ : docs/SCREENS_MAP.md, docs/STATUS_BOARD.md, app/api/wallet/ledger/route.ts
```
