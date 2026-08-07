'use server'

import { prisma } from '@/lib/db'
import { TAGS } from '@/lib/cache-tags'
import { uniqueSlug } from '@/lib/slug'
import { createAction } from './helper'
import { categoryCreateSchema, categoryDeleteSchema, categoryUpdateSchema } from '@/lib/validation/category'

// Danh mục lộ ra ở mọi trang danh sách và menu lọc, nên đụng vào là làm mới cả tin lẫn sản phẩm.
const ALL = [TAGS.categories, TAGS.posts, TAGS.products]

async function takenSlugs(type: 'NEWS' | 'PRODUCT', exceptId?: string) {
  const rows = await prisma.category.findMany({
    where: { type, ...(exceptId ? { NOT: { id: exceptId } } : {}) },
    select: { slug: true },
  })
  return rows.map((r) => r.slug)
}

export const createCategoryAction = createAction({
  schema: categoryCreateSchema,
  tags: () => ALL,
  handler: async (input) => prisma.category.create({
    data: { ...input, slug: uniqueSlug(input.slug, await takenSlugs(input.type)) },
  }),
})

export const updateCategoryAction = createAction({
  schema: categoryUpdateSchema,
  tags: () => ALL,
  handler: async ({ id, ...input }) => prisma.category.update({
    where: { id },
    data: { ...input, slug: uniqueSlug(input.slug, await takenSlugs(input.type, id)) },
  }),
})

export const deleteCategoryAction = createAction({
  schema: categoryDeleteSchema,
  tags: () => ALL,
  handler: ({ id }) => prisma.category.delete({ where: { id } }),
})
