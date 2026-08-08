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

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname()

  return (
    <>
      {/* Nền mờ chỉ tồn tại ở chế độ ngăn kéo; từ lg trở lên sidebar đứng cố định
          nên không được phép có lớp phủ nào. */}
      <div
        onClick={onClose}
        aria-hidden
        className={`fixed inset-0 z-40 bg-slate-950/40 transition-opacity duration-300 lg:hidden ${
          open ? 'visible opacity-100' : 'invisible opacity-0'
        }`}
      />

      <nav
        id="admin-sidebar"
        aria-label="Điều hướng quản trị"
        className={`fixed inset-y-0 left-0 z-50 w-64 shrink-0 overflow-y-auto border-r border-slate-200 bg-white p-4
          transition-transform duration-300 ease-out
          lg:static lg:z-auto lg:w-56 lg:translate-x-0 lg:transition-none ${
            open ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="mb-4 flex items-center justify-between">
          <p className="px-2 text-sm font-bold text-slate-900">VNDERCO</p>
          <button type="button" onClick={onClose} aria-label="Đóng menu quản trị"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" aria-hidden><path d="M5 5l14 14" /><path d="M19 5L5 19" /></svg>
          </button>
        </div>

        <ul className="space-y-1">
          {LINKS.map((link) => {
            const active = link.href === '/admin' ? pathname === '/admin' : pathname.startsWith(link.href)
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={`block rounded-lg px-3 py-2.5 text-sm transition-colors ${
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
    </>
  )
}
