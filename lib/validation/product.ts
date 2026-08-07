import { z } from 'zod'
import { slugify } from '@/lib/slug'
import { sanitizeHtml } from '@/lib/sanitize'

// Checkbox chưa tick thì trình duyệt không gửi field lên (thiếu hẳn key), nhưng
// test còn kiểm cả giá trị 'off' — nên chấp nhận chuỗi bất kỳ, chỉ 'on'/'true' là bật.
// (Cùng cách làm với `checkbox` trong lib/validation/post.ts — union chặt sẽ ném lỗi
// trên 'off', điều mà một checkbox chưa tick vẫn có thể gửi lên.)
const checkbox = z.string().optional().transform((v) => v === 'on' || v === 'true')
const optional = z.string().optional().transform((v) => (v && v.length > 0 ? v : null))

// Editor phía client gửi JSON qua input ẩn; JSON hỏng không được làm sập cả form.
function parseJsonArray(raw: string): unknown[] {
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
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
  specs: parseJsonArray(v.specs)
    .map((s) => s as { label?: string; value?: string })
    .filter((s) => s.label?.trim() && s.value?.trim())
    .map((s) => ({ label: s.label!.trim(), value: s.value!.trim() })),
  images: parseJsonArray(v.images)
    .map((i) => i as { url?: string; alt?: string })
    .filter((i) => typeof i.url === 'string' && i.url.length > 0)
    .map((i, order) => ({ url: i.url!, alt: i.alt?.trim() || null, order })),
}))

export const productUpdateSchema = z.object({ id: z.string().min(1) }).and(productCreateSchema)
export const productDeleteSchema = z.object({ id: z.string().min(1) })
