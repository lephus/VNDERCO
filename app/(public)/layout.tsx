import type { Metadata } from 'next'
import { getSiteSettings } from '@/lib/queries/settings'
import { resolvePrimary } from '@/lib/validation/settings'
import { buildPalette, paletteToCssVars } from '@/lib/theme/palette'
import { organizationJsonLd, siteUrl } from '@/lib/seo'
import { SiteHeader } from '@/components/public/SiteHeader'
import { SiteFooter } from '@/components/public/SiteFooter'
import { BackToTop } from '@/components/public/BackToTop'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  return {
    metadataBase: new URL(siteUrl()),
    title: { template: settings.seoTitleTemplate, default: settings.siteName },
    description: settings.seoDescription,
    openGraph: { siteName: settings.siteName, locale: 'vi_VN', type: 'website' },
  }
}

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings()
  const palette = buildPalette(resolvePrimary(settings))
  const vars = paletteToCssVars(palette)

  return (
    // Biến nằm ngay trong HTML server trả về → không có nhịp chớp màu khi tải.
    // `relative` để mốc theo dõi cuộn của BackToTop (đặt absolute) neo vào đây.
    <div style={vars as React.CSSProperties} className="relative flex min-h-screen flex-col">
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd(settings, siteUrl())) }} />
      <SiteHeader settings={settings} />
      <main className="flex-1">{children}</main>
      <SiteFooter settings={settings} />
      <BackToTop />
    </div>
  )
}
