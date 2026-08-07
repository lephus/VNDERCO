import { describe, expect, it } from 'vitest'
import { categoryCreateSchema } from '@/lib/validation/category'

describe('categoryCreateSchema', () => {
  it('chấp nhận dữ liệu hợp lệ và ép order về số', () => {
    const parsed = categoryCreateSchema.parse({ name: 'Tin công ty', slug: 'tin-cong-ty', type: 'NEWS', order: '3' })
    expect(parsed.order).toBe(3)
  })

  it('tự sinh slug từ tên khi slug bỏ trống', () => {
    expect(categoryCreateSchema.parse({ name: 'Đầu tư & phát triển', slug: '', type: 'NEWS', order: '0' }).slug)
      .toBe('dau-tu-phat-trien')
  })

  it('báo lỗi tiếng Việt khi thiếu tên', () => {
    const result = categoryCreateSchema.safeParse({ name: '', slug: '', type: 'NEWS', order: '0' })
    expect(result.success).toBe(false)
    expect(result.error!.flatten().fieldErrors.name).toContain('Tên danh mục không được để trống')
  })

  it('từ chối loại danh mục không hợp lệ', () => {
    expect(categoryCreateSchema.safeParse({ name: 'X', slug: 'x', type: 'BLOG', order: '0' }).success).toBe(false)
  })
})
