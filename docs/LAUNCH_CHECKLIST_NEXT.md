# 한방 플랫폼 런치 체크리스트 (NEXT)

> Market 큐레이션 + 상세 실데이터 + 관심/채팅/미디어 안정화 기준

---

## 1) Market 큐레이션 완료 기준

| # | 항목 | 상태 |
|---|------|------|
| 1 | /market 탭형 UI (전체/모두의 추천/마감임박/나의 관심/카테고리) | ☐ |
| 2 | 검색바 (프론트 필터) | ☐ |
| 3 | 2열 Grid 카드, InterestCard/RailCard 재사용 | ☐ |
| 4 | /api/market/popular, deadline, my-interests 페이지네이션 | ☐ |
| 5 | next_cursor 기반 더보기 | ☐ |
| 6 | my 탭 빈 상태: "관심이 없습니다" + CTA | ☐ |
| 7 | deadline 탭 빈 상태: "마감 예정이 없습니다" | ☐ |
| 8 | SectionHeader 전체보기 → /market?tab=xxx 연결 | ☐ |

---

## 2) 상세 실데이터 연결 완료 기준

| # | 항목 | 상태 |
|---|------|------|
| 1 | GET /api/market/item/[id] content_items 기반 | ☐ |
| 2 | title, creator_name, category, platform, thumbnail 실데이터 | ☐ |
| 3 | youtube_video_id / media_url 연동 | ☐ |
| 4 | price, change, progress fallback + TODO 정리 | ☐ |

---

## 3) 관심/채팅/미디어 안정화 기준

| # | 항목 | 상태 |
|---|------|------|
| 1 | POST /api/interests/toggle { contentId } → { ok, isInterested } | ☐ |
| 2 | user_interests RLS (insert/delete 본인만) | ☐ |
| 3 | 홈/마켓/상세 InterestCard·MarketGridCard 관심 버튼 | ☐ |
| 4 | 채팅 전송 실패 시 토스트/상태 개선 | ☐ |
| 5 | Realtime 구독 실패 시 폴링 fallback (10초) | ☐ |
| 6 | RATE_LIMIT 에러 시 "잠시 후 다시" 문구 | ☐ |
| 7 | SponsoredPickHero: eDuCxyhyx7g, cc_load_policy=0 | ☐ |
| 8 | 모바일 클릭 play/pause, 데스크탑 hover 재생 | ☐ |
| 9 | 화면 이탈 시 자동 pause (IntersectionObserver) | ☐ |

---

## 4) 성능 체크

| # | 항목 | 상태 |
|---|------|------|
| 1 | popular revalidate 300, deadline 60 | ☐ |
| 2 | popular_content_mv / get_popular_content_ids 활용 | ☐ |
| 3 | market API next_cursor 응답 | ☐ |
