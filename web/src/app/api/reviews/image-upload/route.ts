import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs' // 念のため

const BUCKET = 'review-images'
const ALLOWED_EXT = new Set(['jpg', 'jpeg', 'png', 'webp'])

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await req.json().catch(() => ({}))) as { ext?: string }
  const extRaw = (body.ext ?? 'png').toLowerCase().replace(/[^a-z0-9]/g, '')
  const ext = ALLOWED_EXT.has(extRaw) ? extRaw : 'png'

  const supabaseAdmin = createClient(
    process.env.SUPABASE_URL_INTERNAL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const path = `reviews/${session.user.id}/${crypto.randomUUID()}.${ext}`

  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .createSignedUploadUrl(path, { upsert: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ path, token: data.token })
}
