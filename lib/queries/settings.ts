import { unstable_cache } from 'next/cache'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { TAGS } from '@/lib/cache-tags'
import { DEFAULT_PRESET_KEY } from '@/lib/theme/presets'

export const getSiteSettings = unstable_cache(
  async () => {
    const settings = await prisma.siteSetting.findUnique({ where: { id: 1 } })
    // Chưa seed thì vẫn phải render được, không để trang trắng.
    return settings ?? {
      id: 1, siteName: 'VNDERCO', logoUrl: null, faviconUrl: null,
      contactEmail: '', contactPhone: '', contactAddress: null,
      zaloUrl: null, facebookUrl: null,
      themeMode: 'PRESET' as const, presetKey: DEFAULT_PRESET_KEY, customPrimary: null,
      homeIntroTitle: '', homeIntroBody: '', homeIntroImageUrl: null,
      homeIntroCtaLabel: null, homeIntroCtaHref: null,
      homeStats: [] as Prisma.JsonValue,
      seoTitleTemplate: '%s | VNDERCO', seoDescription: '', seoOgImageUrl: null,
      updatedAt: new Date(),
    }
  },
  ['site-settings'],
  { tags: [TAGS.settings] },
)
