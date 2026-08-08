'use client'

import Link from 'next/link'
import { useEffect, useRef, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { useMenuDisclosure } from '@/components/useMenuDisclosure'

type NavItem = { href: string; label: string }

// Trả về false lúc render phía server, true sau khi đã hydrate. Dùng
// useSyncExternalStore thay vì useState + useEffect vì đặt state trong effect
// vừa thừa một lượt render vừa bị ESLint chặn (react-hooks/set-state-in-effect).
const subscribe = () => () => {}
const useIsClient = () => useSyncExternalStore(subscribe, () => true, () => false)

export function MobileNav({ items, ctaHref, ctaLabel }: { items: NavItem[]; ctaHref: string; ctaLabel: string }) {
  const { open, setOpen } = useMenuDisclosure()
  const isClient = useIsClient()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const wasOpen = useRef(false)

  useEffect(() => {
    if (open) {
      panelRef.current?.querySelector<HTMLElement>('a')?.focus()
    } else if (wasOpen.current) {
      // Chỉ kéo focus về nút mở khi menu VỪA đóng, không phải ở lần render đầu —
      // nếu không, mở trang lên là trình duyệt tự nhảy focus vào nút hamburger.
      triggerRef.current?.focus()
    }
    wasOpen.current = open
  }, [open])

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Đóng menu' : 'Mở menu'}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        className="-mr-2 flex h-11 w-11 items-center justify-center rounded-lg text-slate-700 transition-colors hover:bg-slate-100 sm:hidden"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" aria-hidden>
          {open
            ? <><path d="M5 5l14 14" /><path d="M19 5L5 19" /></>
            : <><path d="M3 6h18" /><path d="M3 12h18" /><path d="M3 18h18" /></>}
        </svg>
      </button>

      {/* Cả lớp nền mờ lẫn panel phải được đưa thẳng ra <body> bằng portal.
          Lý do: <header> có `backdrop-blur`, tức backdrop-filter, và bất kỳ phần
          tử nào có backdrop-filter/filter/transform đều TRỞ THÀNH containing
          block cho con cháu `position: fixed`. Để nguyên trong header thì
          `fixed inset-0` không bám vào khung nhìn nữa mà bám vào cái header cao
          68px — đo được panel nằm ở top:-62, cao 68px, tức menu bị nhốt trong
          thanh header. Test e2e không bắt được vì nó chỉ hỏi ẩn/hiện chứ không
          hỏi kích thước. */}
      {isClient && createPortal(
        <>
      {/* Nền mờ phía sau. Bấm ra ngoài là đóng — thói quen ai cũng có. */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden
        className={`fixed inset-0 z-40 bg-slate-950/40 transition-opacity duration-300 sm:hidden ${
          open ? 'visible opacity-100' : 'invisible opacity-0'
        }`}
      />

      {/* Khung cắt. Bắt buộc phải có: panel lúc đóng bị đẩy sang phải bằng
          translate-x-full, mà một phần tử `fixed` nằm ngoài mép phải VẪN tính vào
          scrollWidth của tài liệu → cả trang sinh thanh cuộn ngang trên điện
          thoại (e2e bắt được đúng lỗi này). Cắt nó ở một khung fixed inset-0 thì
          phần thò ra biến mất. Không dùng overflow-x:hidden trên body vì cách đó
          làm hỏng position:sticky của header.
          pointer-events-none để khung trong suốt với chuột, nhường click cho lớp
          nền mờ nằm dưới; riêng panel bật lại pointer-events. */}
      <div
        aria-hidden={!open}
        className={`pointer-events-none fixed inset-0 z-50 overflow-hidden sm:hidden ${
          open ? 'visible' : 'invisible'
        }`}
      >
        <div
          id="mobile-nav-panel"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className={`pointer-events-auto absolute inset-y-0 right-0 flex w-72 max-w-[85vw] flex-col gap-1 border-l border-slate-200 bg-white p-4 shadow-2xl transition-transform duration-300 ease-out ${
            open ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="mb-2 flex justify-end">
            <button type="button" onClick={() => setOpen(false)} aria-label="Đóng menu"
              className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" aria-hidden><path d="M5 5l14 14" /><path d="M19 5L5 19" /></svg>
            </button>
          </div>

          {items.map((item) => (
            <Link key={item.href} href={item.href}
              className="rounded-lg px-3 py-3 text-base font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900">
              {item.label}
            </Link>
          ))}

          <Link href={ctaHref}
            className="mt-3 rounded-full bg-primary-600 px-4 py-3 text-center font-semibold text-primary-fg transition hover:brightness-110">
            {ctaLabel}
          </Link>
        </div>
      </div>
        </>,
        document.body,
      )}
    </>
  )
}
