/**
 * 관리자 설정 (환경변수)
 * NEXT_PUBLIC_ADMIN_EMAILS: comma-separated email list.
 *   - If set: those emails are granted admin access regardless of DB role.
 *   - If empty: ONLY users with profiles.role='ADMIN' in the database can be admin.
 *
 * IMPORTANT: if NEXT_PUBLIC_ADMIN_EMAILS is not set AND no DB user has role='ADMIN',
 * no one can approve KYC or access the admin panel.
 * Set at least one of these two paths before deploying to production.
 */
const ADMIN_EMAILS_RAW = process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? '';
export const ADMIN_EMAILS: string[] = ADMIN_EMAILS_RAW
  ? ADMIN_EMAILS_RAW.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean)
  : [];

if (ADMIN_EMAILS.length === 0 && typeof window === 'undefined') {
  // Server-side warning only — not an error, because DB role is the fallback.
  console.warn(
    '[admin/env] NEXT_PUBLIC_ADMIN_EMAILS is not set. ' +
    'Admin access relies solely on profiles.role=\'ADMIN\' in the database. ' +
    'If no DB user has that role, the admin panel and KYC approval will be inaccessible.'
  );
}

export function isAdminEmail(email: string | undefined): boolean {
  if (!email) return false;
  if (ADMIN_EMAILS.length > 0) return ADMIN_EMAILS.includes(email.toLowerCase());
  return false;
}
