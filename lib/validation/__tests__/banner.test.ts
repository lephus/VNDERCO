import { describe, expect, it } from 'vitest'
import { bannerCreateSchema } from '@/lib/validation/banner'

const base = {
  title: 'Giải pháp cho doanh nghiệp Việt', subtitle: '', imageUrl: 'https://a/b.jpg',
  imageAlt: '', ctaLabel: '', ctaHref: '', order: '0', active: 'on',
}

describe('bannerCreateSchema', () => {
  it('chấp nhận banner hợp lệ', () => {
    expect(bannerCreateSchema.parse(base).active).toBe(true)
  })

  it('bắt buộc phải có ảnh', () => {
    expect(bannerCreateSchema.safeParse({ ...base, imageUrl: '' }).error!.flatten().fieldErrors.imageUrl)
      .toContain('Banner phải có ảnh')
  })

  it('chấp nhận link CTA nội bộ dạng /san-pham', () => {
    expect(bannerCreateSchema.parse({ ...base, ctaLabel: 'Xem', ctaHref: '/san-pham' }).ctaHref).toBe('/san-pham')
  })

  it('từ chối link CTA không phải http(s) hay đường dẫn nội bộ', () => {
    expect(bannerCreateSchema.safeParse({ ...base, ctaLabel: 'X', ctaHref: 'javascript:alert(1)' }).success).toBe(false)
  })

  it('bắt buộc có nhãn khi đã nhập link CTA', () => {
    expect(bannerCreateSchema.safeParse({ ...base, ctaLabel: '', ctaHref: '/san-pham' }).error!.flatten().fieldErrors.ctaLabel)
      .toContain('Nhập nhãn cho nút')
  })

  it('từ chối link protocol-relative (//evil.com) dù có vẻ như bắt đầu bằng "/"', () => {
    expect(bannerCreateSchema.safeParse({ ...base, ctaLabel: 'X', ctaHref: '//evil.com' }).success).toBe(false)
  })

  it('chấp nhận đường dẫn nội bộ một dấu gạch chéo', () => {
    expect(bannerCreateSchema.parse({ ...base, ctaLabel: 'Xem', ctaHref: '/san-pham' }).ctaHref).toBe('/san-pham')
  })

  it('chấp nhận URL tuyệt đối https', () => {
    expect(bannerCreateSchema.parse({ ...base, ctaLabel: 'Xem', ctaHref: 'https://vnderco.vn' }).ctaHref)
      .toBe('https://vnderco.vn')
  })
})
