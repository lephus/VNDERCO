'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LINKS = [
  { href: '/admin', label: 'Tổng quan' },
  { href: '/admin/tin-tuc', label: 'Tin tức' },
  { href: '/admin/san-pham', label: 'Sản phẩm' },
  { href: '/admin/danh-muc', label: 'Danh mục' },
  { href: '/admin/trang', label: 'Trang tĩnh' },
  { href: '/admin/banner', label: 'Banner' },
  { href: '/admin/thu-vien', label: 'Thư viện ảnh' },
  { href: '/admin/cai-dat', label: 'Cài đặt' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <nav aria-label="Điều hướng quản trị" className="w-56 shrink-0 border-r border-slate-200 bg-white p-4">
      <p className="mb-4 px-2 text-sm font-bold text-slate-900">VNDERCO</p>
      <ul className="space-y-1">
        {LINKS.map((link) => {
          const active = link.href === '/admin' ? pathname === '/admin' : pathname.startsWith(link.href)
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={`block rounded-lg px-3 py-2 text-sm ${
                  active ? 'bg-primary-50 font-semibold text-primary-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
