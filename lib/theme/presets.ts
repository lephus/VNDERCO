export const PRESETS = {
  // Xanh thương hiệu đo được từ bản thiết kế tham chiếu (#2390EF — màu của tiêu
  // đề mục, đường kẻ và liên kết). Đứng đầu danh sách và là preset mặc định vì
  // toàn bộ giao diện công khai được dựng quanh tông xanh này.
  azure:  { name: 'Xanh thương hiệu', primary: '#2390EF' },
  violet: { name: 'Tím', primary: '#6C3DF4' },
  teal:   { name: 'Xanh ngọc', primary: '#0EA5A4' },
  blue:   { name: 'Xanh dương', primary: '#0057FF' },
  orange: { name: 'Cam', primary: '#F97316' },
  pink:   { name: 'Hồng', primary: '#EC4899' },
  green:  { name: 'Xanh lá', primary: '#16A34A' },
} as const

export type PresetKey = keyof typeof PRESETS
export const DEFAULT_PRESET_KEY: PresetKey = 'azure'

export function isPresetKey(value: string): value is PresetKey {
  return Object.hasOwn(PRESETS, value)
}
