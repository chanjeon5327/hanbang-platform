# HANBANG User Journey Flow

> 유저 + 마이페이지 + 판매자 + 관리자 전체 흐름 (Mermaid)

---

## 1) 전체 플로우차트

```mermaid
flowchart TD
  %% =========================
  %% INVESTOR / USER JOURNEY
  %% =========================
  A[유입: 광고/검색/공유링크] --> B[메인/랜딩\n넷플릭스 레일 + 토스 톤]
  B --> C{로그인 상태?}
  C -- 아니오 --> L[/login 또는 LoginModal]
  L --> L1[이메일/소셜 OAuth]
  L1 --> C

  C -- 예 --> O{첫 방문/온보딩 완료?}
  O -- 아니오 --> OB[채널평가 온보딩\n채널평가 온보딩]
  OB --> OB1[취향벡터 생성\ntaste_score 등]
  OB1 --> R[개인화 레일/추천]
  O -- 예 --> R

  R --> S[탐색\n레일/카테고리/검색]
  S --> D[상품 상세\n설명/지표/리스크/CTA]
  D --> T[거래 화면 업비트형\n헤더/차트/호가/주문패널/스티키]
  T --> X{매수/매도?}
  X -- 아니오 --> S
  X -- 예 --> U[주문 입력\n지정가/시장가/수량]
  U --> U1[주문 생성\norders: created]

  U1 --> P{KRW 결제 필요?}
  P -- 예 --> K[PG 결제 KCP\n또는 /api/payment/stub]
  K --> K1[서버 검증\nrpc_confirm_payment]
  K1 --> Z[상태 전이\npaid → completed]
  P -- 아니오 --> Z

  Z --> G[원장 자동기록\nCASH_DEBIT + ASSET_CREDIT]
  G --> H[/order/success\n주문ID/상태]
  H --> MY[마이페이지]
  H --> W[/wallet]

  %% =========================
  %% MY PAGE
  %% =========================
  subgraph MYPAGE[마이페이지 투자자 허브]
    MY --> MY1[내 자산 요약\nKRW 잔고/평가손익/보유수익권]
    MY --> MY2[보유 자산\n상품별 수량/평단/평가]
    MY --> MY3[주문 내역\npending/paid/completed]
    MY --> MY4[원장 내역\nledger_entries]
    MY --> MY5[입금/출금\n상태/주의/수수료]
    MY --> MY6[관심목록/알림]
    MY --> MY7[프로필/보안/설정]
  end

  %% =========================
  %% WALLET
  %% =========================
  W --> WD[지갑 상세\n잔고/원장/입출금 CTA]
  WD --> T

  %% =========================
  %% SELLER JOURNEY
  %% =========================
  subgraph SELLER[판매자 크리에이터]
    S0[/creator/dashboard] --> S1[상품 등록/출품\n/creator/register]
    S1 --> S2[상품 관리\n상태/노출/수정]
    S2 --> S3[판매/주문 현황]
    S3 --> S4[정산 내역/정산 상태\nseller_settlement_daily/monthly]
    S4 --> S5[정산 요청/정보]
  end

  %% =========================
  %% ADMIN / SETTLEMENT
  %% =========================
  subgraph ADMIN[관리자 주문·정산·감사]
    A0[/admin] --> A1[주문 관리\n/admin/orders/order_id]
    A0 --> A2[정산 관리\n/admin/settlement]
    A2 --> A3[정산 배치 생성/조회]
    A3 --> A4[정산 확정 RPC\nrpc_admin_confirm_settlement]
    A4 --> A5[orders.status = settled]
    A5 --> A6[ledger_posted_at 기록]
    A6 --> A7[감사로그 admin_audit_logs]
    A7 --> A8[재수정 불가]
    A0 --> A9[상품/판매자 심사]
  end
```

---

## 2) 실제 라우트 매핑

| 플로우 노드 | 실제 라우트 | 파일 |
|-------------|-------------|------|
| 메인/랜딩 | `/` | `app/page.tsx` |
| 로그인 | `/login` | `app/login/page.tsx` |
| 온보딩 | `/onboarding` | `app/onboarding/page.tsx` |
| 거래 상세 | `/market/[id]` | `app/market/[id]/page.tsx` |
| 주문 생성 | POST `/api/orders/place` | `app/api/orders/place/route.ts` |
| 결제 스텁 | POST `/api/payment/stub` | `app/api/payment/stub/route.ts` |
| PG 웹훅 | POST `/api/webhook/payment` | `app/api/webhook/payment/route.ts` |
| 주문 성공 | `/order/success?order_id=` | `app/order/success/page.tsx` |
| 지갑 | `/wallet` | `app/wallet/page.tsx` |
| 마이페이지 | `/mypage` | `app/mypage/page.tsx` |
| 판매자 대시 | `/creator/dashboard` | `app/creator/dashboard/page.tsx` |
| 관리자 정산 | `/admin/settlement` | `app/admin/settlement/page.tsx` |
| 관리자 주문 | `/admin/orders/[order_id]` | `app/admin/orders/[order_id]/page.tsx` |

---

## 3) 데이터 소스 연결

| 화면 | 데이터 소스 | API/테이블 |
|------|-------------|------------|
| 메인 레일 | `content_items`, `v_content_metrics_7d` | `/api/home/rails` |
| 주문 | `orders` | `rpc_place_order`, `rpc_confirm_payment` |
| 원장 | `ledger_entries` | `/api/wallet/ledger`, `tg_post_ledger_on_order_completed` |
| 마이페이지 | **미연결** | `MyAssetSummary` 등 하드코딩 |
| 관리자 정산 | `settlement_batches` | `rpc_admin_confirm_settlement` |
| 판매자 정산 | `seller_settlement_daily/monthly` | 뷰 (RLS 정책) |
