# 홈/상세 액션 버튼 전면 활성화 1차 보고

## 1. 버튼 분류표

### 홈 버튼 목록 / 최종 동작

| 위치 | 버튼/CTA | 분류 | 최종 동작 |
|------|----------|------|----------|
| HeroCinematic | 투자 시작 | /market 이동 | Link → /market |
| HeroCinematic | 둘러보기 | /market 이동 | Link → /market |
| MarketTickerBar | 티커 항목 | 상세 이동 | Link → /market/[id] |
| CurationRail | 마켓 전체 | /market 이동 | Link → /market |
| CurationRail | 카드 | 상세 이동 | Link → /market/[id] |
| HomeV6 | 전체 마켓 | /market 이동 | Link → /market |
| OverlayRecoCard | 카드 | 상세 이동 | Link → /market/[id] |
| MyAssetCard | 가입하기 | /login 이동 | Link → /login?mode=signup&redirect=/ |
| MyAssetCard | 로그인 | /login 이동 | Link → /login?redirect=/ |
| MyAssetCard | 지갑 보기 | /wallet 이동 | Link → /wallet |
| MyAssetCard | 마켓 보기 | /market 이동 | Link → /market |
| HallyuIndexSection | (표시 전용) | - | 버튼 없음 |
| MarketMoodStrip | (표시 전용) | - | div 카드, 클릭 없음 |
| DeadlineRail | 전체보기 | /market 이동 | Link → /market |
| DeadlineRail | 카드 | 상세 이동 | Link → /market/[id] |
| NewsSection | 더보기 | /notice 이동 | Link → /notice |
| NewsSection | 뉴스 카드 | 외부 링크 | a href → 외부 URL |

### 상세 버튼 목록 / 최종 동작

| 위치 | 버튼/CTA | 분류 | 최종 동작 |
|------|----------|------|----------|
| 상세 헤더 | 로그인 | /login 이동 | Link → /login?redirect=현재경로 |
| 상세 헤더 | 회원가입 | /login 이동 | Link → /login?mode=signup&redirect=현재경로 |
| 상세 헤더 | 마켓 | /market 이동 | Link → /market |
| SegTabs | 살까말까/지금얼마/거래하기 | 탭 전환 | onClick → setTab |
| 투자설명서 | 다운로드 | 실제 액션 | a href → /api/market/[id]/prospectus |
| 살까말까 | 지금 거래하기 | 탭 전환 | onClick → setTab('trade') |
| TradePanelUpbit | 구매/판매/주문수정/체결내역 | 탭 전환 | Seg onChange |
| TradePanelUpbit | KYC 인증하기 | /kyc 이동 | Link → /kyc |
| TradePanelUpbit | 구매하기 (비로그인) | /login 이동 | window.location → /login?redirect=현재경로 |
| TradePanelUpbit | 구매하기 (로그인) | 준비중 토스트 | toast('거래 기능 준비 중입니다.') |
| TradePanelUpbit | 판매하기 (비로그인) | /login 이동 | window.location → /login?redirect=현재경로 |
| TradePanelUpbit | 판매하기 (로그인, KYC 미완료) | /kyc 이동 + 토스트 | toast + router.push('/kyc') |
| TradePanelUpbit | 판매하기 (로그인, KYC 완료) | 준비중 토스트 | toast('거래 기능 준비 중입니다.') |
| OrderBookMiniUpbit | 호가 클릭 | 가격 선택 | onPickPrice → setPrice |

## 2. 수정 파일 목록

- components/home/NewsSection.tsx
- components/market/TradePanelUpbit.tsx
- hooks/useActionGate.ts (신규)

## 3. 새로 만든 파일 목록

- hooks/useActionGate.ts
- docs/BUTTON_ACTIVATION_REPORT.md

## 4. 파일별 핵심 변경사항

- **NewsSection**: "더보기" button → Link to /notice
- **TradePanelUpbit**: useToast, useRouter 추가. 구매/판매 클릭 시: 비로그인→/login, KYC 필요→토스트+/kyc, 그 외→토스트 "거래 기능 준비 중입니다."
- **useActionGate**: 로그인 필요 여부, loginHref, kycHref, walletHref 반환 (향후 확장용)

## 5. 실제 화면 기준 결과

### 홈
- 모든 Link/버튼 클릭 시 페이지 이동 또는 외부 링크 동작
- "더보기" 클릭 시 /notice 이동
- MyAssetCard 가입/로그인 → /login

### 상세
- 구매하기/판매하기 클릭 시: 비로그인→/login, KYC 필요→토스트+/kyc, 그 외→토스트
- 반응 없는 버튼 0개

## 6. 검증 결과

- pnpm run typecheck: 통과
- pnpm build: 통과

## 7. 남은 TODO

1. useActionGate를 다른 컴포넌트에서 활용해 분기 통일
2. MarketDetailV3 사용 경로가 있으면 동일 규칙 적용
3. FloatingSupportDock chat/1:1 링크 로그인 필요 여부 검토
4. MarketMoodStrip 타일 클릭 시 /market 필터 연동 (선택)
5. OrderBookMiniUpbit 호가 클릭 시 비로그인 분기 (현재는 가격만 설정, 주문은 구매하기에서 처리)
