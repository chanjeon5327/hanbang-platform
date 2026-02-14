# 개발 노트

## 샘플 상품 개수 확인

### Supabase SQL Editor에서 실행

```sql
-- 활성 콘텐츠(수익권) 개수
SELECT count(*) AS active_items FROM public.content_items WHERE status='active';

-- products 테이블 개수
SELECT count(*) AS products FROM public.products;
```

### 로컬 API로 확인

`scripts/print-sample-count.mjs` 실행:

```bash
node scripts/print-sample-count.mjs
```

로컬 서버(`pnpm dev`)가 떠 있는 상태에서 `/api/market/all?limit=200` 호출 후 `items.length`를 콘솔에 출력한다.
