import { describe, expect, it } from 'vitest'
import { slugify, uniqueSlug } from '@/lib/slug'

describe('slugify', () => {
  it('khử dấu tiếng Việt', () => {
    expect(slugify('Sản phẩm mới 2026')).toBe('san-pham-moi-2026')
  })

  it('xử lý được chữ Đ và đ vốn không phân rã bằng NFD', () => {
    expect(slugify('Đầu tư & phát triển')).toBe('dau-tu-phat-trien')
    expect(slugify('Đồng Nai')).toBe('dong-nai')
  })

  it('gộp khoảng trắng và ký tự đặc biệt thành một dấu gạch', () => {
    expect(slugify('  Xin   chào --- thế giới!!! ')).toBe('xin-chao-the-gioi')
  })

  it('không để lại dấu gạch thừa ở hai đầu', () => {
    expect(slugify('---Tin tức---')).toBe('tin-tuc')
  })

  it('trả về "noi-dung" khi không còn ký tự hợp lệ nào', () => {
    expect(slugify('!!!')).toBe('noi-dung')
    expect(slugify('   ')).toBe('noi-dung')
  })
})

describe('uniqueSlug', () => {
  it('giữ nguyên khi chưa ai dùng', () => {
    expect(uniqueSlug('tin-tuc', ['san-pham'])).toBe('tin-tuc')
  })

  it('thêm hậu tố số khi trùng', () => {
    expect(uniqueSlug('tin-tuc', ['tin-tuc'])).toBe('tin-tuc-2')
    expect(uniqueSlug('tin-tuc', ['tin-tuc', 'tin-tuc-2'])).toBe('tin-tuc-3')
  })
})
