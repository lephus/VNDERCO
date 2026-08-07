import { describe, expect, it } from 'vitest'
import { productCreateSchema } from '@/lib/validation/product'

const base = {
  name: 'Máy lọc không khí X1', slug: '', summary: '', description: '<p>Mô tả</p>',
  specs: '[]', images: '[]', categoryId: '', status: 'DRAFT', featured: 'off',
  order: '0', seoTitle: '', seoDescription: '',
}

describe('productCreateSchema', () => {
  it('phân tích chuỗi JSON thông số thành mảng đối tượng', () => {
    const specs = JSON.stringify([{ label: 'Công suất', value: '500W' }])
    expect(productCreateSchema.parse({ ...base, specs }).specs).toEqual([{ label: 'Công suất', value: '500W' }])
  })

  it('bỏ qua dòng thông số thiếu nhãn hoặc giá trị', () => {
    const specs = JSON.stringify([{ label: '', value: 'x' }, { label: 'Màu', value: '' }, { label: 'Cân nặng', value: '3kg' }])
    expect(productCreateSchema.parse({ ...base, specs }).specs).toEqual([{ label: 'Cân nặng', value: '3kg' }])
  })

  it('coi JSON hỏng là danh sách rỗng thay vì ném lỗi', () => {
    expect(productCreateSchema.parse({ ...base, specs: 'không-phải-json' }).specs).toEqual([])
    expect(productCreateSchema.parse({ ...base, images: '{' }).images).toEqual([])
  })

  it('đánh số thứ tự ảnh theo đúng thứ tự trong mảng', () => {
    const images = JSON.stringify([{ url: 'https://a/1.jpg', alt: 'A' }, { url: 'https://a/2.jpg', alt: '' }])
    expect(productCreateSchema.parse({ ...base, images }).images).toEqual([
      { url: 'https://a/1.jpg', alt: 'A', order: 0 },
      { url: 'https://a/2.jpg', alt: null, order: 1 },
    ])
  })

  it('báo lỗi khi thiếu tên sản phẩm', () => {
    expect(productCreateSchema.safeParse({ ...base, name: '' }).error!.flatten().fieldErrors.name)
      .toContain('Tên sản phẩm không được để trống')
  })
})
