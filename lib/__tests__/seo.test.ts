import { afterEach, describe, expect, it, vi } from 'vitest'
import { articleJsonLd, asDate, breadcrumbJsonLd, organizationJsonLd, pickOgImage, productJsonLd, siteUrl } from '@/lib/seo'

describe('pickOgImage', () => {
  it('ưu tiên ảnh của chính nội dung', () => {
    expect(pickOgImage({ contentImage: 'https://a/post.jpg', settingsImage: 'https://a/default.jpg' }))
      .toBe('https://a/post.jpg')
  })

  it('dùng ảnh mặc định trong cài đặt khi nội dung không có ảnh', () => {
    expect(pickOgImage({ contentImage: null, settingsImage: 'https://a/default.jpg' }))
      .toBe('https://a/default.jpg')
  })

  it('cuối cùng mới dùng ảnh sinh động', () => {
    expect(pickOgImage({ contentImage: null, settingsImage: null })).toBe('/opengraph-image')
  })
})

describe('articleJsonLd', () => {
  it('sinh JSON-LD kiểu Article đúng trường bắt buộc', () => {
    const json = articleJsonLd(
      { title: 'Tin A', excerpt: 'Tóm tắt', publishedAt: new Date('2026-01-15'), coverImageUrl: 'https://a/x.jpg' },
      'VNDERCO',
      'https://vnderco.vn/tin-tuc/tin-a',
    )
    expect(json['@type']).toBe('Article')
    expect(json.headline).toBe('Tin A')
    expect(json.datePublished).toBe('2026-01-15T00:00:00.000Z')
    expect(json.publisher).toEqual({ '@type': 'Organization', name: 'VNDERCO' })
    expect(json.mainEntityOfPage).toBe('https://vnderco.vn/tin-tuc/tin-a')
  })

  it('bỏ trường ảnh khi bài không có ảnh bìa', () => {
    const json = articleJsonLd({ title: 'B', excerpt: null, publishedAt: null, coverImageUrl: null }, 'VNDERCO', 'https://x/y')
    expect(json.image).toBeUndefined()
    expect(json.datePublished).toBeUndefined()
  })

  // unstable_cache (dùng cho getPostBySlug/getPublishedPosts) tuần tự hoá kết quả qua
  // JSON.stringify/parse — sau lần tính đầu tiên, publishedAt đọc ra từ cache không còn
  // là instance Date thật mà chỉ là chuỗi ISO, dù kiểu khai báo vẫn là Date. articleJsonLd
  // phải chịu được cả hai trường hợp.
  it('vẫn sinh đúng datePublished khi publishedAt đến từ cache dưới dạng chuỗi (không phải Date thật)', () => {
    const json = articleJsonLd(
      { title: 'C', excerpt: null, publishedAt: '2026-01-15T00:00:00.000Z' as unknown as Date, coverImageUrl: null },
      'VNDERCO',
      'https://x/y',
    )
    expect(json.datePublished).toBe('2026-01-15T00:00:00.000Z')
  })
})

describe('asDate', () => {
  it('giữ nguyên khi đã là Date thật', () => {
    const d = new Date('2026-01-15')
    expect(asDate(d)).toBe(d)
  })

  it('chuyển chuỗi ISO (kết quả đọc từ unstable_cache) thành Date thật', () => {
    const result = asDate('2026-01-15T00:00:00.000Z')
    expect(result).toBeInstanceOf(Date)
    expect(result?.toISOString()).toBe('2026-01-15T00:00:00.000Z')
  })

  it('trả về null khi không có giá trị', () => {
    expect(asDate(null)).toBeNull()
    expect(asDate(undefined)).toBeNull()
  })
})

describe('productJsonLd', () => {
  it('sinh JSON-LD kiểu Product với danh sách ảnh', () => {
    const json = productJsonLd(
      { name: 'Máy bơm A', summary: 'Bền bỉ', images: [{ url: 'https://a/1.jpg' }, { url: 'https://a/2.jpg' }] },
      'https://vnderco.vn/san-pham/may-bom-a',
    )
    expect(json['@type']).toBe('Product')
    expect(json.name).toBe('Máy bơm A')
    expect(json.image).toEqual(['https://a/1.jpg', 'https://a/2.jpg'])
    expect(json.url).toBe('https://vnderco.vn/san-pham/may-bom-a')
  })

  it('bỏ mô tả khi sản phẩm không có tóm tắt', () => {
    const json = productJsonLd({ name: 'X', summary: null, images: [] }, 'https://x/y')
    expect(json.description).toBeUndefined()
    expect(json.image).toEqual([])
  })
})

describe('organizationJsonLd', () => {
  it('sinh JSON-LD kiểu Organization với đầy đủ mạng xã hội', () => {
    const json = organizationJsonLd(
      {
        siteName: 'VNDERCO', logoUrl: 'https://a/logo.png', contactPhone: '0900000000',
        contactEmail: 'lienhe@vnderco.vn', facebookUrl: 'https://facebook.com/vnderco', zaloUrl: 'https://zalo.me/vnderco',
      },
      'https://vnderco.vn',
    )
    expect(json['@type']).toBe('Organization')
    expect(json.sameAs).toEqual(['https://facebook.com/vnderco', 'https://zalo.me/vnderco'])
    expect(json.contactPoint).toEqual({
      '@type': 'ContactPoint', telephone: '0900000000', email: 'lienhe@vnderco.vn', contactType: 'sales',
    })
  })

  it('lọc bỏ mạng xã hội chưa cấu hình', () => {
    const json = organizationJsonLd(
      { siteName: 'VNDERCO', logoUrl: null, contactPhone: '', contactEmail: '', facebookUrl: null, zaloUrl: null },
      'https://vnderco.vn',
    )
    expect(json.sameAs).toEqual([])
    expect(json.logo).toBeUndefined()
    expect(json.contactPoint).toEqual({ '@type': 'ContactPoint', telephone: undefined, email: undefined, contactType: 'sales' })
  })
})

describe('breadcrumbJsonLd', () => {
  it('đánh số thứ tự các mục theo đúng vị trí', () => {
    const json = breadcrumbJsonLd([
      { name: 'Trang chủ', url: 'https://vnderco.vn' },
      { name: 'Tin tức', url: 'https://vnderco.vn/tin-tuc' },
      { name: 'Tin A', url: 'https://vnderco.vn/tin-tuc/tin-a' },
    ])
    expect(json['@type']).toBe('BreadcrumbList')
    expect(json.itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: 'https://vnderco.vn' },
      { '@type': 'ListItem', position: 2, name: 'Tin tức', item: 'https://vnderco.vn/tin-tuc' },
      { '@type': 'ListItem', position: 3, name: 'Tin A', item: 'https://vnderco.vn/tin-tuc/tin-a' },
    ])
  })
})

describe('siteUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('bỏ dấu / cuối của AUTH_URL', () => {
    vi.stubEnv('AUTH_URL', 'https://vnderco.vn/')
    expect(siteUrl()).toBe('https://vnderco.vn')
  })

  it('dùng http://localhost:3000 khi thiếu AUTH_URL (chỉ đúng ở môi trường dev)', () => {
    vi.stubEnv('AUTH_URL', undefined)
    expect(siteUrl()).toBe('http://localhost:3000')
  })

  it('dùng http://localhost:3000 khi AUTH_URL rỗng hoặc chỉ có khoảng trắng', () => {
    vi.stubEnv('AUTH_URL', '   ')
    expect(siteUrl()).toBe('http://localhost:3000')
  })
})
