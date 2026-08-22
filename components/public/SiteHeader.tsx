import Image from 'next/image'
import Link from 'next/link'
import type { SiteSetting } from '@prisma/client'
import { MobileNav } from '@/components/public/MobileNav'

const NAV = [
  { href: '/san-pham', label: 'Sản phẩm' },
  { href: '/tin-tuc', label: 'Tin tức' },
  { href: '/gioi-thieu', label: 'Về chúng tôi' },
  { href: '/lien-he', label: 'Liên hệ' },
]

// Chiều cao thanh trên cùng, đo được 30,4688px. Dùng lại ở ba chỗ (chiều cao
// thanh, `top` âm của header dính, và scroll-padding) nên phải là một hằng số —
// ba nơi tự gõ lại số này là ba nơi có thể lệch nhau.
const TOP_BAR_H = '30.4688px'

export function SiteHeader({ settings }: { settings: SiteSetting }) {
  return (
    // Dính bằng `top` ÂM đúng bằng chiều cao thanh trên: cuộn xuống thì thanh
    // trên trượt khỏi màn hình còn thanh trắng dừng lại ở mép trên — đúng hành
    // vi `stuck` của bản tham chiếu (thanh trên có `hide-for-sticky`) mà không
    // cần listener cuộn hay đo ngưỡng bằng JS.
    <header className="sticky z-40" style={{ top: `calc(-1 * ${TOP_BAR_H})` }}>
      <div className="bg-primary-700 text-white" style={{ height: TOP_BAR_H }}>
        <div className="vnd-container flex h-full items-center justify-between gap-4 text-[13px]/[20.8px]">
          {settings.contactAddress && (
            <p className="truncate uppercase">{settings.contactAddress}</p>
          )}
          {settings.contactPhone && (
            <a href={`tel:${settings.contactPhone}`} className="shrink-0 font-bold hover:underline">
              {settings.contactPhone}
            </a>
          )}
        </div>
      </div>

      {/* 100px ở desktop, 70px dưới 550px — cả hai đều là số đo, không phải ước
          lượng. bg trắng đặc (không phải trắng mờ + backdrop-blur như trước):
          bản tham chiếu dùng nền đặc, và backdrop-filter trên header còn biến
          header thành containing block cho mọi con `position:fixed` bên trong. */}
      <div className="h-[70px] bg-white shadow-[0_1px_0_rgba(0,0,0,0.08)] tile:h-[100px]">
        <div className="vnd-container flex h-full items-center justify-between gap-6">
          <Link href="/" className="flex shrink-0 items-center">
            {settings.logoUrl ? (
              <Image
                src={settings.logoUrl}
                alt={settings.siteName}
                width={200}
                height={42}
                priority
                className="h-[42px] w-auto object-contain"
              />
            ) : (
              <span className="text-[22px]/[1.1] font-bold uppercase text-primary-600 tile:text-[26px]">
                {settings.siteName}
              </span>
            )}
          </Link>

          <nav aria-label="Điều hướng chính" className="hidden items-center gap-7 nav:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative py-[10px] text-[14.4px]/[23.04px] font-bold uppercase tracking-[0.288px] text-black transition-colors duration-200 hover:text-primary-600
                  after:absolute after:bottom-1 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0
                  after:bg-primary-600 after:transition-transform after:duration-300 after:ease-out hover:after:scale-x-100"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <MobileNav items={NAV} />
        </div>
      </div>
    </header>
  )
}
