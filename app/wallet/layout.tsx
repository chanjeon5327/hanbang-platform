import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { WalletGuard } from '@/components/auth/WalletGuard';

/**
 * /wallet 서버 + 클라이언트 이중 인증 가드
 * - 서버: 로그인 안 된 상태에서 /wallet/* 접근 시 /login으로 리다이렉트
 * - 클라이언트: WalletGuard로 추가 검증
 */
export default async function WalletLayout({
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
