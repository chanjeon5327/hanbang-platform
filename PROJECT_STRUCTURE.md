# HANBANG Platform - 프로젝트 구조

## 📁 폴더 구조

```
hanbang-platform/
├── app/                          # Next.js App Router
│   ├── active-invest/           # 투자 상품 목록/상세
│   ├── admin/                   # 관리자 대시보드
│   ├── feature/                 # 기능 소개 페이지
│   ├── login/                   # 로그인
│   ├── signup/                  # 회원가입
│   ├── wallet/                  # 지갑/자산 현황
│   ├── notice/                  # 공지사항
│   ├── layout.tsx              # 루트 레이아웃
│   ├── page.tsx                # 홈페이지
│   └── globals.css             # 전역 스타일
│
├── components/                   # 재사용 컴포넌트
│   ├── TopHeader.tsx           # 상단 헤더
│   └── BottomNav.tsx           # 하단 네비게이션
│
├── context/                      # React Context
│   └── StoreContext.tsx        # 전역 상태 관리
│
├── lib/                          # 유틸리티 라이브러리
│   └── supabase/               # Supabase 클라이언트
│       ├── client.ts           # 브라우저 클라이언트
│       ├── server.ts           # 서버 클라이언트
│       ├── middleware.ts       # 미들웨어 클라이언트
│       ├── types.ts            # TypeScript 타입
│       └── README.md           # 사용 가이드
│
├── supabase/                     # Supabase 설정
│   ├── schema.sql              # 데이터베이스 스키마
│   ├── migrations/             # 마이그레이션 파일
│   └── README.md               # Supabase 설정 가이드
│
├── middleware.ts                 # Next.js 미들웨어 (인증)
├── package.json                 # 의존성 관리
├── tsconfig.json                # TypeScript 설정
└── tailwind.config.js          # Tailwind CSS 설정
```

## 🗄️ 데이터베이스 스키마

### 주요 테이블

1. **users** - 사용자 프로필
   - 기본 정보 (id, email, name, avatar_url)
   - 인증 상태 (is_verified, kyc_status)
   - 소셜 로그인 정보

2. **projects** - 투자 상품
   - 상품 정보 (title, description, target_amount, yield_rate)
   - 상태 관리 (status: recruiting, closed, completed)
   - 카테고리 (kpop, drama, movie, youtube, etc.)

3. **investments** - 투자 기록
   - 투자자 정보 (user_id, project_id)
   - 투자 금액 및 주식 수 (amount, shares, price_per_share)
   - 상태 (pending, completed, cancelled)

4. **wallets** - 지갑/예수금
5. **transactions** - 거래 내역
6. **notifications** - 알림
7. **kyc_verifications** - KYC 인증

### 자동화 기능

- ✅ 회원가입 시 자동 프로필 생성 (Trigger)
- ✅ 투자 완료 시 자동 금액 업데이트 (Trigger)
- ✅ Row Level Security (RLS) 적용

## 🔐 인증 플로우

1. 사용자가 회원가입/로그인
2. `auth.users` 테이블에 레코드 생성
3. `handle_new_user()` Trigger가 자동 실행
4. `public.users`와 `wallets` 테이블에 자동 생성

## 📦 주요 의존성

- **Next.js 14** - React 프레임워크 (App Router)
- **TypeScript** - 타입 안정성
- **Tailwind CSS** - 스타일링
- **Supabase** - 백엔드 (Auth, Database, Storage)
- **Recharts** - 차트 시각화
- **Lucide React** - 아이콘

## 🚀 시작하기

1. 환경 변수 설정 (`.env.local`)
2. Supabase 스키마 적용 (`supabase/schema.sql`)
3. 패키지 설치: `npm install`
4. 개발 서버 실행: `npm run dev`

## 📝 다음 단계

- [ ] Supabase 프로젝트 생성 및 연결
- [ ] 환경 변수 설정
- [ ] 데이터베이스 스키마 적용
- [ ] 인증 플로우 구현
- [ ] 투자 기능 구현
- [ ] 관리자 기능 구현

