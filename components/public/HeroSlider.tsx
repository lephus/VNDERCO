'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import type { HeroSlide } from '@/lib/hero-slide'
import { buttonClass } from '@/lib/ui/button'

/**
 * Băng ảnh đầu trang.
 *
 * Tỉ lệ khung 1050/426 (≈2,463:1) GIỮ NGUYÊN ở mọi bề rộng — đo trên bản tham
 * chiếu ở cả ba cỡ màn: 1050×426, 738×299, 360×146, ra cùng một tỉ lệ. Vì vậy ở
 * đây chỉ có một `aspect-[1050/426]` chứ không phải mỗi điểm ngắt một tỉ lệ.
 *
 * Hàng chấm ĐÈ LÊN mép dưới của ảnh (tâm chấm cách đáy 24,5px), không nằm dưới
 * khung. Mũi tên là nút tròn 36px. Khung không tự bọc container: trang chủ dựng
 * một khung 1050px chung cho mọi khối, bọc thêm ở đây là lồng hai lớp đệm.
 *
 * Bản tham chiếu chạy slide toàn ảnh, không có chữ. Ở đây vẫn giữ hộp chữ vì
 * banner trong admin có tiêu đề/mô tả/nút riêng — nhưng chỉ dựng hộp khi banner
 * thực sự có tiêu đề, nên banner chỉ-có-ảnh trông đúng như bản gốc.
 */
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
      <section>
        <div className="flex aspect-[1050/426] items-center justify-center bg-primary-600 px-4 text-center">
          <h1 className="max-w-3xl text-[24px]/[1.3] font-bold text-primary-fg tile:text-[36px]">
            {fallbackTitle || 'Giải pháp cho doanh nghiệp Việt'}
          </h1>
        </div>
      </section>
    )
  }

  const banner = banners[index]

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Banner giới thiệu"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="relative aspect-[1050/426] w-full overflow-hidden bg-slate-950">
        {/* Mọi ảnh đều nằm sẵn trong DOM và chuyển bằng opacity, nên đổi slide là
            một nhịp mờ chồng chứ không phải ảnh cũ biến mất rồi ảnh mới bật ra.
            Chỉ ảnh đầu đặt priority — các ảnh sau tải thường, không tranh băng
            thông với nội dung đầu trang. */}
        {banners.map((b, i) =>
          b.imageUrl ? (
            <Image
              key={b.id}
              src={b.imageUrl}
              alt={i === index ? (b.imageAlt ?? '') : ''}
              fill
              sizes="(max-width: 1080px) 100vw, 1050px"
              priority={i === 0}
              aria-hidden={i !== index}
              className={`absolute inset-0 object-cover transition-opacity duration-[1200ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] ${
                i === index ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ) : null,
        )}

        {/* Hộp chữ nằm giữa ảnh. `key={banner.id}` là chi tiết quan trọng chứ
            không thừa: đổi key thì React dựng lại nút, nhờ vậy animation chạy
            LẠI mỗi lần sang slide mới — giữ nguyên key thì chữ chỉ vào một lần
            rồi đứng im suốt các slide sau.

            Nền xám trung tính chứ không phải màu thương hiệu: hộp này nằm đè lên
            ảnh công trình có đủ tông màu, một mảng xám ngả tối ăn được với mọi
            tấm, còn mảng xanh thì tấm nào ngả xanh là chìm mất. */}
        {banner.title && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-4">
            <div
              key={banner.id}
              className="pointer-events-auto w-full max-w-[74%] bg-neutral-500/55 px-5 py-5 text-center text-white tile:px-12 tile:py-8 motion-safe:animate-[vnd-hero-box_560ms_cubic-bezier(0.22,0.61,0.36,1)_both]"
            >
              <h1
                className="font-[family-name:var(--font-serif)] text-[17px]/[1.2] font-bold tracking-[0.06em] uppercase [text-shadow:0_2px_10px_rgb(0_0_0/0.35)] tile:text-[30px] nav:text-[38px] motion-safe:animate-[vnd-hero-line_620ms_cubic-bezier(0.22,0.61,0.36,1)_140ms_both]"
              >
                {banner.title}
              </h1>
              {banner.subtitle && (
                <p
                  className="mx-auto mt-2 max-w-2xl font-[family-name:var(--font-serif)] text-[13px]/[1.45] italic [text-shadow:0_2px_10px_rgb(0_0_0/0.35)] tile:mt-3 tile:text-[19px]/[1.5] motion-safe:animate-[vnd-hero-line_620ms_cubic-bezier(0.22,0.61,0.36,1)_260ms_both]"
                >
                  {banner.subtitle}
                </p>
              )}
              {banner.ctaHref && banner.ctaLabel && (
                <Link
                  href={banner.ctaHref}
                  className={`mt-5 motion-safe:animate-[vnd-hero-line_620ms_cubic-bezier(0.22,0.61,0.36,1)_380ms_both] ${buttonClass({ size: 'md', variant: 'onDark' })}`}
                >
                  {banner.ctaLabel}
                </Link>
              )}
            </div>
          </div>
        )}

        {count > 1 && (
          <>
            <SliderArrow direction="prev" onClick={() => go(index - 1)} />
            <SliderArrow direction="next" onClick={() => go(index + 1)} />
          </>
        )}

        {/* Hàng chấm nằm ĐÈ LÊN mép dưới của ảnh, không nằm dưới khung. Đo trên
            bản tham chiếu: tâm chấm cách đáy khung 24,5px, chấm trắng 12px, hai
            chấm cách nhau 22px.

            Vùng bấm là cả nút 22×24px chứ không chỉ cái chấm 12px: WCAG 2.5.8
            đòi tối thiểu 24px một chiều, mà bấm trúng chấm 12px bằng ngón tay
            thì gần như không thể. */}
        {count > 1 && (
          <div className="absolute inset-x-0 bottom-[12px] flex justify-center">
            {banners.map((b, i) => (
              <button
                key={b.id}
                type="button"
                onClick={() => go(i)}
                aria-label={`Chuyển tới banner ${i + 1}`}
                aria-current={i === index}
                className="group flex h-6 w-[22px] items-center justify-center"
              >
                <span
                  aria-hidden
                  className={`size-3 rounded-full bg-white transition-opacity duration-300 ease-out group-hover:opacity-100 ${
                    i === index ? 'opacity-100' : 'opacity-40'
                  }`}
                />
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
    // Nút tròn 36px, nền trắng mờ — đo được `border-radius: 100%` và 36×36 trên
    // bản tham chiếu. Ẩn dưới 550px: ở đó nút đè lên ảnh và đã có hàng chấm.
    <button
      type="button"
      onClick={onClick}
      aria-label={isPrev ? 'Banner trước' : 'Banner kế tiếp'}
      className={`absolute top-1/2 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/25 text-white backdrop-blur-[2px] transition duration-200 ease-out hover:bg-white/40 tile:flex ${
        isPrev ? 'left-4' : 'right-4'
      }`}
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5"
      >
        <path d={isPrev ? 'M15 5 8 12l7 7' : 'M9 5l7 7-7 7'} />
      </svg>
    </button>
  )
}
