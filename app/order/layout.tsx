import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { WalletGuard } from '@/components/auth/WalletGuard';

/**
 * /order 보호 레이아웃
 * - 세션 없으면 /login으로 리다이렉트
 */
export default async function OrderLayout({
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
