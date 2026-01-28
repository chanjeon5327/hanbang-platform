import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;

// 프로젝트마다 키 이름이 다를 수 있어 둘 다 허용(안정성)
const serviceRole =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE ||
  process.env.SUPABASE_SERVICE_KEY ||
  '';

if (!serviceRole) {
  // 런타임에서 바로 터뜨려서 "조용한 금융사고" 방지
  throw new Error(
    'SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_ROLE) is missing'
  );
}

export const supabaseAdmin = createClient(url, serviceRole, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
