'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Con số đếm lên khi cuộn tới.
 *
 * Chạy MỘT LẦN rồi ngắt observer: đếm lại mỗi lần cuộn qua trông như trang bị
 * lỗi chứ không phải hiệu ứng.
 *
 * Nhịp đếm dùng đường cong ease-out (1-(1-t)³) chứ không tuyến tính — số nhảy
 * nhanh lúc đầu rồi chậm dần về đích, giống cách đồng hồ cơ dừng lại, đỡ cảm
 * giác máy móc. Ai bật "giảm chuyển động" thì thấy ngay số cuối, không đếm.
 */
export function StatCounter({
  value, suffix = '', label, duration = 1400,
}: { value: number; suffix?: string; label: string; duration?: number }) {
  const [shown, setShown] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const done = useRef(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting || done.current) return
      done.current = true
      observer.disconnect()

      // Kiểm tra "giảm chuyển động" ở ĐÂY chứ không phải ngay trong effect: đặt
      // state đồng bộ lúc effect chạy là một lượt render thừa ngay sau lượt đầu,
      // và eslint chặn đúng chỗ đó (react-hooks/set-state-in-effect).
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setShown(value)
        return
      }

      const start = performance.now()
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / duration)
        setShown(Math.round(value * (1 - Math.pow(1 - t, 3))))
        if (t < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }, { threshold: 0.4 })

    observer.observe(node)
    return () => observer.disconnect()
  }, [value, duration])

  return (
    <div ref={ref} className="text-center">
      <div className="text-[34px]/[1.1] font-bold text-primary-600 tile:text-[42px]">
        {shown.toLocaleString('vi-VN')}
        <span className="text-[22px] tile:text-[26px]">{suffix}</span>
      </div>
      <div className="mt-2 text-[14.4px]/[23.04px] text-black/70">{label}</div>
    </div>
  )
}
