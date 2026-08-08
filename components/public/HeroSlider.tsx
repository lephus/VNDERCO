'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { Banner } from '@prisma/client'
import { buttonClass } from '@/lib/ui/button'

export function HeroSlider({ banners, fallbackTitle }: { banners: Banner[]; fallbackTitle: string }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    // Dừng tự chạy khi con trỏ đang ở trong hero hoặc người dùng đang focus vào
    // một nút chấm — bị đổi slide ngay lúc đang đọc/đang bấm là rất khó chịu.
    if (banners.length < 2 || paused) return
    const timer = setInterval(() => setIndex((i) => (i + 1) % banners.length), 6000)
    return () => clearInterval(timer)
  }, [banners.length, paused])

  const gradient = {
    backgroundImage: 'linear-gradient(125deg, var(--vnd-gradient-from), var(--vnd-gradient-via), var(--vnd-gradient-to))',
    color: 'var(--vnd-primary-fg)',
  }

  if (banners.length === 0) {
    return (
      <section style={gradient} className="px-4 py-24 text-center">
        <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">
          {fallbackTitle || 'Giải pháp cho doanh nghiệp Việt'}
        </h1>
      </section>
    )
  }

  const banner = banners[index]

  return (
    // Nền sẫm cố định, KHÔNG phải gradient thương hiệu: ảnh banner hiển thị ở
    // độ đậm đầy đủ và là thứ người xem nhìn thấy trước tiên. Trước đây ảnh bị
    // để opacity 25% chồng lên gradient, nên ảnh nào tải lên cũng bị nuốt mất
    // và hero luôn trông như một mảng màu phẳng. Màu thương hiệu vẫn hiện diện
    // ở nút CTA nên đổi bảng màu trong admin vẫn thấy tác dụng ngay tại hero.
    <section className="relative overflow-hidden bg-slate-950 text-white"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)} onBlurCapture={() => setPaused(false)}>
      {/* Mọi ảnh đều nằm sẵn trong DOM và chuyển bằng opacity, nên đổi slide là
          một nhịp mờ chồng chứ không phải ảnh cũ biến mất rồi ảnh mới bật ra.
          Chỉ ảnh đầu đặt priority — các ảnh sau tải thường, không tranh băng
          thông với nội dung đầu trang. */}
      {banners.map((b, i) => (
        b.imageUrl ? (
          <Image key={b.id} src={b.imageUrl} alt={i === index ? (b.imageAlt ?? '') : ''} fill
            priority={i === 0} aria-hidden={i !== index}
            className={`absolute inset-0 object-cover transition-opacity duration-[1200ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] ${
              i === index ? 'opacity-100' : 'opacity-0'}`} />
        ) : null
      ))}
      {/* Lớp phủ tối dồn về bên trái — nơi đặt chữ — để tiêu đề luôn đọc được
          dù khách tải lên ảnh sáng hay tối. */}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/75 to-slate-950/10" />
      <div className="relative mx-auto max-w-6xl px-4 py-24 sm:py-32">
        {/* key đổi theo slide → React gắn lại nhánh này → animation chạy lại từ
            đầu cho chữ của slide mới, không cần thư viện animation nào. */}
        <div key={banner.id} className="motion-safe:animate-[vnd-reveal_620ms_cubic-bezier(0.22,0.61,0.36,1)_both]">
          <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">{banner.title}</h1>
          {banner.subtitle && <p className="mt-4 max-w-xl text-lg text-white/80">{banner.subtitle}</p>}
          {banner.ctaHref && banner.ctaLabel && (
            <Link href={banner.ctaHref} className={`mt-8 ${buttonClass({ size: 'lg' })}`}>
              {banner.ctaLabel}
            </Link>
          )}
        </div>
        {/* Vùng bấm của mỗi chấm là cả nút cao 24px, còn cái gạch nhìn thấy chỉ
            cao 2px nằm bên trong. Trước đây nút chính là cái gạch 8px — nhỏ hơn
            mức tối thiểu 24×24px của WCAG 2.5.8 và rất khó bấm trúng bằng ngón tay. */}
        {banners.length > 1 && (
          <div className="mt-6 flex gap-1">
            {banners.map((b, i) => (
              <button key={b.id} type="button" onClick={() => setIndex(i)}
                aria-label={`Chuyển tới banner ${i + 1}`} aria-current={i === index}
                className="group flex h-6 min-w-6 items-center justify-center">
                <span aria-hidden className={`h-2 rounded-full transition-all duration-500 ease-out group-hover:bg-white ${
                  i === index ? 'w-8 bg-white' : 'w-2 bg-white/50'}`} />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
