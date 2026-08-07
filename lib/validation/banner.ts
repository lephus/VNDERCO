import { z } from 'zod'

// Checkbox chưa tick thì trình duyệt không gửi field lên (thiếu hẳn key), nhưng
// test còn kiểm cả giá trị 'off' — nên chấp nhận chuỗi bất kỳ, chỉ 'on'/'true' là bật.
// (Cùng khuôn với lib/validation/post.ts — union chặt sẽ từ chối 'off'.)
const checkbox = z.string().optional().transform((v) => v === 'on' || v === 'true')

const href = z.string().trim().refine(
  // `//evil.com` cũng bắt đầu bằng "/" nhưng trình duyệt hiểu là URL protocol-relative
  // (tự suy ra http/https), tức là đi ra ngoài site — chỉ chấp nhận MỘT dấu "/" đứng đầu.
  (v) => v === '' || (v.startsWith('/') && !v.startsWith('//')) || /^https?:\/\//.test(v),
  'Link phải bắt đầu bằng / hoặc http(s)://',
)

export const bannerCreateSchema = z.object({
  title: z.string().trim().min(1, 'Tiêu đề không được để trống').max(120, 'Tiêu đề tối đa 120 ký tự'),
  subtitle: z.string().trim().max(200, 'Phụ đề tối đa 200 ký tự').optional().default(''),
  imageUrl: z.string().trim().min(1, 'Banner phải có ảnh'),
  imageAlt: z.string().trim().optional().default(''),
  ctaLabel: z.string().trim().optional().default(''),
  ctaHref: href.optional().default(''),
  order: z.coerce.number().int().min(0).default(0),
  active: checkbox,
})
  .refine((v) => !(v.ctaHref && !v.ctaLabel), { path: ['ctaLabel'], message: 'Nhập nhãn cho nút' })
  .transform((v) => ({
    ...v,
    subtitle: v.subtitle || null,
    imageAlt: v.imageAlt || null,
    ctaLabel: v.ctaLabel || null,
    ctaHref: v.ctaHref || null,
  }))

export const bannerUpdateSchema = z.object({ id: z.string().min(1) }).and(bannerCreateSchema)
export const bannerDeleteSchema = z.object({ id: z.string().min(1) })
