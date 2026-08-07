import { unstable_cache } from 'next/cache'
import type { CategoryType } from '@prisma/client'
import { prisma } from '@/lib/db'
import { TAGS } from '@/lib/cache-tags'

export async function getCategories(type: CategoryType) {
  return unstable_cache(
    async () => prisma.category.findMany({ where: { type }, orderBy: { order: 'asc' } }),
    ['categories', type],
    { tags: [TAGS.categories] },
  )()
}
