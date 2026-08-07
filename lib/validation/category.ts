import { z } from 'zod'
import { slugify } from '@/lib/slug'

export const categoryCreateSchema = z.object({
  name: z.string().trim().min(1, 'Tên danh mục không được để trống').max(100, 'Tên tối đa 100 ký tự'),
  slug: z.string().trim(),
  type: z.enum(['NEWS', 'PRODUCT'], { message: 'Loại danh mục không hợp lệ' }),
  order: z.coerce.number().int().min(0).default(0),
}).transform((v) => ({ ...v, slug: v.slug ? slugify(v.slug) : slugify(v.name) }))

export const categoryUpdateSchema = z.object({ id: z.string().min(1) })
  .and(categoryCreateSchema)

export const categoryDeleteSchema = z.object({ id: z.string().min(1) })
