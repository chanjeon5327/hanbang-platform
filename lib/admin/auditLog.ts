/**
 * 관리자 감사 로그
 * 모든 관리자 버튼/행위는 이 함수로 기록
 */
export type AuditAction =
  | 'CONTENT_APPROVE'
  | 'CONTENT_REJECT'
  | 'CONTENT_FORCE_DELETE'
  | 'SETTLEMENT_CONFIRM'
  | 'CHAT_DELETE'
  | 'CHAT_USER_SUSPEND'
  | 'REPORT_RESOLVE'
  | 'KPC_GRANT'
  | 'NOTICE_CREATE'
  | 'USER_SUSPEND'
  | 'USER_ACTIVATE';

export type AuditTargetType = 'content' | 'settlement' | 'chat_message' | 'report' | 'user' | 'notice';

export async function logAdminAction(params: {
  adminId: string;
  action: AuditAction;
  targetType: AuditTargetType;
  targetId: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    await fetch('/api/admin/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        admin_id: params.adminId,
        action: params.action,
        target_type: params.targetType,
        target_id: params.targetId,
        metadata: params.metadata ?? {},
      }),
    });
  } catch (e) {
    console.error('Audit log failed:', e);
  }
}
