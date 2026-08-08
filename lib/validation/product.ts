import { z } from 'zod'
import { slugify } from '@/lib/slug'
import { sanitizeHtml } from '@/lib/sanitize'
import { isRecord, parseJsonArray, parseLabelValueRows } from '@/lib/validation/label-value'

// Checkbox chưa tick thì trình duyệt không gửi field lên (thiếu hẳn key), nhưng
// test còn kiểm cả giá trị 'off' — nên chấp nhận chuỗi bất kỳ, chỉ 'on'/'true' là bật.
// (Cùng cách làm với `checkbox` trong lib/validation/post.ts — union chặt sẽ ném lỗi
// trên 'off', điều mà một checkbox chưa tick vẫn có thể gửi lên.)
const checkbox = z.string().optional().transform((v) => v === 'on' || v === 'true')
const optional = z.string().optional().transform((v) => (v && v.length > 0 ? v : null))

function parseImages(raw: string): { url: string; alt: string | null }[] {
  const rows: { url: string; alt: string | null }[] = []
  for (const item of parseJsonArray(raw)) {
    if (!isRecord(item)) continue
    const { url, alt } = item
    if (typeof url !== 'string' || url.length === 0) continue
    rows.push({ url, alt: typeof alt === 'string' && alt.trim() ? alt.trim() : null })
  }
  return rows
}

export const productCreateSchema = z.object({
  name: z.string().trim().min(1, 'Tên sản phẩm không được để trống').max(200, 'Tên tối đa 200 ký tự'),
  slug: z.string().trim().optional().default(''),
  summary: z.string().trim().max(400, 'Tóm tắt tối đa 400 ký tự').optional().default(''),
  description: z.string().optional().default(''),
  specs: z.string().optional().default('[]'),
  images: z.string().optional().default('[]'),
  categoryId: optional,
  status: z.enum(['DRAFT', 'PUBLISHED']),
  featured: checkbox,
  order: z.coerce.number().int().min(0).default(0),
  seoTitle: z.string().trim().optional().default(''),
  seoDescription: z.string().trim().optional().default(''),
}).transform((v) => ({
  ...v,
  slug: slugify(v.slug || v.name),
  description: sanitizeHtml(v.description),
  summary: v.summary || null,
  seoTitle: v.seoTitle || null,
  seoDescription: v.seoDescription || null,
  specs: parseLabelValueRows(v.specs),
  images: parseImages(v.images).map((i, order) => ({ ...i, order })),
}))

export const productUpdateSchema = z.object({ id: z.string().min(1) }).and(productCreateSchema)
export const productDeleteSchema = z.object({ id: z.string().min(1) })
