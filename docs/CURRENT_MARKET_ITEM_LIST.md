# 현재 마켓/상세 아이템 목록

> 소스 파일: `lib/mock/marketItems.ts`  
> 썸네일: 전 종목 SVG 인라인 그라디언트 (data URI, `svgThumb()` 함수 생성)  
> 상세 경로: `/market/{slug}`

| # | 제목 | slug (id) | 크리에이터 | 카테고리 | 상세 경로 |
|---|------|-----------|-----------|---------|-----------|
| 1 | 블루웨이 시즌3 | `travel-j` | 여행가 제이 | 여행 | /market/travel-j |
| 2 | 라운지 나인 | `chim` | 침착맨 스튜디오 | 토크 | /market/chim |
| 3 | 총몇명 | `chong` | 코미디 팩토리 | 코미디 | /market/chong |
| 4 | 테이블 로그 | `muklab` | 먹방연구소 | 먹방 | /market/muklab |
| 5 | 스포츠픽 | `sports-pick` | 스포츠미디어랩 | 스포츠 | /market/sports-pick |
| 6 | K드라마 하이라이트 | `k-drama` | 스튜디오 웨이브 | 드라마 | /market/k-drama |
| 7 | 사운드 플로어 | `kpop-stage` | K-POP STAGE | 음악 | /market/kpop-stage |
| 8 | 푸드트립 | `food-trip` | 길 위의 맛 | 먹방 | /market/food-trip |
| 9 | 도시산책 | `city-walk` | 어반워크 | 여행 | /market/city-walk |
| 10 | 이슈토크 | `talk-issue` | 토크포인트 | 시사/토크 | /market/talk-issue |
| 11 | 게임연구실 | `game-lab` | 게임로직 | 게임 | /market/game-lab |
| 12 | 다큐NOW | `docu-now` | 스튜디오 리얼 | 다큐 | /market/docu-now |
| 13 | 코미디컷 | `comedy-cut` | 개그스튜디오 | 코미디 | /market/comedy-cut |
| 14 | 뷰티톡 | `beauty-talk` | 뷰티랩 크루 | 뷰티 | /market/beauty-talk |
| 15 | 키즈월드 | `kids-world` | 스튜디오 키즈 | 키즈 | /market/kids-world |
| 16 | 역사연구소 | `history-lab` | 역사미디어 | 교양 | /market/history-lab |
| 17 | 필름 하우스 | `cinema-buster` | 씨네클럽 | 영화 | /market/cinema-buster |
| 18 | 스포츠 LIVE | `sports-live` | 스포츠컴퍼니 | 스포츠 | /market/sports-live |
| 19 | 아시아여행 | `travel-asia` | 아시아로 | 여행 | /market/travel-asia |
| 20 | 먹스타 | `muk-star` | 먹킹 | 먹방 | /market/muk-star |

**총 20개 종목**

---

## 카테고리별 분류

| 카테고리 | 종목 수 | 종목명 |
|---------|---------|--------|
| 여행 | 3 | 블루웨이 시즌3, 도시산책, 아시아여행 |
| 먹방 | 3 | 테이블 로그, 푸드트립, 먹스타 |
| 코미디 | 2 | 총몇명, 코미디컷 |
| 스포츠 | 2 | 스포츠픽, 스포츠 LIVE |
| 토크/시사 | 2 | 라운지 나인, 이슈토크 |
| 드라마 | 1 | K드라마 하이라이트 |
| 음악 | 1 | 사운드 플로어 |
| 게임 | 1 | 게임연구실 |
| 다큐 | 1 | 다큐NOW |
| 뷰티 | 1 | 뷰티톡 |
| 키즈 | 1 | 키즈월드 |
| 교양 | 1 | 역사연구소 |
| 영화 | 1 | 필름 하우스 |

---

## 썸네일 현황

- **현재 방식**: 유튜브 대표 영상 썸네일 (`i.ytimg.com/vi/{VIDEO_ID}/hqdefault.jpg`)
- **매핑 문서**: `docs/YOUTUBE_THUMBNAIL_SOURCE_MAP.md` 참조
- **실제 이미지 교체 방법**: `marketItems.ts` 각 항목의 `thumbnail` 필드를 실제 이미지 경로로 교체
  ```ts
  thumbnail: '/images/market/travel-j.jpg',  // 예시
  ```
- **권장 이미지 비율**: 3:2 또는 16:9 (카드/리스트 표시 기준)
- **권장 크기**: 최소 600×400px, 웹 최적화 포맷(WebP 권장)

---

## 홈 노출 현황

| 홈 섹션 | 노출 종목 |
|---------|----------|
| 큐레이팅 레일 (CurationRail) | 1~10번 (처음 10개) |
| 지금 주목받는 콘텐츠 (OverlayRecoCard) | 1~4번 (처음 4개) |
| 마감 임박 (DeadlineRail) | deadlineHours 있는 종목만 (travel-j, chim, chong, muklab, game-lab, comedy-cut, muk-star, cinema-buster) |
