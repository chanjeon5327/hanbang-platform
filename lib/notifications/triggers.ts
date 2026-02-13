/**
 * 알림 트리거 placeholder 함수들
 * - 실제 구현 시 API 호출 또는 DB 트리거/Edge Function 연동
 */

// export async function notifyPriceChange(userId: string, contentId: string, changePercent: number) {
//   // POST /api/notifications { user_id, type: 'PRICE_CHANGE', reference_id: contentId, ... }
// }

// export async function notifyMobilization90(userIds: string[], contentId: string) {
//   // 마감 90% 도달 시 관심 등록 유저에게 알림
// }

// export async function notifyDeadlineSoon(userIds: string[], contentId: string, remainingDays: number) {
//   // 마감 임박 알림
// }

// export async function notifyChatReply(userId: string, messageId: string, contentId: string) {
//   // 채팅 답변 시 원 작성자에게 알림
// }

/** 마감 90% 도달 시 알림 트리거 - MobilizationInfo 또는 상세 페이지에서 호출 */
export function triggerMobilization90(_contentId: string, _progress: number) {
  // if (progress >= 90) {
  //   notifyMobilization90(interestedUserIds, contentId);
  // }
}

/** 가격 변동 트리거 placeholder */
export function triggerPriceChange(_contentId: string, _prevPrice: number, _newPrice: number) {
  // const changePercent = ((newPrice - prevPrice) / prevPrice) * 100;
  // if (Math.abs(changePercent) >= threshold) {
  //   notifyPriceChange(interestedUserIds, contentId, changePercent);
  // }
}
