import { getSiteSettings } from '@/lib/queries/settings'
import { resolvePrimary } from '@/lib/validation/settings'
import { buildPalette, paletteToCssVars } from '@/lib/theme/palette'
import { SiteHeader } from '@/components/public/SiteHeader'
import { SiteFooter } from '@/components/public/SiteFooter'

export const revalidate = 3600

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings()
  const palette = buildPalette(resolvePrimary(settings))
  const vars = paletteToCssVars(palette)

  return (
    // Biến nằm ngay trong HTML server trả về → không có nhịp chớp màu khi tải.
    <div style={vars as React.CSSProperties} className="flex min-h-screen flex-col">
      <SiteHeader settings={settings} />
      <main className="flex-1">{children}</main>
      <SiteFooter settings={settings} />
    </div>
  )
}
