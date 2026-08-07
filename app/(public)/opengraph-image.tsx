import { ImageResponse } from 'next/og'
import { getSiteSettings } from '@/lib/queries/settings'
import { resolvePrimary } from '@/lib/validation/settings'
import { buildPalette } from '@/lib/theme/palette'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OgImage() {
  const settings = await getSiteSettings()
  const palette = buildPalette(resolvePrimary(settings))

  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: 80, color: palette.foreground,
        backgroundImage: `linear-gradient(125deg, ${palette.gradientFrom}, ${palette.gradientVia}, ${palette.gradientTo})`,
      }}>
        <div style={{ display: 'flex', fontSize: 32, opacity: 0.85 }}>{settings.siteName}</div>
        <div style={{ display: 'flex', fontSize: 68, fontWeight: 800, lineHeight: 1.15, marginTop: 16 }}>
          {settings.seoDescription || 'Sản phẩm và giải pháp cho doanh nghiệp Việt'}
        </div>
      </div>
    ),
    size,
  )
}
