import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/db'
import { TAGS } from '@/lib/cache-tags'

export const getMediaList = unstable_cache(
  async () => prisma.media.findMany({ orderBy: { createdAt: 'desc' }, take: 200 }),
  ['media-list'],
  { tags: [TAGS.media] },
)
