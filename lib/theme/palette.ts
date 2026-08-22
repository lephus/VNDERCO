import { converter, formatHex, parse, wcagContrast } from 'culori'
import { DEFAULT_PRESET_KEY, PRESETS } from './presets'

const toOklch = converter('oklch')

export const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const
export type Shade = (typeof SHADES)[number]

// Độ sáng (L) cố định theo bậc; độ bão hoà (C) co lại ở hai đầu để tránh màu bệt.
const RAMP: Record<Shade, { l: number; c: number }> = {
  50:  { l: 0.97, c: 0.25 },
  100: { l: 0.94, c: 0.40 },
  200: { l: 0.88, c: 0.60 },
  300: { l: 0.80, c: 0.80 },
  400: { l: 0.70, c: 0.95 },
  500: { l: 0.62, c: 1.00 },
  600: { l: 0.55, c: 1.00 },
  700: { l: 0.47, c: 0.92 },
  800: { l: 0.39, c: 0.82 },
  900: { l: 0.31, c: 0.70 },
}

const LIGHT_TEXT = '#ffffff'
const DARK_TEXT = '#111827'

export type Palette = {
  primary: string
  foreground: string
  shades: Record<Shade, string>
  gradientFrom: string
  gradientVia: string
  gradientTo: string
}

function shift(base: { l: number; c: number; h: number }, dHue: number, dL: number): string {
  return formatHex({
    mode: 'oklch',
    l: Math.min(0.95, Math.max(0.05, base.l + dL)),
    c: base.c,
    h: (base.h + dHue + 360) % 360,
  })!
}

export function buildPalette(hex: string): Palette {
  const parsed = parse(hex)
  if (!parsed) return buildPalette(PRESETS[DEFAULT_PRESET_KEY].primary)

  const oklch = toOklch(parsed)!
  // Màu xám tuyệt đối không có sắc độ; gán 0 để phép xoay hue vẫn tất định.
  const base = { l: oklch.l, c: oklch.c, h: oklch.h ?? 0 }

  const shades = {} as Record<Shade, string>
  for (const shade of SHADES) {
    const step = RAMP[shade]
    shades[shade] = formatHex({ mode: 'oklch', l: step.l, c: base.c * step.c, h: base.h })!
  }

  const primary = shades[500]
  // Đo tương phản trên shade 600 chứ không phải 500: `--vnd-primary-fg` chỉ được
  // dùng làm chữ trên NỀN ĐẶC, mà mọi nền đặc trong site đều là bg-primary-600
  // (xem VARIANTS.primary trong lib/ui/button.ts). Đo trên 500 rồi đem dùng trên
  // 600 là đo một màu, tô một màu khác — với tông xanh mặc định, phép đo cũ chọn
  // chữ tối (4,87:1 trên shade 500) nhưng đặt lên shade 600 chỉ còn 3,68:1, dưới
  // ngưỡng AA 4,5:1; chữ trắng ở đó đạt 4,82:1.
  const solid = shades[600]
  const foreground =
    wcagContrast(solid, LIGHT_TEXT) >= wcagContrast(solid, DARK_TEXT) ? LIGHT_TEXT : DARK_TEXT

  const mid = { l: RAMP[500].l, c: base.c, h: base.h }

  return {
    primary,
    foreground,
    shades,
    gradientFrom: primary,
    gradientVia: shift(mid, 40, 0.06),
    gradientTo: shift(mid, 105, 0.14),
  }
}

export function paletteToCssVars(p: Palette): Record<string, string> {
  const vars: Record<string, string> = {
    '--vnd-primary': p.primary,
    '--vnd-primary-fg': p.foreground,
    '--vnd-gradient-from': p.gradientFrom,
    '--vnd-gradient-via': p.gradientVia,
    '--vnd-gradient-to': p.gradientTo,
  }
  for (const shade of SHADES) vars[`--vnd-primary-${shade}`] = p.shades[shade]
  return vars
}
