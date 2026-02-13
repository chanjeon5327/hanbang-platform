/**
 * 알림 타입 enum
 */
export const NOTIFICATION_TYPE = {
  PRICE_CHANGE: 'PRICE_CHANGE',
  MOBILIZATION_90: 'MOBILIZATION_90',
  DEADLINE_SOON: 'DEADLINE_SOON',
  SETTLEMENT_DONE: 'SETTLEMENT_DONE',
  CHAT_REPLY: 'CHAT_REPLY',
  KYC_APPROVED: 'KYC_APPROVED',
  NEWS_UPDATE: 'NEWS_UPDATE',
} as const;

export type NotificationType = (typeof NOTIFICATION_TYPE)[keyof typeof NOTIFICATION_TYPE];

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  PRICE_CHANGE: '가격 변동',
  MOBILIZATION_90: '모집 90% 도달',
  DEADLINE_SOON: '마감 임박',
  SETTLEMENT_DONE: '정산 완료',
  CHAT_REPLY: '채팅 답변',
  KYC_APPROVED: 'KYC 승인',
  NEWS_UPDATE: '뉴스 업데이트',
};
