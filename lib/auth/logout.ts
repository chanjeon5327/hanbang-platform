import { supabase } from './supabaseClient';

export async function hardLogout() {
  try {
    // 1) Supabase 세션 종료 (진짜 로그아웃)
    await supabase.auth.signOut();
  } finally {
    // 2) 보조 캐시 제거 (있다면)
    localStorage.removeItem('hb_user');
    localStorage.removeItem('wallet_connected');
  }

  // 3) 강제 새로고침 (상태 잔존 차단)
  window.location.href = '/';
}
