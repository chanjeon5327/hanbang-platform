function required(name: string, value?: string) {
  if (!value) {
    throw new Error(`Missing required env variable: ${name}`);
  }
  return value;
}

/** Lazy getters: 클라이언트는 NEXT_PUBLIC_*만 접근하므로 Service Role 검증은 서버에서만 실행됨 */
export const ENV = {
  get NEXT_PUBLIC_SUPABASE_URL() {
    return required('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL);
  },
  get NEXT_PUBLIC_SUPABASE_ANON_KEY() {
    return required('NEXT_PUBLIC_SUPABASE_ANON_KEY', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  },
  get SUPABASE_URL() {
    return required('SUPABASE_URL', process.env.SUPABASE_URL);
  },
  get SUPABASE_SERVICE_ROLE_KEY() {
    return required('SUPABASE_SERVICE_ROLE_KEY', process.env.SUPABASE_SERVICE_ROLE_KEY);
  },
};
