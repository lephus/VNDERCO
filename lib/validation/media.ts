import { z } from 'zod'

export const deleteMediaSchema = z.object({ id: z.string().min(1) })
export const updateMediaAltSchema = z.object({
  id: z.string().min(1),
  alt: z.string().max(200, 'Mô tả ảnh tối đa 200 ký tự'),
})
