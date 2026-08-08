'use client'

import { Sidebar } from '@/components/admin/Sidebar'
import { useMenuDisclosure } from '@/components/useMenuDisclosure'

/**
 * Khung trang quản trị. Phải là client component vì nút mở menu nằm ở thanh
 * header còn ngăn kéo nằm ở cột bên trái — hai anh em cạnh nhau, cần chung một
 * trạng thái đóng/mở, mà layout thì là server component nên không giữ state được.
 *
 * Form đăng xuất được truyền vào qua prop `logout` thay vì dựng ở đây: nó gọi
 * một server action, thứ chỉ khai báo được từ phía server.
 */
export function AdminShell({
  email, logout, children,
}: { email?: string | null; logout: React.ReactNode; children: React.ReactNode }) {
  const { open, setOpen } = useMenuDisclosure()

  return (
    <div className="flex">
      <Sidebar open={open} onClose={() => setOpen(false)} />

      {/* min-w-0 là thứ giữ cho cả trang không bị kéo giãn: mặc định một flex
          item không co nhỏ hơn nội dung của nó, nên một cái bảng rộng sẽ đẩy
          toàn trang ra và sinh cuộn ngang. Có min-w-0 thì bảng tự cuộn trong
          khung của nó (xem AdminListShell) thay vì kéo theo cả header. */}
      <div className="min-w-0 flex-1">
        <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Mở menu quản trị"
            aria-expanded={open}
            aria-controls="admin-sidebar"
            className="-ml-2 flex h-11 w-11 items-center justify-center rounded-lg text-slate-700 transition-colors hover:bg-slate-100 lg:hidden"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" aria-hidden>
              <path d="M3 6h18" /><path d="M3 12h18" /><path d="M3 18h18" />
            </svg>
          </button>

          <span className="truncate text-sm text-slate-600">{email}</span>
          <div className="ml-auto shrink-0">{logout}</div>
        </header>

        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}
