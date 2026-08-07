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

type UnknownRecord = Record<string, unknown>
const isRecord = (v: unknown): v is UnknownRecord => typeof v === 'object' && v !== null && !Array.isArray(v)

// JSON hợp lệ nhưng SAI KIỂU bên trong (label là số, value là object…) từng bị ép
// kiểu bằng `as` rồi gọi thẳng .trim() — ném TypeError chứ không phải ZodError, nên
// lọt qua schema.safeParse() ở lib/actions/helper.ts và làm sập cả action. Ở đây
// kiểm tra `typeof` thật trước khi coi một trường là chuỗi: trường bắt buộc sai kiểu
// khiến cả dòng bị loại (giống hệt thiếu hẳn trường đó); `alt` sai kiểu chỉ mất mô
// tả (về null) chứ không loại cả ảnh — dùng guard thường thay vì schema zod cho từng
// dòng vì hai trường hợp cần xử lý KHÁC nhau (loại dòng vs. chỉ null hoá một trường),
// một z.object() với alt optional sẽ loại cả dòng khi alt sai kiểu, không đúng ý.
function parseSpecs(raw: string): { label: string; value: string }[] {
  const rows: { label: string; value: string }[] = []
  for (const item of parseJsonArray(raw)) {
    if (!isRecord(item)) continue
    const label = typeof item.label === 'string' ? item.label.trim() : ''
    const value = typeof item.value === 'string' ? item.value.trim() : ''
    if (label && value) rows.push({ label, value })
  }
  return rows
}

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
  specs: parseSpecs(v.specs),
  images: parseImages(v.images).map((i, order) => ({ ...i, order })),
}))

export const productUpdateSchema = z.object({ id: z.string().min(1) }).and(productCreateSchema)
export const productDeleteSchema = z.object({ id: z.string().min(1) })
