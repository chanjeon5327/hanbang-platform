import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/server';
import { requireAdmin } from '@/lib/admin/requireAdmin';

const VALID_STATUS = ['APPROVED', 'REJECTED'] as const;

/**
 * PATCH /api/admin/creators/[id] - creator_status 업데이트
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const status = body.creator_status;

    if (!status || !VALID_STATUS.includes(status)) {
      return NextResponse.json(
        { error: 'creator_status must be APPROVED or REJECTED' },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from('profiles')
      .update({ creator_status: status })
      .eq('id', id)
      .eq('role', 'CREATOR')
      .select('id, email, creator_status')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'creator not found' }, { status: 404 });
    }

    return NextResponse.json({ creator: data });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
