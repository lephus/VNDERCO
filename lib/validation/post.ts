import { z } from 'zod'
import { slugify } from '@/lib/slug'
import { sanitizeHtml } from '@/lib/sanitize'

// FormData luôn trả chuỗi; các helper dưới đây quy về kiểu thật.
const optionalId = z.string().optional().transform((v) => (v && v.length > 0 ? v : null))
// Checkbox chưa tick thì trình duyệt không gửi field lên (thiếu hẳn key), nhưng
// test còn kiểm cả giá trị 'off' — nên chấp nhận chuỗi bất kỳ, chỉ 'on'/'true' là bật.
const checkbox = z.string().optional().transform((v) => v === 'on' || v === 'true')

const hasText = (html: string) => sanitizeHtml(html).replace(/<[^>]*>/g, '').trim().length > 0

export const postCreateSchema = z.object({
  title: z.string().trim().min(1, 'Tiêu đề không được để trống').max(200, 'Tiêu đề tối đa 200 ký tự'),
  slug: z.string().trim().optional().default(''),
  excerpt: z.string().trim().max(400, 'Tóm tắt tối đa 400 ký tự').optional().default(''),
  content: z.string().refine(hasText, 'Nội dung không được để trống'),
  coverImageUrl: optionalId,
  coverImageAlt: z.string().trim().optional().default(''),
  categoryId: optionalId,
  status: z.enum(['DRAFT', 'PUBLISHED']),
  featured: checkbox,
  seoTitle: z.string().trim().optional().default(''),
  seoDescription: z.string().trim().optional().default(''),
}).transform((v) => ({
  ...v,
  slug: slugify(v.slug || v.title),
  content: sanitizeHtml(v.content),
  excerpt: v.excerpt || null,
  coverImageAlt: v.coverImageAlt || null,
  seoTitle: v.seoTitle || null,
  seoDescription: v.seoDescription || null,
  publishedAt: v.status === 'PUBLISHED' ? new Date() : null,
}))

export const postUpdateSchema = z.object({ id: z.string().min(1) }).and(postCreateSchema)
export const postDeleteSchema = z.object({ id: z.string().min(1) })
