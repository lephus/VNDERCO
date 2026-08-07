'use server'

import { prisma } from '@/lib/db'
import { TAGS } from '@/lib/cache-tags'
import { uniqueSlug } from '@/lib/slug'
import { createAction } from './helper'
import { productCreateSchema, productDeleteSchema, productUpdateSchema } from '@/lib/validation/product'

async function takenSlugs(exceptId?: string) {
  const rows = await prisma.product.findMany({
    where: exceptId ? { NOT: { id: exceptId } } : {},
    select: { slug: true },
  })
  return rows.map((r) => r.slug)
}

export const createProductAction = createAction({
  schema: productCreateSchema,
  // `handler` phải khai báo trước `tags`: TS suy luận kiểu T của createAction
  // từ giá trị trả về của handler, còn tham số thứ hai của tags cũng có kiểu
  // T — nếu tags đứng trước, T chưa được suy ra sẽ mặc định là `unknown`.
  handler: async ({ images, ...input }) => prisma.product.create({
    data: {
      ...input,
      slug: uniqueSlug(input.slug, await takenSlugs()),
      images: { create: images },
    },
  }),
  tags: (_input, product) => [TAGS.products, TAGS.product(product.slug)],
})

export const updateProductAction = createAction({
  schema: productUpdateSchema,
  handler: async ({ id, images, ...input }) => {
    const current = await prisma.product.findUniqueOrThrow({ where: { id }, select: { slug: true } })
    // Thay toàn bộ bộ ảnh: đơn giản và luôn khớp thứ tự người dùng vừa sắp.
    const product = await prisma.$transaction(async (tx) => {
      await tx.productImage.deleteMany({ where: { productId: id } })
      return tx.product.update({
        where: { id },
        data: {
          ...input,
          slug: uniqueSlug(input.slug, await takenSlugs(id)),
          images: { create: images },
        },
      })
    })
    return current.slug === product.slug ? product : Object.assign(product, { previousSlug: current.slug })
  },
  // Slug có thể đổi, nên phải làm mới cả slug cũ lẫn slug mới.
  tags: (_input, product) => {
    const previous = (product as { previousSlug?: string }).previousSlug
    return [TAGS.products, TAGS.product(product.slug), ...(previous ? [TAGS.product(previous)] : [])]
  },
})

export const deleteProductAction = createAction({
  schema: productDeleteSchema,
  handler: ({ id }) => prisma.product.delete({ where: { id } }),   // ProductImage xoá theo Cascade
  tags: (_input, product) => [TAGS.products, TAGS.product(product.slug)],
})
