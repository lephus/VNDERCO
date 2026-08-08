'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Nút quay lên đầu trang, chỉ hiện sau khi đã cuộn xuống đủ xa.
 *
 * Dùng IntersectionObserver trên một mốc vô hình đặt ở đầu trang thay vì nghe
 * sự kiện `scroll`: trình duyệt tự báo khi mốc ra/vào khung nhìn, nên không có
 * hàm nào chạy trên từng khung hình cuộn.
 */
export function BackToTop() {
  const [show, setShow] = useState(false)
  const sentinel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = sentinel.current
    if (!node) return
    const observer = new IntersectionObserver(([entry]) => setShow(!entry.isIntersecting))
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const toTop = () => {
    // `smooth` chỉ khi người dùng không yêu cầu giảm chuyển động; nếu có thì
    // nhảy thẳng, vì cuộn mượt cả trang dài là kiểu chuyển động dễ gây chóng mặt.
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
  }

  return (
    <>
      {/* Mốc cao 1px, đặt ở đỉnh nội dung. Cuộn qua khỏi ~600px thì nút hiện. */}
      <div ref={sentinel} aria-hidden className="absolute top-[600px] h-px w-full" />
      <button
        type="button"
        onClick={toTop}
        aria-label="Lên đầu trang"
        // `invisible` khi ẩn để nút không nằm trong thứ tự tab lúc chưa dùng tới.
        className={`fixed bottom-24 right-4 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-slate-900/80 text-white shadow-lg backdrop-blur transition-all duration-300 hover:bg-slate-900 sm:bottom-6 ${
          show ? 'visible translate-y-0 opacity-100' : 'invisible translate-y-2 opacity-0'
        }`}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12 19V5" /><path d="M5 12l7-7 7 7" />
        </svg>
      </button>
    </>
  )
}
