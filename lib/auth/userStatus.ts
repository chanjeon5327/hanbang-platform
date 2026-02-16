/**
 * 유저 상태머신: NEW → KYC_REQUIRED → KYC_SUBMITTED → KYC_APPROVED → ONBOARDING_REQUIRED → ACTIVE
 * ACTIVE가 아니면 투자/주문/지갑 핵심 액션 제한 (읽기만 허용)
 */

export type UserStatus =
  | 'NEW'
  | 'KYC_REQUIRED'
  | 'KYC_SUBMITTED'
  | 'KYC_APPROVED'
  | 'ONBOARDING_REQUIRED'
  | 'ACTIVE';

export const USER_STATUS_ORDER: UserStatus[] = [
  'NEW',
  'KYC_REQUIRED',
  'KYC_SUBMITTED',
  'KYC_APPROVED',
  'ONBOARDING_REQUIRED',
  'ACTIVE',
];

export function isActive(status: string | null | undefined): boolean {
  return status === 'ACTIVE';
}

export function getRedirectPath(status: string | null | undefined): string | null {
  if (!status || isActive(status)) return null;
  switch (status) {
    case 'NEW':
    case 'KYC_REQUIRED':
      return '/kyc';
    case 'KYC_SUBMITTED':
      return '/kyc'; // 승인 대기 안내
    case 'KYC_APPROVED':
    case 'ONBOARDING_REQUIRED':
      return '/onboarding';
    default:
      return '/kyc';
  }
}
