# PC_WIDTH_BEFORE (max-w 제한 클래스)

**명령**: `rg -n "max-w-\[?512|max-w-sm|max-w-md|max-w-lg|max-w-xl|max-w-2xl|max-w-3xl|max-w-4xl" app components`

**대상 페이지 (우선순위)**:
- components/home/HomeView.tsx:56: max-w-lg (메인)
- app/market/page.tsx:71,150: max-w-lg (마켓)
- app/market/[id]/page.tsx:56,245,423: max-w-3xl (상세)
- app/dashboard/page.tsx:79: max-w-lg
- app/notifications/page.tsx:56: max-w-lg
- app/login/page.tsx:39: max-w-md
- app/kyc/page.tsx:37,46: max-w-2xl
- components/layout/CompanyFooter.tsx:23: max-w-lg
- components/Header.tsx:15: max-w-lg

**max-w-lg = 512px** → PC 1440에서 한 줄 고정처럼 보이는 원인

**날짜**: 2026-02-17
