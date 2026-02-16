import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/server';
import { requireAdmin } from '@/lib/admin/requireAdmin';

/**
 * GET /api/admin/creators - role=CREATOR???꾨줈??紐⑸줉
 */
export async function GET() {
  try {
    await requireAdmin();

    const admin = createAdminClient();
    const { data, error } = await admin
      .from('profiles')
      .select('id, email, creator_status, created_at')
      .eq('role', 'CREATOR')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ creators: data ?? [] });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

