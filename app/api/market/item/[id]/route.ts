import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

console.log("ENV CHECK:", {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  service: !!process.env.SUPABASE_SERVICE_ROLE_KEY
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: rawId } = await params
  const id = rawId?.trim()

  console.log("MARKET ITEM ID:", id)

  if (!id) {
    return NextResponse.json({ error: 'INVALID_ID' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('content_items')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error("SUPABASE ERROR FULL:", JSON.stringify(error, null, 2))
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })
  }

  if (!data) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })
  }

  return NextResponse.json({ item: data })
}
