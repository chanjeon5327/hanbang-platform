# POST /api/orders/place 상태별 200/403 수동 검증 절차

스크립트 추가 없이 curl 또는 Node one-liner로 검증합니다.

---

## 사전 조건

- 로컬 서버 실행: `npm run dev` (예: http://localhost:3000)
- 테스트용 유저 2종:
  - A: profiles.status=NEW 또는 KYC_SUBMITTED 또는 ONBOARDING_REQUIRED (ACTIVE 아님)
  - B: profiles.status=ACTIVE + investor_profiles.kyc_status=APPROVED

---

## 1) 비로그인 → 401

```bash
curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3000/api/orders/place \
  -H "Content-Type: application/json" \
  -d '{"content_id":"test-product","amount":10000}'
```

**기대**: `401`

---

## 2) 로그인(ACTIVE 아님) → 403

1. 브라우저에서 로그인 (NEW 또는 KYC_SUBMITTED 또는 ONBOARDING_REQUIRED 유저)
2. 개발자도구 → Application → Cookies → `sb-`로 시작하는 쿠키 확인
   - Supabase 프로젝트별로 `sb-<project_ref>-auth-token` 형태 (project_ref는 Supabase 대시보드 URL에서 확인)
   - 또는 Network 탭에서 `/api/orders/place` 요청 시 전송되는 Cookie 헤더 전체를 복사
3. 아래 curl에서 `Cookie: ` 뒤에 그대로 붙여넣기:

```bash
curl -s -w "\nHTTP_CODE:%{http_code}" -X POST http://localhost:3000/api/orders/place \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-xxxxxxxxxx-auth-token=eyJ..." \
  -d '{"content_id":"test-product","amount":10000}'
```

**기대**: HTTP_CODE:403, 응답 JSON에 `STATUS_REQUIRED` 또는 `KYC_REQUIRED` 포함

---

## 3) 로그인(ACTIVE + KYC APPROVED) → 200 또는 400

1. ACTIVE + KYC APPROVED 유저로 로그인
2. 동일하게 Cookie 포함하여 curl 실행

```bash
curl -s -X POST http://localhost:3000/api/orders/place \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-<project>-auth-token=YOUR_COOKIE_VALUE" \
  -d '{"content_id":"실제존재하는content_id","amount":10000}'
```

**기대**:
- 유효한 content_id, 잔액 충분 시: HTTP 200, `ok: true` 또는 `order_id` 포함
- content_id 없음/잘못됨: 400 INVALID_PAYLOAD
- 잔액 부족: 400 INSUFFICIENT_FUNDS
- payment_method=pg 사용 시: 200 (order 생성)

---

## Node one-liner (비로그인 401만, 쿠키 없음)

```bash
node -e "fetch('http://localhost:3000/api/orders/place', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content_id: 'test', amount: 10000 }) }).then(async r => { const j = await r.json().catch(()=>({})); console.log('HTTP', r.status, JSON.stringify(j).slice(0,120)); })"
```

**기대**: 비로그인 시 `HTTP 401 {...}`.
로그인 상태 403/200 검증은 curl로 Cookie 포함하여 수행.
