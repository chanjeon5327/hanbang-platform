/**
 * 관리자 설정 (환경변수)
 * MASTER_ACCOUNT 하드코딩 대체
 * NEXT_PUBLIC_ADMIN_EMAILS: 이메일 목록(쉼표구분), 비어있으면 profiles.role='ADMIN'만 허용
 */
const ADMIN_EMAILS_RAW = process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? '';
export const ADMIN_EMAILS: string[] = ADMIN_EMAILS_RAW
  ? ADMIN_EMAILS_RAW.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean)
  : [];

export function isAdminEmail(email: string | undefined): boolean {
  if (!email) return false;
  if (ADMIN_EMAILS.length > 0) return ADMIN_EMAILS.includes(email.toLowerCase());
  return false;
}
