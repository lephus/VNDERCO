import Image from 'next/image'
import Link from 'next/link'
import type { SiteSetting } from '@prisma/client'

const NAV = [
  { href: '/san-pham', label: 'Sản phẩm' },
  { href: '/tin-tuc', label: 'Tin tức' },
  { href: '/gioi-thieu', label: 'Về chúng tôi' },
]

export function SiteHeader({ settings }: { settings: SiteSetting }) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
          {settings.logoUrl
            ? <Image src={settings.logoUrl} alt={settings.siteName} width={120} height={32} className="h-8 w-auto" />
            : settings.siteName}
        </Link>
        <nav aria-label="Điều hướng chính" className="flex items-center gap-6 text-sm">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="text-slate-600 hover:text-slate-900">{item.label}</Link>
          ))}
          <Link href="/lien-he"
            className="rounded-full bg-primary-600 px-4 py-1.5 font-semibold text-primary-fg">
            Liên hệ
          </Link>
        </nav>
      </div>
    </header>
  )
}
