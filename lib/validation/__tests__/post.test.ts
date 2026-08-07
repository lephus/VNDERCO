import { describe, expect, it } from 'vitest'
import { postCreateSchema } from '@/lib/validation/post'

const base = {
  title: 'VNDERCO ra mắt sản phẩm mới', slug: '', excerpt: '', content: '<p>Nội dung</p>',
  coverImageUrl: '', coverImageAlt: '', categoryId: '', status: 'DRAFT',
  featured: 'off', seoTitle: '', seoDescription: '',
}

describe('postCreateSchema', () => {
  it('sinh slug từ tiêu đề và làm sạch nội dung', () => {
    const p = postCreateSchema.parse({ ...base, content: '<p>ok</p><script>x</script>' })
    expect(p.slug).toBe('vnderco-ra-mat-san-pham-moi')
    expect(p.content).toBe('<p>ok</p>')
  })

  it('chuyển chuỗi rỗng của ô chọn thành null', () => {
    const p = postCreateSchema.parse(base)
    expect(p.categoryId).toBeNull()
    expect(p.coverImageUrl).toBeNull()
  })

  it('hiểu checkbox: "on" là bật, thiếu là tắt', () => {
    expect(postCreateSchema.parse({ ...base, featured: 'on' }).featured).toBe(true)
    const { featured, ...withoutFeatured } = base
    expect(postCreateSchema.parse(withoutFeatured).featured).toBe(false)
  })

  it('đặt publishedAt khi xuất bản, để trống khi còn nháp', () => {
    expect(postCreateSchema.parse({ ...base, status: 'PUBLISHED' }).publishedAt).toBeInstanceOf(Date)
    expect(postCreateSchema.parse(base).publishedAt).toBeNull()
  })

  it('báo lỗi khi thiếu tiêu đề hoặc nội dung rỗng', () => {
    expect(postCreateSchema.safeParse({ ...base, title: '' }).error!.flatten().fieldErrors.title)
      .toContain('Tiêu đề không được để trống')
    expect(postCreateSchema.safeParse({ ...base, content: '<p></p>' }).error!.flatten().fieldErrors.content)
      .toContain('Nội dung không được để trống')
  })
})
