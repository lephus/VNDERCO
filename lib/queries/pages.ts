import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/db'
import { TAGS } from '@/lib/cache-tags'

export async function getPageBySlug(slug: string) {
  return unstable_cache(
    async () => prisma.page.findFirst({ where: { slug, status: 'PUBLISHED' } }),
    ['page', slug],
    { tags: [TAGS.page(slug), TAGS.pages] },
  )()
}

export const getAllPublishedPageSlugs = unstable_cache(
  async () => prisma.page.findMany({ where: { status: 'PUBLISHED' }, select: { slug: true, updatedAt: true } }),
  ['pages-slugs'],
  { tags: [TAGS.pages] },
)
