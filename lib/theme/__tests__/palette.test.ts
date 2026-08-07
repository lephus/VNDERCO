import { describe, expect, it } from 'vitest'
import { buildPalette, paletteToCssVars, SHADES } from '@/lib/theme/palette'
import { isPresetKey, PRESETS } from '@/lib/theme/presets'

const isHex = (v: string) => /^#[0-9a-f]{6}$/i.test(v)

describe('buildPalette', () => {
  it('trả về đủ 10 bậc, tất cả đều là mã hex hợp lệ', () => {
    const p = buildPalette('#6C3DF4')
    expect(Object.keys(p.shades).map(Number)).toEqual([...SHADES])
    for (const shade of SHADES) expect(isHex(p.shades[shade])).toBe(true)
  })

  it('độ sáng giảm dần đều từ bậc 50 xuống bậc 900', () => {
    const p = buildPalette('#0EA5A4')
    const luminance = (hex: string) => {
      const n = parseInt(hex.slice(1), 16)
      return ((n >> 16) & 255) * 0.2126 + ((n >> 8) & 255) * 0.7152 + (n & 255) * 0.0722
    }
    for (let i = 1; i < SHADES.length; i++) {
      expect(luminance(p.shades[SHADES[i]])).toBeLessThan(luminance(p.shades[SHADES[i - 1]]))
    }
  })

  it('chọn chữ trắng trên nền tím đậm', () => {
    expect(buildPalette('#6C3DF4').foreground).toBe('#ffffff')
  })

  it('chọn chữ đen trên nền vàng chanh cực sáng', () => {
    expect(buildPalette('#EAFF00').foreground).toBe('#111827')
  })

  it('không vỡ với đen tuyền và trắng tinh', () => {
    expect(isHex(buildPalette('#000000').shades[500])).toBe(true)
    expect(isHex(buildPalette('#FFFFFF').shades[500])).toBe(true)
    expect(buildPalette('#FFFFFF').foreground).toBe('#111827')
  })

  it('quay về preset violet khi mã màu sai định dạng', () => {
    const fallback = buildPalette(PRESETS.violet.primary)
    expect(buildPalette('khong-phai-mau')).toEqual(fallback)
    expect(buildPalette('')).toEqual(fallback)
    expect(buildPalette('#12345')).toEqual(fallback)
  })

  it('gradient gồm 3 chặng khác nhau, sáng dần', () => {
    const p = buildPalette('#6C3DF4')
    expect(p.gradientFrom).not.toBe(p.gradientVia)
    expect(p.gradientVia).not.toBe(p.gradientTo)
    expect([p.gradientFrom, p.gradientVia, p.gradientTo].every(isHex)).toBe(true)
  })
})

describe('paletteToCssVars', () => {
  it('sinh đúng tên biến CSS', () => {
    const vars = paletteToCssVars(buildPalette('#6C3DF4'))
    expect(vars['--vnd-primary-500']).toMatch(/^#/)
    expect(vars['--vnd-primary-fg']).toBe('#ffffff')
    expect(vars['--vnd-gradient-from']).toMatch(/^#/)
    expect(vars['--vnd-gradient-via']).toMatch(/^#/)
    expect(vars['--vnd-gradient-to']).toMatch(/^#/)
  })
})

describe('isPresetKey', () => {
  it('nhận đúng 6 khoá preset hợp lệ', () => {
    for (const key of Object.keys(PRESETS)) expect(isPresetKey(key)).toBe(true)
  })

  it('từ chối các thuộc tính kế thừa từ prototype', () => {
    expect(isPresetKey('toString')).toBe(false)
    expect(isPresetKey('constructor')).toBe(false)
    expect(isPresetKey('__proto__')).toBe(false)
    expect(isPresetKey('hasOwnProperty')).toBe(false)
  })
})
