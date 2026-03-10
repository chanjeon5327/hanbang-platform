'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser';

type UnifiedAuthState = {
  loading: boolean;
  isAuthenticated: boolean;
  user: User | null;
  session: Session | null;
  email: string | null;
  displayName: string | null;
};

function pickDisplayName(user: User | null): string | null {
  if (!user) return null;

  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;

  const candidates = [
    typeof meta.name === 'string' ? meta.name : null,
    typeof meta.full_name === 'string' ? meta.full_name : null,
    typeof meta.nickname === 'string' ? meta.nickname : null,
    typeof meta.user_name === 'string' ? meta.user_name : null,
    user.email ? user.email.split('@')[0] : null,
  ];

  return candidates.find(Boolean) ?? null;
}

export function useUnifiedAuthState(): UnifiedAuthState {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let mounted = true;
    const supabase = getSupabaseBrowserClient();

    async function bootstrap() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('[useUnifiedAuthState] getSession error', error);
        }

        if (!mounted) return;

        const nextSession = data.session ?? null;
        setSession(nextSession);
        setUser(nextSession?.user ?? null);
      } catch (error) {
        console.error('[useUnifiedAuthState] bootstrap error', error);
        if (!mounted) return;
        setSession(null);
        setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession ?? null);
      setUser(nextSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return useMemo(
    () => ({
      loading,
      isAuthenticated: !!session?.user,
      user,
      session,
      email: user?.email ?? null,
      displayName: pickDisplayName(user),
    }),
    [loading, session, user],
  );
}

