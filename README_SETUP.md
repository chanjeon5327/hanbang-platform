# HANBANG Platform - 설정 가이드

## 🚀 빠른 시작

### 1. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수를 추가하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 2. Supabase 설정

1. [Supabase Dashboard](https://app.supabase.com)에서 프로젝트 생성
2. SQL Editor에서 `supabase/schema.sql` 파일의 내용 실행
3. Authentication → Providers에서 Google, Kakao 활성화
4. 각 Provider의 Client ID와 Secret 설정

### 3. 패키지 설치 및 실행

```bash
npm install
npm run dev
```

## 📋 구현된 기능

### ✅ 메인 랜딩 페이지 (`app/page.tsx`)
- 헤더: 로고 + 로그인/회원가입 버튼
- 히어로 섹션: "3초 만에 시작하는 웹툰/콘텐츠 투자"
- 상품 리스트: Supabase `projects` 테이블에서 데이터 조회
- 수익률 빨간색 강조 표시
- 카드 클릭 시 상세 페이지로 이동

### ✅ 로그인/회원가입 모달 (`components/auth/LoginModal.tsx`)
- 구글 로그인 버튼
- 카카오 로그인 버튼
- "3초 만에 시작하기" 문구
- Supabase Auth Social Login 연동

### ✅ 프로젝트 상세 페이지 (`app/projects/[id]/page.tsx`)
- 프로젝트 정보 표시
- 투자하기 버튼 (로그인 확인)
- 모집 진행률 시각화

## 🎨 사용된 기술

- **shadcn/ui**: 모던한 UI 컴포넌트
- **Supabase**: 인증 및 데이터베이스
- **Next.js 14**: App Router
- **TypeScript**: 타입 안정성
- **Tailwind CSS**: 스타일링

## 📝 다음 단계

1. Supabase 프로젝트 생성 및 스키마 적용
2. 소셜 로그인 Provider 설정 (Google, Kakao)
3. 환경 변수 설정
4. 개발 서버 실행 및 테스트

