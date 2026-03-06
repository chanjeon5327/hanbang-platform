import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { WalletGuard } from '@/components/auth/WalletGuard';

/**
 * /mypage 서버 + 클라이언트 이중 인증 가드
 * - 비로그인 시 /login으로 리다이렉트
 */
export default async function MyPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return <WalletGuard>{children}</WalletGuard>;
}
