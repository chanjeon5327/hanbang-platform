# Supabase Database Setup

## 📋 개요

이 폴더는 HANBANG 플랫폼의 Supabase 데이터베이스 스키마와 마이그레이션을 관리합니다.

## 🚀 초기 설정

### 1. Supabase 프로젝트 생성

1. [Supabase Dashboard](https://app.supabase.com)에 접속
2. 새 프로젝트 생성
3. 프로젝트 설정에서 다음 정보 확인:
   - Project URL
   - Anon Key
   - Service Role Key (서버 사이드에서만 사용)

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수를 추가하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. 데이터베이스 스키마 적용

#### 방법 1: Supabase Dashboard 사용 (권장)

1. Supabase Dashboard → SQL Editor로 이동
2. `supabase/schema.sql` 파일의 전체 내용을 복사하여 실행
3. 실행 후 모든 테이블과 함수가 생성되었는지 확인

#### 방법 2: Supabase CLI 사용

```bash
# Supabase CLI 설치 (아직 설치하지 않은 경우)
npm install -g supabase

# Supabase 프로젝트 연결
supabase link --project-ref your-project-ref

# 마이그레이션 실행
supabase db push
```

## 📊 데이터베이스 구조

### 주요 테이블

1. **users** - 사용자 프로필 정보
2. **projects** - 투자 상품 정보
3. **investments** - 투자 기록
4. **transactions** - 거래 내역
5. **wallets** - 지갑/예수금 정보
6. **notifications** - 알림
7. **kyc_verifications** - KYC 인증 정보

### 자동화 기능

- **회원가입 시 자동 프로필 생성**: `handle_new_user()` 함수가 `auth.users`에 새 사용자가 생성될 때 자동으로 `public.users`와 `wallets` 레코드를 생성합니다.
- **투자 완료 시 자동 업데이트**: `handle_investment_completed()` 함수가 투자 상태가 'completed'로 변경될 때 프로젝트 금액과 지갑 잔액을 자동으로 업데이트합니다.

## 🔒 보안 (RLS)

모든 테이블에 Row Level Security (RLS)가 활성화되어 있으며, 사용자는 자신의 데이터만 조회/수정할 수 있습니다.

## 📝 타입 생성

Supabase 타입을 자동으로 생성하려면:

```bash
# Supabase CLI 사용
supabase gen types typescript --project-id your-project-id > lib/supabase/types.ts
```

또는 Supabase Dashboard의 Settings → API → TypeScript Types에서 생성할 수 있습니다.

## 🔄 마이그레이션 관리

새로운 마이그레이션을 추가할 때:

1. `supabase/migrations/` 폴더에 새 SQL 파일 생성
2. 파일명 형식: `YYYYMMDDHHMMSS_description.sql`
3. 변경사항을 명확하게 문서화

## ⚠️ 주의사항

- 프로덕션 환경에서는 반드시 백업 후 마이그레이션을 실행하세요.
- RLS 정책을 수정할 때는 모든 사용자 시나리오를 테스트하세요.
- Trigger 함수는 `SECURITY DEFINER`로 실행되므로 신중하게 작성하세요.

