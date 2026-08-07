'use server'

import { prisma } from '@/lib/db'
import { TAGS } from '@/lib/cache-tags'
import { createAction } from './helper'
import { bannerCreateSchema, bannerDeleteSchema, bannerUpdateSchema } from '@/lib/validation/banner'

export const createBannerAction = createAction({
  schema: bannerCreateSchema,
  handler: (input) => prisma.banner.create({ data: input }),
  tags: () => [TAGS.banners],
})

export const updateBannerAction = createAction({
  schema: bannerUpdateSchema,
  handler: ({ id, ...input }) => prisma.banner.update({ where: { id }, data: input }),
  tags: () => [TAGS.banners],
})

export const deleteBannerAction = createAction({
  schema: bannerDeleteSchema,
  handler: ({ id }) => prisma.banner.delete({ where: { id } }),
  tags: () => [TAGS.banners],
})
