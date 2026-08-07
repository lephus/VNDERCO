import { describe, expect, it } from 'vitest'
import { resolvePrimary, settingsSchema } from '@/lib/validation/settings'
import { PRESETS } from '@/lib/theme/presets'

const base = {
  siteName: 'VNDERCO', logoUrl: '', faviconUrl: '',
  contactEmail: 'lienhe@vnderco.vn', contactPhone: '0901234567', contactAddress: '',
  zaloUrl: '', facebookUrl: '',
  themeMode: 'PRESET', presetKey: 'violet', customPrimary: '',
  homeIntroTitle: '', homeIntroBody: '', homeIntroImageUrl: '', homeIntroCtaLabel: '', homeIntroCtaHref: '',
  seoTitleTemplate: '%s | VNDERCO', seoDescription: '', seoOgImageUrl: '',
}

describe('settingsSchema', () => {
  it('từ chối email liên hệ sai định dạng', () => {
    expect(settingsSchema.safeParse({ ...base, contactEmail: 'không-phải-email' }).error!.flatten().fieldErrors.contactEmail)
      .toContain('Email liên hệ không hợp lệ')
  })

  it('từ chối preset không tồn tại', () => {
    expect(settingsSchema.safeParse({ ...base, presetKey: 'tim-than-thanh' }).success).toBe(false)
  })

  it('bắt buộc mã hex hợp lệ khi chọn chế độ tuỳ chỉnh', () => {
    expect(settingsSchema.safeParse({ ...base, themeMode: 'CUSTOM', customPrimary: 'xanh' }).error!
      .flatten().fieldErrors.customPrimary).toContain('Mã màu phải có dạng #RRGGBB')
    expect(settingsSchema.safeParse({ ...base, themeMode: 'CUSTOM', customPrimary: '#12AB34' }).success).toBe(true)
  })

  it('không đòi customPrimary khi đang ở chế độ preset', () => {
    expect(settingsSchema.safeParse({ ...base, themeMode: 'PRESET', customPrimary: '' }).success).toBe(true)
  })

  it('từ chối link protocol-relative (//evil.com) ở các trường URL', () => {
    expect(settingsSchema.safeParse({ ...base, facebookUrl: '//evil.com' }).success).toBe(false)
    expect(settingsSchema.safeParse({ ...base, homeIntroCtaHref: '//evil.com' }).success).toBe(false)
  })

  it('chấp nhận đường dẫn nội bộ một dấu gạch chéo và URL tuyệt đối https ở các trường URL', () => {
    expect(settingsSchema.parse({ ...base, facebookUrl: 'https://facebook.com/vnderco' }).facebookUrl)
      .toBe('https://facebook.com/vnderco')
    expect(settingsSchema.parse({ ...base, homeIntroCtaHref: '/san-pham' }).homeIntroCtaHref).toBe('/san-pham')
  })
})

describe('resolvePrimary', () => {
  it('lấy màu của preset khi ở chế độ PRESET', () => {
    expect(resolvePrimary({ themeMode: 'PRESET', presetKey: 'teal', customPrimary: null }))
      .toBe(PRESETS.teal.primary)
  })

  it('lấy customPrimary khi ở chế độ CUSTOM', () => {
    expect(resolvePrimary({ themeMode: 'CUSTOM', presetKey: 'teal', customPrimary: '#FF0000' })).toBe('#FF0000')
  })

  it('quay về violet khi dữ liệu hỏng', () => {
    expect(resolvePrimary({ themeMode: 'CUSTOM', presetKey: 'teal', customPrimary: null }))
      .toBe(PRESETS.violet.primary)
    expect(resolvePrimary({ themeMode: 'PRESET', presetKey: 'khong-ton-tai', customPrimary: null }))
      .toBe(PRESETS.violet.primary)
  })
})
