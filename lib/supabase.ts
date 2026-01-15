import { createClient } from '@supabase/supabase-js';

// 1. 환경 변수 가져오기 (없으면 빈 문자열 반환)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// 2. 안전장치: 키가 없으면 빌드 에러를 내지 않고, 경고만 남김
if (!supabaseUrl || !supabaseKey) {
  console.warn("⚠️ 경고: Supabase 키가 없습니다. 빌드 중이라면 무시하세요.");
}

// 3. 클라이언트 생성 (빈 값이라도 일단 생성해서 빌드 통과시킴)
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co", 
  supabaseKey || "placeholder-key"
);