export const PRESETS = {
  violet: { name: 'Tím', primary: '#6C3DF4' },
  teal:   { name: 'Xanh ngọc', primary: '#0EA5A4' },
  blue:   { name: 'Xanh dương', primary: '#0057FF' },
  orange: { name: 'Cam', primary: '#F97316' },
  pink:   { name: 'Hồng', primary: '#EC4899' },
  green:  { name: 'Xanh lá', primary: '#16A34A' },
} as const

export type PresetKey = keyof typeof PRESETS
export const DEFAULT_PRESET_KEY: PresetKey = 'violet'

export function isPresetKey(value: string): value is PresetKey {
  return value in PRESETS
}
