'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import type { HeroSlide } from '@/lib/hero-slide'
import { buttonClass } from '@/lib/ui/button'

export function HeroSlider({ banners, fallbackTitle }: { banners: HeroSlide[]; fallbackTitle: string }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const count = banners.length

  const go = useCallback((next: number) => setIndex((next % count + count) % count), [count])

  useEffect(() => {
    // Dừng tự chạy khi con trỏ đang ở trong hero hoặc người dùng đang focus vào
    // một nút điều hướng — bị đổi slide ngay lúc đang đọc/đang bấm là rất khó chịu.
    if (count < 2 || paused) return
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), 6000)
    return () => clearInterval(timer)
  }, [count, paused])

  if (count === 0) {
    return (
      <section className="px-4 py-24 text-center"
        style={{
          backgroundImage: 'linear-gradient(125deg, var(--vnd-gradient-from), var(--vnd-gradient-via), var(--vnd-gradient-to))',
          color: 'var(--vnd-primary-fg)',
        }}>
        <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">
          {fallbackTitle || 'Giải pháp cho doanh nghiệp Việt'}
        </h1>
      </section>
    )
  }

  const banner = banners[index]

  return (
    <section aria-roledescription="carousel" aria-label="Banner giới thiệu"
      className="mx-auto w-full max-w-[1680px] px-3 pt-4 pb-2 sm:px-6"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)} onBlurCapture={() => setPaused(false)}>
      {/* Khung ảnh giữ tỉ lệ cố định theo từng cỡ màn hình nên trang không bị
          giật layout lúc ảnh tải xong. Mobile để 4:3 (ảnh chụp phòng ốc dựng
          đứng hơn, cắt ngang quá là mất hết trần và sàn), desktop kéo rộng ra
          21:9 cho đúng dáng banner. */}
      <div className="relative aspect-4/3 w-full overflow-hidden rounded-lg bg-slate-950 sm:aspect-16/9 lg:aspect-[21/9]">
        {/* Mọi ảnh đều nằm sẵn trong DOM và chuyển bằng opacity, nên đổi slide là
            một nhịp mờ chồng chứ không phải ảnh cũ biến mất rồi ảnh mới bật ra.
            Chỉ ảnh đầu đặt priority — các ảnh sau tải thường, không tranh băng
            thông với nội dung đầu trang. */}
        {banners.map((b, i) => (
          b.imageUrl ? (
            <Image key={b.id} src={b.imageUrl} alt={i === index ? (b.imageAlt ?? '') : ''} fill
              sizes="(max-width: 640px) 100vw, (max-width: 1680px) 100vw, 1680px"
              priority={i === 0} aria-hidden={i !== index}
              className={`absolute inset-0 object-cover transition-opacity duration-[1200ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] ${
                i === index ? 'opacity-100' : 'opacity-0'}`} />
          ) : null
        ))}

        {/* Lớp phủ mỏng trên toàn ảnh: chữ nằm giữa nên không thể dồn tối về một
            phía như bố cục cũ, nhưng vẫn cần hạ sáng nền đủ để chữ trắng đọc
            được trên ảnh phòng ốc sáng trưng. */}
        <div aria-hidden className="absolute inset-0 bg-slate-950/25" />

        {/* Hộp chữ: nền tối bán trong suốt, bo nhẹ, rộng theo nội dung. Chính cái
            hộp này (chứ không phải lớp phủ) là thứ bảo đảm tương phản chữ/nền
            đạt chuẩn dù khách thay ảnh nào vào. */}
        <div className="absolute inset-0 flex items-center justify-center px-4">
          {/* Cỡ chữ trên mobile phải nhỏ hẳn: khung 4:3 ở màn 390px chỉ cao khoảng
              270px, mà tiêu đề cỡ desktop ăn hết chỗ rồi đè lên hàng chấm. */}
          <div key={banner.id}
            className="max-w-3xl bg-slate-900/45 px-5 py-4 text-center text-white backdrop-blur-[2px] sm:px-12 sm:py-8 motion-safe:animate-[vnd-reveal_620ms_cubic-bezier(0.22,0.61,0.36,1)_both]">
            <h1 className="text-xl font-semibold uppercase tracking-[0.1em] drop-shadow-sm sm:text-4xl lg:text-5xl">
              {banner.title}
            </h1>
            {banner.subtitle && (
              <p className="mx-auto mt-2 max-w-2xl text-sm italic leading-snug text-white/95 sm:mt-4 sm:text-xl lg:text-2xl">
                {banner.subtitle}
              </p>
            )}
            {banner.ctaHref && banner.ctaLabel && (
              <Link href={banner.ctaHref} className={`mt-4 ${buttonClass({ size: 'md' })} sm:mt-6 sm:h-12 sm:px-7 sm:text-base`}>
                {banner.ctaLabel}
              </Link>
            )}
          </div>
        </div>

        {/* Mũi tên trái/phải: vòng tròn viền mảnh nổi trên ảnh. Ẩn trên màn hình
            hẹp — ở đó chúng đè lên chữ, và người dùng mobile vẫn còn hàng chấm
            để chuyển slide. */}
        {count > 1 && (
          <>
            <SliderArrow direction="prev" onClick={() => go(index - 1)} />
            <SliderArrow direction="next" onClick={() => go(index + 1)} />
          </>
        )}

        {/* Vùng bấm của mỗi chấm là cả nút 24×24px, còn cái chấm nhìn thấy chỉ
            rộng 10px nằm bên trong — WCAG 2.5.8 đòi tối thiểu 24×24px, mà một
            cái chấm 10px thì không tài nào bấm trúng bằng ngón tay. */}
        {count > 1 && (
          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2 sm:bottom-5">
            {banners.map((b, i) => (
              <button key={b.id} type="button" onClick={() => go(i)}
                aria-label={`Chuyển tới banner ${i + 1}`} aria-current={i === index}
                className="group flex size-6 items-center justify-center">
                <span aria-hidden className={`size-2.5 rounded-full ring-1 ring-slate-900/20 transition-all duration-300 ease-out group-hover:bg-white ${
                  i === index ? 'bg-white' : 'bg-white/45'}`} />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function SliderArrow({ direction, onClick }: { direction: 'prev' | 'next'; onClick: () => void }) {
  const isPrev = direction === 'prev'
  return (
    <button type="button" onClick={onClick}
      aria-label={isPrev ? 'Banner trước' : 'Banner kế tiếp'}
      className={`absolute top-1/2 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 text-white transition duration-200 ease-out hover:bg-white/20 sm:flex ${
        isPrev ? 'left-4 lg:left-8' : 'right-4 lg:right-8'}`}>
      <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" className="size-5">
        <path d={isPrev ? 'M15 5 8 12l7 7' : 'M9 5l7 7-7 7'} />
      </svg>
    </button>
  )
}
