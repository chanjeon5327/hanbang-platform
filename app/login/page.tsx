'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MessageCircle, Globe, Wallet } from 'lucide-react';
import { createClient } from '@/utils/supabase/client'; // ✅ 여기
import { useStore } from '@/context/StoreContext';

type RoleTab = 'investor' | 'creator';
type Mode = 'login' | 'signup';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useStore();

  const [activeTab, setActiveTab] = useState<RoleTab>('investor');
  const [mode, setMode] = useState<Mode>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState<string | null>(null);

  useEffect(() => {
    const sync = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      if (data.session) login();
    };
    sync();
  }, [login]);

  // 이하 로직 동일 (생략 없음, 기존 그대로)
  return <div>/* 기존 JSX 그대로 */</div>;
}
