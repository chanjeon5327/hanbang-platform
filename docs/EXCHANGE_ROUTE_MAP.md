# 거래소형 상세(차트/호가/체결) 라우트 존재 증거

**목적**: MobilePriceChart, OrderBook, TradeHistoryRealtime, TradingPanelV2가 실제로 어느 page.tsx에서 렌더되는지 import chain 추적

---

## 1. 컴포넌트별 사용처

### MobilePriceChart
| 파일 | 사용 여부 | 비고 |
|------|-----------|------|
| components/market/[id]/page.tsx | ✅ 사용 | `import MobilePriceChart` |
| app/market/[id]/page.tsx | ❌ 미사용 | 이 파일에서 import 없음 |

**결론**: `components/market/[id]/page.tsx`에서만 사용. **해당 컴포넌트는 app 라우트에서 import되지 않음** → 데드 코드 경로.

### OrderBook (OrderBookSummary, OrderBookPanel)
| 파일 | 사용 여부 | 비고 |
|------|-----------|------|
| components/market/[id]/page.tsx | ✅ 사용 | `import { OrderBookSummary, OrderBookPanel }` |
| app/market/[id]/page.tsx | ❌ 미사용 | 이 파일에서 import 없음 |

**결론**: `components/market/[id]/page.tsx`에서만 사용. **해당 컴포넌트는 app 라우트에서 import되지 않음** → 데드 코드 경로.

### TradeHistoryRealtime
| 파일 | 사용 여부 | 비고 |
|------|-----------|------|
| components/market/ExchangeSection.tsx | ✅ 사용 | `import TradeHistoryRealtime` |
| app/market/[id]/page.tsx | 간접 | ExchangeSection을 통해 사용 |

**결론**: `app/market/[id]/page.tsx` → `ExchangeSection` → `TradeHistoryRealtime`

### TradingPanelV2
| 파일 | 사용 여부 | 비고 |
|------|-----------|------|
| components/market/ExchangeSection.tsx | ✅ 사용 | `import TradingPanelV2` |
| app/market/[id]/page.tsx | 간접 | ExchangeSection을 통해 사용 |

**결론**: `app/market/[id]/page.tsx` → `ExchangeSection` → `TradingPanelV2`

### OrderBookRealtime (호가)
| 파일 | 사용 여부 | 비고 |
|------|-----------|------|
| components/market/ExchangeSection.tsx | ✅ 사용 | `import OrderBookRealtime` |
| app/market/[id]/page.tsx | 간접 | ExchangeSection을 통해 사용 |

**결론**: `app/market/[id]/page.tsx` → `ExchangeSection` → `OrderBookRealtime`

### PriceChartBlock (차트)
| 파일 | 사용 여부 | 비고 |
|------|-----------|------|
| components/market/ExchangeSection.tsx | ✅ 사용 | `import PriceChartBlock` |
| app/market/[id]/page.tsx | 간접 | ExchangeSection을 통해 사용 (거래 가능 시) |

**결론**: `app/market/[id]/page.tsx` → `ExchangeSection` → `PriceChartBlock`

---

## 2. Import Chain (실제 라우트)

```
app/market/[id]/page.tsx (라우트: /market/[id])
  └─ isTradable && sharePriceUsd != null 일 때
     └─ ExchangeSection
          ├─ PriceChartBlock        (차트)
          ├─ OrderBookRealtime       (호가)
          ├─ TradeHistoryRealtime    (체결)
          ├─ TradingPanelV2          (주문 패널)
          ├─ PositionPanel
          └─ PriceHeader
```

**조건**: `product_type === 'DIVIDEND_TRADABLE'` 이고 `share_price_usd`가 존재할 때만 거래소 UI 렌더.

---

## 3. 데드 코드 경로 (미사용)

```
components/market/[id]/page.tsx
  ├─ MobilePriceChart
  ├─ OrderBookSummary
  └─ OrderBookPanel
```

**이 컴포넌트는 app/market/[id]/page.tsx에서 import되지 않음.**  
Next.js app 라우터는 `app/market/[id]/page.tsx`를 사용하므로, `components/market/[id]/page.tsx`는 현재 라우트에 연결되지 않은 별도 컴포넌트.

---

## 4. 결론: 거래소형 상세가 붙은 실제 URL

| 항목 | 값 |
|------|-----|
| **실제 URL** | `/market/[id]` |
| **조건** | `product_type === 'DIVIDEND_TRADABLE'` 인 content의 id |
| **캡처 검증** | `/market/1` 접근 시 차트·호가·체결 미노출 → id=1은 DIVIDEND_ONLY로 추정 |

**거래소형 상세가 붙은 실제 URL 1개**:  
`/market/[id]` (id = DIVIDEND_TRADABLE 타입 content_id. DB에 해당 타입 content가 존재할 때만 거래소 UI 노출)

DB에 DIVIDEND_TRADABLE 타입 content가 **없으면** → **없음** (모든 /market/[id] 접근 시 "거래 불가 · 매수 후 월배당만 수령"만 표시)
