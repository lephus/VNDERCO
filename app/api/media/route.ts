import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getMediaList } from '@/lib/queries/media'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json([], { status: 401 })
  return NextResponse.json(await getMediaList())
}
