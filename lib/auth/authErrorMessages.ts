/**
 * Supabase auth 에러를 사용자 친화적 메시지로 변환
 */
export function toUserFriendlyAuthError(message: string | undefined, fallback: string): string {
  if (!message || typeof message !== 'string') return fallback;
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials') || m.includes('invalid_credentials')) {
    return '이메일 또는 비밀번호가 일치하지 않습니다.';
  }
  if (m.includes('email not confirmed') || m.includes('email_not_confirmed')) {
    return '이메일 인증이 필요합니다. 메일함을 확인해 주세요.';
  }
  if (m.includes('user already registered') || m.includes('already registered')) {
    return '이미 가입된 이메일입니다. 로그인을 시도해 주세요.';
  }
  if (m.includes('password') && m.includes('weak')) {
    return '비밀번호가 너무 약합니다. 6자 이상, 영문·숫자 조합을 권장합니다.';
  }
  if (m.includes('rate limit') || m.includes('too many')) {
    return '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.';
  }
  return message.length > 80 ? fallback : message;
}
