# PC_WIDTH_AFTER (PC 1440 확장 적용)

**적용 규칙**: `max-w-lg` → `max-w-lg lg:max-w-7xl`, `px-4` → `px-4 lg:px-8`

**변경 파일**:
- components/home/HomeView.tsx
- app/market/page.tsx (header, main)
- app/market/[id]/page.tsx (3곳)
- app/dashboard/page.tsx
- app/notifications/page.tsx
- app/kyc/page.tsx (2곳)
- components/layout/CompanyFooter.tsx
- components/Header.tsx

**결과**: PC(>=1024px)에서 max-w-7xl(1280px) 적용, 모바일은 max-w-lg(512px) 유지

**날짜**: 2026-02-17
