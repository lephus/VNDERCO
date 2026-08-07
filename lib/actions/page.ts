'use server'

import { prisma } from '@/lib/db'
import { TAGS } from '@/lib/cache-tags'
import { uniqueSlug } from '@/lib/slug'
import { createAction } from './helper'
import { pageCreateSchema, pageDeleteSchema, pageUpdateSchema, RESERVED_SLUGS } from '@/lib/validation/page'

async function takenSlugs(exceptId?: string) {
  const rows = await prisma.page.findMany({
    where: exceptId ? { NOT: { id: exceptId } } : {},
    select: { slug: true },
  })
  return [...rows.map((r) => r.slug), ...RESERVED_SLUGS]
}

export const createPageAction = createAction({
  schema: pageCreateSchema,
  // `handler` phải khai báo trước `tags`: TS suy luận kiểu T của createAction
  // từ giá trị trả về của handler, còn tham số thứ hai của tags cũng có kiểu
  // T — nếu tags đứng trước, T chưa được suy ra sẽ mặc định là `unknown`.
  handler: async (input) => prisma.page.create({
    data: { ...input, slug: uniqueSlug(input.slug, await takenSlugs()) },
  }),
  tags: (_input, page) => [TAGS.pages, TAGS.page(page.slug)],
})

export const updatePageAction = createAction({
  schema: pageUpdateSchema,
  handler: async ({ id, ...input }) => {
    const current = await prisma.page.findUniqueOrThrow({ where: { id }, select: { slug: true } })
    const page = await prisma.page.update({
      where: { id },
      data: { ...input, slug: uniqueSlug(input.slug, await takenSlugs(id)) },
    })
    return current.slug === page.slug ? page : Object.assign(page, { previousSlug: current.slug })
  },
  // Slug có thể đổi, nên phải làm mới cả slug cũ lẫn slug mới.
  tags: (_input, page) => {
    const previous = (page as { previousSlug?: string }).previousSlug
    return [TAGS.pages, TAGS.page(page.slug), ...(previous ? [TAGS.page(previous)] : [])]
  },
})

export const deletePageAction = createAction({
  schema: pageDeleteSchema,
  handler: ({ id }) => prisma.page.delete({ where: { id } }),
  tags: (_input, page) => [TAGS.pages, TAGS.page(page.slug)],
})
