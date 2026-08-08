import Image from 'next/image'
import Link from 'next/link'
import type { SiteSetting } from '@prisma/client'
import { MobileNav } from '@/components/public/MobileNav'
import { buttonClass } from '@/lib/ui/button'

const NAV = [
  { href: '/san-pham', label: 'Sản phẩm' },
  { href: '/tin-tuc', label: 'Tin tức' },
  { href: '/gioi-thieu', label: 'Về chúng tôi' },
]

const CTA = { href: '/lien-he', label: 'Liên hệ' }

export function SiteHeader({ settings }: { settings: SiteSetting }) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 py-2 text-lg font-extrabold tracking-tight">
          {settings.logoUrl
            ? <Image src={settings.logoUrl} alt={settings.siteName} width={120} height={32} className="h-8 w-auto" />
            : settings.siteName}
        </Link>

        {/* Dưới 640px thanh nav ngang không đủ chỗ: bốn mục bị ép xuống hai ba
            dòng ("Về / chúng / tôi") và header trông như hỏng. Từ sm trở lên mới
            hiện nav ngang, còn lại chuyển sang menu trượt. */}
        <nav aria-label="Điều hướng chính" className="hidden items-center gap-6 text-sm sm:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href}
              className="relative py-2 text-slate-600 transition-colors duration-200 hover:text-slate-900
                after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0
                after:bg-primary-600 after:transition-transform after:duration-300 after:ease-out hover:after:scale-x-100">
              {item.label}
            </Link>
          ))}
          <Link href={CTA.href} className={buttonClass({ size: 'md' })}>{CTA.label}</Link>
        </nav>

        <MobileNav items={NAV} ctaHref={CTA.href} ctaLabel={CTA.label} />
      </div>
    </header>
  )
}
