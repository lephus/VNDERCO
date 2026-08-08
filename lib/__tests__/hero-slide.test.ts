import { describe, expect, it } from 'vitest'
import {
  altFromFileName, isImageFile, parseCaptions, slidesFromFileNames, sortByFileName,
} from '@/lib/hero-slide'

const fallback = { title: 'MINH ĐÀ THÀNH', subtitle: 'Cung cấp & thi công tấm ốp' }

describe('isImageFile', () => {
  it('nhận các đuôi ảnh thông dụng, không phân biệt hoa thường', () => {
    for (const name of ['a.jpg', 'b.JPEG', 'c.png', 'd.WEBP', 'e.avif']) {
      expect(isImageFile(name), name).toBe(true)
    }
  })

  it('bỏ qua file không phải ảnh', () => {
    for (const name of ['captions.json', 'README.md', 'anh.heic', 'khong-co-duoi']) {
      expect(isImageFile(name), name).toBe(false)
    }
  })

  it('bỏ qua rác của macOS và bản sao ẩn', () => {
    expect(isImageFile('.DS_Store')).toBe(false)
    expect(isImageFile('._01-phong-khach.jpg')).toBe(false)
  })
})

describe('sortByFileName', () => {
  it('hiểu số nên 2 đứng trước 10', () => {
    expect(sortByFileName(['10-c.jpg', '2-b.jpg', '1-a.jpg']))
      .toEqual(['1-a.jpg', '2-b.jpg', '10-c.jpg'])
  })
})

describe('altFromFileName', () => {
  it('bỏ số thứ tự và đổi gạch nối thành khoảng trắng', () => {
    expect(altFromFileName('01-phong-khach-hien-dai.jpg')).toBe('Phong khach hien dai')
  })

  it('trả chuỗi rỗng khi tên file chỉ có số', () => {
    expect(altFromFileName('01.jpg')).toBe('')
  })
})

describe('slidesFromFileNames', () => {
  it('lọc file lạ, sắp theo tên và dựng URL trong /banners', () => {
    const slides = slidesFromFileNames(['02-b.jpg', 'captions.json', '01-a.jpg'], {}, fallback)
    expect(slides.map((s) => s.imageUrl)).toEqual(['/banners/01-a.jpg', '/banners/02-b.jpg'])
  })

  it('dùng tiêu đề mặc định của site khi ảnh không có chú thích riêng', () => {
    const [slide] = slidesFromFileNames(['01-a.jpg'], {}, fallback)
    expect(slide.title).toBe('MINH ĐÀ THÀNH')
    expect(slide.subtitle).toBe('Cung cấp & thi công tấm ốp')
  })

  it('ưu tiên chú thích khai trong captions.json', () => {
    const captions = { '01-a.jpg': { title: 'Thi công trần gỗ', subtitle: 'Tại Đà Nẵng', alt: 'Trần gỗ' } }
    const [slide] = slidesFromFileNames(['01-a.jpg'], captions, fallback)
    expect(slide).toMatchObject({ title: 'Thi công trần gỗ', subtitle: 'Tại Đà Nẵng', imageAlt: 'Trần gỗ' })
  })

  it('chỉ giữ nút khi có đủ cả nhãn lẫn link', () => {
    const captions = { 'a.jpg': { ctaHref: '/san-pham' }, 'b.jpg': { ctaLabel: 'Xem', ctaHref: '/san-pham' } }
    const [a, b] = slidesFromFileNames(['a.jpg', 'b.jpg'], captions, fallback)
    expect(a.ctaHref).toBeNull()
    expect(b.ctaHref).toBe('/san-pham')
  })

  it('mã hoá tên file có khoảng trắng để URL không vỡ', () => {
    const [slide] = slidesFromFileNames(['anh dep.jpg'], {}, fallback)
    expect(slide.imageUrl).toBe('/banners/anh%20dep.jpg')
  })

  it('mỗi slide có id riêng để React nhận diện', () => {
    const ids = slidesFromFileNames(['a.jpg', 'b.jpg'], {}, fallback).map((s) => s.id)
    expect(new Set(ids).size).toBe(2)
  })
})

describe('parseCaptions', () => {
  it('đọc được JSON hợp lệ', () => {
    expect(parseCaptions('{"a.jpg":{"title":"X"}}')).toEqual({ 'a.jpg': { title: 'X' } })
  })

  it('JSON hỏng thì coi như không có chú thích, không ném lỗi', () => {
    expect(parseCaptions('{ dấu phẩy thừa,, }')).toEqual({})
  })

  it('JSON sai kiểu (mảng, số) cũng không làm sập trang', () => {
    expect(parseCaptions('[1,2,3]')).toEqual({})
    expect(parseCaptions('null')).toEqual({})
  })
})
