'use server'

import { prisma } from '@/lib/db'
import { TAGS } from '@/lib/cache-tags'
import { uniqueSlug } from '@/lib/slug'
import { requireAdmin } from '@/lib/auth'
import { createAction } from './helper'
import { postCreateSchema, postDeleteSchema, postUpdateSchema } from '@/lib/validation/post'

async function takenSlugs(exceptId?: string) {
  const rows = await prisma.post.findMany({
    where: exceptId ? { NOT: { id: exceptId } } : {},
    select: { slug: true },
  })
  return rows.map((r) => r.slug)
}

export const createPostAction = createAction({
  schema: postCreateSchema,
  // `handler` phải khai báo trước `tags`: TS suy luận kiểu T của createAction
  // từ giá trị trả về của handler, còn tham số thứ hai của tags cũng có kiểu
  // T — nếu tags đứng trước, T chưa được suy ra sẽ mặc định là `unknown`.
  handler: async (input) => {
    const session = await requireAdmin()
    return prisma.post.create({
      data: { ...input, slug: uniqueSlug(input.slug, await takenSlugs()), authorId: session.id },
    })
  },
  tags: (_input, post) => [TAGS.posts, TAGS.post(post.slug)],
})

export const updatePostAction = createAction({
  schema: postUpdateSchema,
  handler: async ({ id, ...input }) => {
    const current = await prisma.post.findUniqueOrThrow({ where: { id }, select: { slug: true, publishedAt: true } })
    const post = await prisma.post.update({
      where: { id },
      data: {
        ...input,
        slug: uniqueSlug(input.slug, await takenSlugs(id)),
        // Đã xuất bản rồi thì giữ nguyên ngày đăng gốc, đừng nhảy về hôm nay mỗi lần sửa.
        publishedAt: input.status === 'PUBLISHED' ? (current.publishedAt ?? new Date()) : null,
      },
    })
    if (current.slug !== post.slug) return Object.assign(post, { previousSlug: current.slug })
    return post
  },
  // Slug có thể đổi, nên phải làm mới cả slug cũ lẫn slug mới.
  tags: (_input, post) => {
    const previous = (post as { previousSlug?: string }).previousSlug
    return [TAGS.posts, TAGS.post(post.slug), ...(previous ? [TAGS.post(previous)] : [])]
  },
})

export const deletePostAction = createAction({
  schema: postDeleteSchema,
  handler: ({ id }) => prisma.post.delete({ where: { id } }),
  tags: (_input, post) => [TAGS.posts, TAGS.post(post.slug)],
})
