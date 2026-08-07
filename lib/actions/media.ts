'use server'

import { z } from 'zod'
import { prisma } from '@/lib/db'
import { TAGS } from '@/lib/cache-tags'
import { deleteImage, uploadImage } from '@/lib/storage'
import { createAction } from './helper'
import { deleteMediaSchema, updateMediaAltSchema } from '@/lib/validation/media'

export const uploadMediaAction = createAction({
  schema: z.object({ file: z.instanceof(File, { message: 'Chưa chọn ảnh' }) }),
  tags: () => [TAGS.media],
  handler: async ({ file }) => {
    const { url, pathname } = await uploadImage(file)
    return prisma.media.create({
      data: { url, pathname, filename: file.name, mimeType: file.type, size: file.size },
    })
  },
})

export const deleteMediaAction = createAction({
  schema: deleteMediaSchema,
  tags: () => [TAGS.media],
  handler: async ({ id }) => {
    const media = await prisma.media.delete({ where: { id } })
    // Truyền pathname (key trong bucket), không phải URL công khai.
    // Xoá bản ghi trước, xoá file sau: file mồ côi vô hại, bản ghi mồ côi thì vỡ giao diện.
    await deleteImage(media.pathname).catch((err) => console.error('[storage-delete]', err))
    return media
  },
})

export const updateMediaAltAction = createAction({
  schema: updateMediaAltSchema,
  tags: () => [TAGS.media],
  handler: ({ id, alt }) => prisma.media.update({ where: { id }, data: { alt } }),
})
