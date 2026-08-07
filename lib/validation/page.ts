import { z } from 'zod'
import { slugify } from '@/lib/slug'
import { sanitizeHtml } from '@/lib/sanitize'

// `/[slug]` là route bắt tất cả ở tầng gốc, nên trang tĩnh không được dùng
// slug trùng với route đã có (hoặc sẽ có) — kiểm tra ở action (lib/actions/page.ts)
// chứ không ở đây, vì thông báo cần nêu đúng slug đã sinh ra sau khi chuẩn hoá.
export const RESERVED_SLUGS = ['tin-tuc', 'san-pham', 'admin', 'api', 'sitemap.xml', 'robots.txt', 'rss.xml']

const hasText = (html: string) => sanitizeHtml(html).replace(/<[^>]*>/g, '').trim().length > 0

export const pageCreateSchema = z.object({
  title: z.string().trim().min(1, 'Tiêu đề không được để trống').max(200, 'Tiêu đề tối đa 200 ký tự'),
  slug: z.string().trim().optional().default(''),
  content: z.string().refine(hasText, 'Nội dung không được để trống'),
  status: z.enum(['DRAFT', 'PUBLISHED']),
  seoTitle: z.string().trim().optional().default(''),
  seoDescription: z.string().trim().optional().default(''),
}).transform((v) => ({
  ...v,
  slug: slugify(v.slug || v.title),
  content: sanitizeHtml(v.content),
  seoTitle: v.seoTitle || null,
  seoDescription: v.seoDescription || null,
}))

export const pageUpdateSchema = z.object({ id: z.string().min(1) }).and(pageCreateSchema)
export const pageDeleteSchema = z.object({ id: z.string().min(1) })
