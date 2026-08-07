import { z } from 'zod'
import { DEFAULT_PRESET_KEY, isPresetKey, PRESETS } from '@/lib/theme/presets'

const HEX = /^#[0-9a-fA-F]{6}$/
const blankToNull = z.string().trim().optional().transform((v) => (v ? v : null))
const url = z.string().trim().optional()
  .refine((v) => !v || v.startsWith('/') || /^https?:\/\//.test(v), 'Link phải bắt đầu bằng / hoặc http(s)://')
  .transform((v) => (v ? v : null))

export const settingsSchema = z.object({
  siteName: z.string().trim().min(1, 'Tên site không được để trống').max(100),
  logoUrl: blankToNull,
  faviconUrl: blankToNull,

  contactEmail: z.string().trim().email('Email liên hệ không hợp lệ'),
  contactPhone: z.string().trim().min(8, 'Số điện thoại quá ngắn').max(20, 'Số điện thoại quá dài'),
  contactAddress: blankToNull,
  zaloUrl: url,
  facebookUrl: url,

  themeMode: z.enum(['PRESET', 'CUSTOM']),
  presetKey: z.string().refine(isPresetKey, 'Bảng màu không hợp lệ'),
  customPrimary: z.string().trim().optional().default(''),

  homeIntroTitle: z.string().trim().max(120, 'Tiêu đề tối đa 120 ký tự').optional().default(''),
  homeIntroBody: z.string().trim().max(600, 'Nội dung tối đa 600 ký tự').optional().default(''),
  homeIntroImageUrl: blankToNull,
  homeIntroCtaLabel: blankToNull,
  homeIntroCtaHref: url,

  seoTitleTemplate: z.string().trim().min(1, 'Mẫu tiêu đề không được để trống'),
  seoDescription: z.string().trim().max(300, 'Mô tả tối đa 300 ký tự').optional().default(''),
  seoOgImageUrl: blankToNull,
})
  .refine((v) => v.themeMode !== 'CUSTOM' || HEX.test(v.customPrimary), {
    path: ['customPrimary'],
    message: 'Mã màu phải có dạng #RRGGBB',
  })
  .transform((v) => ({ ...v, customPrimary: v.customPrimary || null }))

type ThemeFields = { themeMode: string; presetKey: string; customPrimary: string | null }

export function resolvePrimary(settings: ThemeFields): string {
  if (settings.themeMode === 'CUSTOM') {
    return settings.customPrimary && HEX.test(settings.customPrimary)
      ? settings.customPrimary
      : PRESETS[DEFAULT_PRESET_KEY].primary
  }
  return isPresetKey(settings.presetKey)
    ? PRESETS[settings.presetKey].primary
    : PRESETS[DEFAULT_PRESET_KEY].primary
}
