# lib/supabase/types.ts 분석 보고서

## 1. 현재 Database 타입 구조 점검

### 1.1 포함된 테이블 (7개)

| 테이블 | Row/Insert/Update | 용도 |
|--------|-------------------|------|
| `users` | ✓ | 사용자 기본 정보 (schema.sql 기반) |
| `projects` | ✓ | 프로젝트/상품 |
| `investments` | ✓ | 투자 내역 |
| `transactions` | ✓ | 입출금/거래 |
| `wallets` | ✓ | 지갑 잔액 |
| `notifications` | ✓ | 알림 |
| `kyc_verifications` | ✓ | KYC 인증 |

### 1.2 누락된 테이블 (실제 migrations/코드에서 사용 중)

| 테이블 | 사용처 | 용도 |
|--------|--------|------|
| `profiles` | AuthContext, requireAdmin, requireActiveUser, AuthProvider | Supabase Auth 확장 프로필 |
| `orders` | payments/request, orders/place, admin/orders, ab/assign-buy 등 | 주문/결제 |
| `products` | sellerProducts, publicProducts, MobileProductDetail | 상품 |
| `content_items` | home/rails | 콘텐츠 |
| `join_funnel` | funnel/join, ab/assign-cohort | 가입 퍼널 |
| `chat_messages_v2` | api/chat | 채팅 |
| `admin_audit_logs` | api/admin/audit | 관리자 감사 로그 |
| `settlement_batches` | admin/settlement | 정산 배치 |
| `ledger_entries` | wallet/ledger, admin/orders | 원장 |
| `payments` | payments/confirm | 결제 기록 |
| `v_join_to_buy_7d` | admin/kpi, ab/assign-buy | 뷰 |
| 기타 | admin_rail_config, admin_home_config, market_state, trades 등 | 각종 기능 |

### 1.3 Views, Functions, Enums

- `Views`: `[_ in never]: never` — 뷰 타입 없음
- `Functions`: `[_ in never]: never` — RPC 함수 타입 없음
- `Enums`: `[_ in never]: never` — enum 타입 없음

---

## 2. orders, profiles가 빠져 있는 이유

### 2.1 types.ts의 출처

`types.ts`는 **supabase/schema.sql**과 1:1 대응합니다.

- `schema.sql`: users, projects, investments, transactions, wallets, notifications, kyc_verifications
- `types.ts`: 동일 7개 테이블만 정의

### 2.2 schema.sql vs migrations 불일치

| 구분 | users | profiles | orders |
|------|-------|----------|--------|
| schema.sql | ✓ (설계 문서) | ✗ | ✗ |
| migrations | ✗ | ✓ (20241220) | ✓ (20260129, XXXX) |
| types.ts | ✓ | ✗ | ✗ |

**결론**: `types.ts`는 `schema.sql` 기반으로 작성되었고, 이후 migrations로 추가된 `profiles`, `orders` 등은 반영되지 않았습니다.

### 2.3 설계 이력 추정

1. **초기**: schema.sql 설계 (users, projects, investments 등 — 크라우드펀딩 스타일)
2. **Supabase 도입**: profiles 테이블 추가 (auth.users 확장, 20241220)
3. **결제 도입**: orders, ledger, payments 등 추가 (20260129~)
4. **타입 미동기화**: types.ts는 1단계에서 멈춤, 2~3단계 migrations 미반영

---

## 3. 자동 생성 vs 수동 타입 혼재 여부

### 3.1 자동 생성 형식 사용

- `Json` 타입, `Database` 인터페이스 구조 (Row/Insert/Update)
- Supabase `gen types` 출력 형식과 동일

### 3.2 수동/부분 작성 징후

- 상단 주석: `--project-id YOUR_PROJECT_ID` — 플레이스홀더
- `package.json`에 `supabase` CLI 없음
- `config.toml` 없음 (supabase init 미실행 가능성)
- schema.sql과 완전 일치 → schema.sql을 보고 수동 작성했을 가능성

### 3.3 판단

**수동 작성**에 가깝습니다. `gen types`를 한 번 실행한 뒤 손수 편집했거나, schema.sql을 보고 직접 작성한 것으로 보입니다. 자동 생성만 사용했다면 migrations 기준으로 모든 테이블이 포함되어 있어야 합니다.

---

## 4. supabase gen types 재생성 필요성

### 4.1 재생성 권장

| 조건 | 권장 |
|------|------|
| Supabase 프로젝트 연결 가능 | ✓ `supabase gen types typescript --project-id <REF> --schema public > lib/supabase/types.ts` |
| 로컬 DB만 사용 | ✓ `supabase start` 후 `supabase gen types typescript --local > lib/supabase/types.ts` |

### 4.2 재생성 전 준비

1. **Supabase CLI 설치**
   ```bash
   npm install -D supabase
   ```

2. **프로젝트 연결**
   - `supabase link --project-ref <PROJECT_REF>` (원격)
   - 또는 로컬: `supabase start`

3. **마이그레이션 적용 확인**
   - 원격: Supabase Dashboard에서 migrations 반영 여부 확인
   - 로컬: `supabase db reset` 후 `gen types`

### 4.3 재생성 시 주의

- 기존 수동 타입 단언(예: `PaymentOrder`, `ProfileRole`) 제거 가능
- 생성된 타입이 migrations와 일치하면 `never` 추론 해소
- `schema.sql`과 migrations가 다르면, **migrations가 실제 스키마**이므로 gen types 결과를 우선

---

## 5. never 추론 방지 구조 개선안

### 5.1 단기 (gen types 재생성 전)

**Option A: 누락 테이블 수동 추가**

`lib/supabase/types.ts`의 `Tables`에 `profiles`, `orders` 등 누락 테이블을 migrations 기준으로 추가:

```typescript
// Tables 내부에 추가
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

**Option B: 타입 단언 유지 (현재 방식)**

- `PaymentOrder`, `ProfileStatus` 등 로컬 타입 + `as` 단언
- 장점: 수정 범위 작음
- 단점: 테이블 추가 시마다 수동 타입 필요, 타입과 실제 스키마 불일치 위험

### 5.2 중기 (권장): gen types 자동화

1. **스크립트 추가** (`package.json`):
   ```json
   "scripts": {
     "db:types": "supabase gen types typescript --project-id $SUPABASE_PROJECT_REF --schema public > lib/supabase/types.ts"
   }
   ```

2. **CI/CD에서 마이그레이션 후 타입 재생성**
   - 마이그레이션 적용 → `pnpm db:types` → 커밋

3. **pre-commit 또는 PR 체크**
   - migrations 변경 시 types.ts diff 확인

### 5.3 장기: Database 타입 완전성 검증

1. **사용 테이블 vs 정의 테이블 매칭**
   - `grep -r "\.from\('" --include="*.ts" --include="*.tsx"` 결과와 `Database['public']['Tables']` 키 비교
   - 누락 테이블 자동 탐지 스크립트

2. **strict 모드 + 타입 체크**
   - `tsconfig.json`의 `strict: true` 유지
   - `pnpm build`로 `never` 추론 등 타입 오류 조기 발견

3. **Views/Functions 타입**
   - `v_join_to_buy_7d` 등 뷰 사용 시 gen types에 Views 포함
   - RPC 호출 시 Functions 타입으로 인자/반환 타입 보장

---

## 요약

| 항목 | 현황 | 권장 조치 |
|------|------|-----------|
| types.ts 구조 | schema.sql 기반 7개 테이블 | gen types로 재생성 |
| orders/profiles 누락 | migrations에 있으나 types에 없음 | gen types 또는 수동 추가 |
| 자동/수동 혼재 | 수동 작성에 가까움 | gen types로 통일 |
| gen types 재생성 | 필요 | Supabase 연결 후 실행 |
| never 방지 | 단언으로 임시 대응 | gen types + CI 자동화로 근본 해결 |
