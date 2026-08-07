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
            <Link key={item.href} href={item.href}
              className="relative text-slate-600 transition-colors duration-200 hover:text-slate-900
                after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0
                after:bg-primary-600 after:transition-transform after:duration-300 after:ease-out hover:after:scale-x-100">
              {item.label}
            </Link>
          ))}
          <Link href="/lien-he"
            className="rounded-full bg-primary-600 px-4 py-1.5 font-semibold text-primary-fg
              transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:brightness-110 active:translate-y-0">
            Liên hệ
          </Link>
        </nav>
      </div>
    </header>
  )
}
