import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/db'
import { TAGS } from '@/lib/cache-tags'

export const getActiveBanners = unstable_cache(
  async () => prisma.banner.findMany({ where: { active: true }, orderBy: { order: 'asc' } }),
  ['banners-active'],
  { tags: [TAGS.banners] },
)
