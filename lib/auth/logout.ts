// lib/auth/logout.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function logout() {
  // 1. Supabase 세션 종료 (핵심)
  await supabase.auth.signOut();

  // 2. 로컬 사용자 캐시 제거
  localStorage.removeItem("hb_user");

  // 3. 안전을 위해 전체 스토리지 정리 (선택)
  // localStorage.clear();

  // 4. 로그인 페이지로 이동
  window.location.href = "/login";
}
