# 2일 스프린트 체크리스트

> 기준 커밋: `d3f2396` (feat: ledger insert-only 봉인 및 orders user_id 기준 통일)  
> 작성일: 2026-02-14

---

## 📌 메인 (Home)

| # | 작업 | 완료 기준 | 관련 파일 |
|---|------|----------|-----------|
| 1 | 홈 레일 API 연동 | `/api/home/rails` 응답 기반 레일 렌더링, fallback 없이 정상 표시 | [app/api/home/rails/route.ts](../app/api/home/rails/route.ts), [app/page.tsx](../app/page.tsx) |
| 2 | 자산 요약 표시 | 로그인 시 totalAssets, returnRate, holdingsValue 정확히 표시 | [components/home/HomeView.tsx](../components/home/HomeView.tsx), [components/home/AssetCard.tsx](../components/home/AssetCard.tsx) |
| 3 | 하단 네비게이션 | 마켓/마이/홈 탭 전환 정상 동작 | [components/home/BottomNavigation.tsx](../components/home/BottomNavigation.tsx) |
| 4 | 게스트 히어로 | 비로그인 시 CTA(로그인/회원가입) 노출 | [components/home/GuestHero.tsx](../components/home/GuestHero.tsx) |
| 5 | 큐레이션/인터레스트 스트립 | InterestStrip, CurationSection 데이터 연동 | [components/home/InterestStrip.tsx](../components/home/InterestStrip.tsx), [components/home/CurationSection.tsx](../components/home/CurationSection.tsx) |

---

## 📌 로그인 (Login)

| # | 작업 | 완료 기준 | 관련 파일 |
|---|------|----------|-----------|
| 1 | 이메일/비밀번호 로그인 | Supabase signInWithPassword 성공 시 `/` 리다이렉트 | [app/login/page.tsx](../app/login/page.tsx) |
| 2 | 세션 유지 | localStorage 세션 안정 기록, 새로고침 시 유지 | [utils/supabase/client.ts](../utils/supabase/client.ts), [components/auth/AuthProvider.tsx](../components/auth/AuthProvider.tsx) |
| 3 | 로그인 모달 | 모달 형태 로그인 UI (필요 시) | [components/auth/LoginModal.tsx](../components/auth/LoginModal.tsx) |
| 4 | Auth 콜백 | OAuth 콜백 처리 | [app/auth/callback/page.tsx](../app/auth/callback/page.tsx) |
| 5 | 정지 유저 차단 | profiles.status=SUSPENDED 시 로그인 차단 및 자동 로그아웃 | [components/auth/AuthProvider.tsx](../components/auth/AuthProvider.tsx) |

---

## 📌 마켓 (Market)

| # | 작업 | 완료 기준 | 관련 파일 |
|---|------|----------|-----------|
| 1 | 마켓 목록 레일 | recommend/closing/popular/new 등 레일별 카드 렌더링 | [app/market/page.tsx](../app/market/page.tsx), [components/market/MarketCard.tsx](../components/market/MarketCard.tsx) |
| 2 | 검색/필터 | 검색어, 카테고리, 리스크, 수익구조 필터 적용 | [components/market/MarketFilterBar.tsx](../components/market/MarketFilterBar.tsx), [hooks/useDebounce.ts](../hooks/useDebounce.ts) |
| 3 | 개인화 정렬 | usePersonalizedSort 기반 추천 순서 | [hooks/usePersonalizedSort.ts](../hooks/usePersonalizedSort.ts) |
| 4 | 카드 → 상세 이동 | MarketCard 클릭 시 `/market/[id]` 이동 | [components/market/MarketCard.tsx](../components/market/MarketCard.tsx) |

---

## 📌 상세 (Detail)

| # | 작업 | 완료 기준 | 관련 파일 |
|---|------|----------|-----------|
| 1 | 상세 페이지 레이아웃 | 썸네일/영상, 작품명, 가격, 모집정보 표시 | [app/market/[id]/page.tsx](../app/market/[id]/page.tsx) |
| 2 | 청약/매수 탭 | TradingPanel에서 청약/매수 전환, 수량 입력 | [components/market/TradingPanel.tsx](../components/market/TradingPanel.tsx) |
| 3 | 모집 정보 (청약형) | progress, participants, remainingText 표시 | [components/market/MobilizationInfo.tsx](../components/market/MobilizationInfo.tsx) |
| 4 | 가격 차트/호가 | PriceChartSection, OrderBookPanel (2차거래형) | [components/market/PriceChartSection.tsx](../components/market/PriceChartSection.tsx), [components/market/OrderBookPanel.tsx](../components/market/OrderBookPanel.tsx) |
| 5 | 수익 정보 | RevenueInfoSection 렌더링 | [components/market/RevenueInfoSection.tsx](../components/market/RevenueInfoSection.tsx) |
| 6 | 모바일/데스크탑 분기 | 모바일 하단 Sticky, 데스크탑 우측 고정 패널 | [components/market/MobileOrderPanel.tsx](../components/market/MobileOrderPanel.tsx), [components/market/MobileOrderStickyBar.tsx](../components/market/MobileOrderStickyBar.tsx) |

---

## 📌 채팅 (Chat)

| # | 작업 | 완료 기준 | 관련 파일 |
|---|------|----------|-----------|
| 1 | 채팅 UI | MarketChatSection: 메시지 목록, 입력창, 본인 메시지 우측 정렬 | [components/market/MarketChatSection.tsx](../components/market/MarketChatSection.tsx) |
| 2 | 채팅 API 연동 | GET/POST `/api/chat` room_key 기반 메시지 조회/전송 | [app/api/chat/route.ts](../app/api/chat/route.ts) |
| 3 | 로그인 유저만 작성 | 비로그인 시 읽기만, 입력 비활성화 | [components/market/MarketChatSection.tsx](../components/market/MarketChatSection.tsx) |
| 4 | 관리자 공지 고정 | pinned 메시지 상단 고정 표시 | [components/market/MarketChatSection.tsx](../components/market/MarketChatSection.tsx) |
| 5 | 신고/차단 UI | 신고/차단 버튼, 확인 모달 | [components/market/MarketChatSection.tsx](../components/market/MarketChatSection.tsx) |
| 6 | 욕설 필터 | filterProfanity, containsProfanity 적용 | [lib/chat/profanityFilter.ts](../lib/chat/profanityFilter.ts) |

---

## 📌 마이 (MyPage)

| # | 작업 | 완료 기준 | 관련 파일 |
|---|------|----------|-----------|
| 1 | 마이페이지 레이아웃 | MyPageLayout 헤더 + 메인 영역 | [components/mypage/MyPageLayout.tsx](../components/mypage/MyPageLayout.tsx), [app/mypage/page.tsx](../app/mypage/page.tsx) |
| 2 | 자산 요약 | MyAssetSummary: 총자산, 보유 현황 | [components/mypage/MyAssetSummary.tsx](../components/mypage/MyAssetSummary.tsx) |
| 3 | 투자 목록 | MyInvestList: 보유 수익권 목록 | [components/mypage/MyInvestList.tsx](../components/mypage/MyInvestList.tsx) |
| 4 | 거래 내역 | MyHistory: 주문/결제 이력 | [components/mypage/MyHistory.tsx](../components/mypage/MyHistory.tsx) |
| 5 | 지갑 연동 | 지갑 페이지 이동 | [app/wallet/page.tsx](../app/wallet/page.tsx), [app/wallet/layout.tsx](../app/wallet/layout.tsx) |

---

## 📌 관리자 (Admin)

| # | 작업 | 완료 기준 | 관련 파일 |
|---|------|----------|-----------|
| 1 | 관리자 대시보드 | KPI(총매출/수수료/활성유저/모집성공률), 최근 정산 | [app/admin/page.tsx](../app/admin/page.tsx) |
| 2 | RBAC | requireAdmin, AdminRoute로 비관리자 접근 차단 | [lib/admin/requireAdmin.ts](../lib/admin/requireAdmin.ts), [components/AdminRoute.tsx](../components/AdminRoute.tsx) |
| 3 | 주문 관리 | orders 목록, total_amount_krw 표시 | [app/admin/orders/page.tsx](../app/admin/orders/page.tsx), [app/admin/orders/[order_id]/page.tsx](../app/admin/orders/[order_id]/page.tsx) |
| 4 | 정산 | settlement 목록, 상세, 확정 | [app/admin/settlement/page.tsx](../app/admin/settlement/page.tsx), [app/admin/settlement/[id]/page.tsx](../app/admin/settlement/[id]/page.tsx) |
| 5 | 채팅 모더레이션 | 채팅 삭제, 유저 정지 | [app/admin/chat/moderation/page.tsx](../app/admin/chat/moderation/page.tsx) |
| 6 | 공지/콘텐츠/KPC | notice, content, kpc 페이지 | [app/admin/notice/page.tsx](../app/admin/notice/page.tsx), [app/admin/content/page.tsx](../app/admin/content/page.tsx), [app/admin/kpc/page.tsx](../app/admin/kpc/page.tsx) |
| 7 | 관리자 로그인 | admin 전용 로그인 | [app/admin/login/page.tsx](../app/admin/login/page.tsx) |

---

## 📌 IA (Interest / 추천)

| # | 작업 | 완료 기준 | 관련 파일 |
|---|------|----------|-----------|
| 1 | 관심도 평가 API | POST `/api/interest/rate` item_id, score 저장 | [app/api/interest/rate/route.ts](../app/api/interest/rate/route.ts) |
| 2 | 온보딩 취향 파악 | InterestRail 평가 → userTaste 저장 | [app/onboarding/page.tsx](../app/onboarding/page.tsx), [components/interest/InterestRail.tsx](../components/interest/InterestRail.tsx), [stores/userTaste.ts](../stores/userTaste.ts) |
| 3 | Interest 상세 | `/interest/[id]` SharedThumb, 로그 이벤트 | [app/interest/[id]/page.tsx](../app/interest/[id]/page.tsx), [components/interest/SharedThumb.tsx](../components/interest/SharedThumb.tsx) |
| 4 | 홈 추천 연동 | user_interest_ratings 기반 레일 정렬 | [hooks/usePersonalizedSort.ts](../hooks/usePersonalizedSort.ts), [app/api/home/rails/route.ts](../app/api/home/rails/route.ts) |
| 5 | Interest 카드/프리뷰 | InterestCard, InterestPreview 컴포넌트 | [components/interest/InterestCard.tsx](../components/interest/InterestCard.tsx), [components/interest/InterestPreview.tsx](../components/interest/InterestPreview.tsx) |

---

## 📌 온보딩 (Onboarding)

| # | 작업 | 완료 기준 | 관련 파일 |
|---|------|----------|-----------|
| 1 | 온보딩 페이지 | 단계형 스텝퍼 + 취향 평가 레일 | [app/onboarding/page.tsx](../app/onboarding/page.tsx) |
| 2 | InterestRail 평가 | 콘텐츠별 점수 입력, userTaste 반영 | [components/interest/InterestRail.tsx](../components/interest/InterestRail.tsx) |
| 3 | 홈 이동 CTA | 평가 완료 후 홈으로 이동 | [app/onboarding/page.tsx](../app/onboarding/page.tsx) |

---

## 📌 PG 뼈대 (결제)

| # | 작업 | 완료 기준 | 관련 파일 |
|---|------|----------|-----------|
| 1 | 결제 요청 API | order_id 검증, PENDING 확인, redirect_url 반환 | [app/api/payments/request/route.ts](../app/api/payments/request/route.ts) |
| 2 | 결제 확정 API | pg_transaction_id, order_id 수신, rpc_confirm_payment → rpc_finalize_order | [app/api/payments/confirm/route.ts](../app/api/payments/confirm/route.ts) |
| 3 | 결제 테스트 페이지 | KCP 테스트 모드: `/order/pay` 시뮬레이션 | [app/order/pay/page.tsx](../app/order/pay/page.tsx) |
| 4 | 결제 리턴 페이지 | KCP 리다이렉트 후 confirm 호출 → success 이동 | [app/order/return/page.tsx](../app/order/return/page.tsx) |
| 5 | 결제 성공 페이지 | order_id 기반 성공 화면 | [app/order/success/page.tsx](../app/order/success/page.tsx) |
| 6 | 주문 생성 | place order → order_id 반환 | [app/api/orders/place/route.ts](../app/api/orders/place/route.ts) |
| 7 | 웹훅 (선택) | PG 웹훅 처리 | [app/api/webhook/payment/route.ts](../app/api/webhook/payment/route.ts) |

---

## 📋 요약

| 영역 | 작업 수 | 핵심 파일 |
|------|---------|-----------|
| 메인 | 5 | HomeView, home/rails API |
| 로그인 | 5 | login/page, AuthProvider |
| 마켓 | 4 | market/page, MarketCard, MarketFilterBar |
| 상세 | 6 | market/[id], TradingPanel, MobilizationInfo |
| 채팅 | 6 | MarketChatSection, api/chat |
| 마이 | 5 | MyPageLayout, MyAssetSummary, MyInvestList |
| 관리자 | 7 | admin/page, requireAdmin, settlement |
| IA | 5 | interest/rate API, InterestRail, userTaste |
| 온보딩 | 3 | onboarding/page, InterestRail |
| PG뼈대 | 7 | payments/request, payments/confirm, order/pay |

---

*파일 경로는 레포 루트 기준 상대 경로입니다.*
