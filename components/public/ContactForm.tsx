'use client'

import { useState } from 'react'
import { buttonClass } from '@/lib/ui/button'

/**
 * Form yêu cầu báo giá.
 *
 * Bấm gửi là mở sẵn thư trong ứng dụng mail của khách với đầy đủ nội dung đã
 * điền, KHÔNG phải gửi ngầm lên server. Đây là lựa chọn có chủ ý: dự án chưa có
 * dịch vụ gửi mail lẫn hộp thư trong admin, mà một cái form nhận dữ liệu rồi
 * hiện "gửi thành công" trong khi chẳng có ai đọc được thì tệ hơn là không có
 * form — khách tưởng đã liên hệ xong và ngồi đợi.
 *
 * Muốn nhận thẳng vào hệ thống thì cần thêm bảng lưu tin nhắn và một trang đọc
 * trong admin; lúc đó chỉ việc đổi handleSubmit sang gọi server action.
 */
export function ContactForm({ email }: { email: string }) {
  const [sent, setSent] = useState(false)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const get = (k: string) => String(data.get(k) ?? '').trim()

    const body = [
      `Họ tên: ${get('name')}`,
      `Điện thoại: ${get('phone')}`,
      `Hạng mục quan tâm: ${get('topic')}`,
      `Diện tích ước tính: ${get('area') || 'chưa rõ'}`,
      '',
      get('message'),
    ].join('\n')

    window.location.href =
      `mailto:${email}?subject=${encodeURIComponent(`Yêu cầu báo giá — ${get('name')}`)}` +
      `&body=${encodeURIComponent(body)}`
    setSent(true)
  }

  const field = 'h-11 w-full border border-black/15 bg-white px-3 text-[15px] transition-colors duration-200 focus:border-primary-600 focus:outline-none'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="-mx-2 flex flex-wrap">
        <div className="w-full px-2 pb-4 tile:w-1/2">
          <label htmlFor="cf-name" className="mb-1 block text-[14.4px] font-bold">Họ tên *</label>
          <input id="cf-name" name="name" required autoComplete="name" className={field} />
        </div>
        <div className="w-full px-2 pb-4 tile:w-1/2">
          <label htmlFor="cf-phone" className="mb-1 block text-[14.4px] font-bold">Điện thoại *</label>
          <input id="cf-phone" name="phone" required inputMode="tel" autoComplete="tel" className={field} />
        </div>
        <div className="w-full px-2 pb-4 tile:w-1/2">
          <label htmlFor="cf-topic" className="mb-1 block text-[14.4px] font-bold">Hạng mục quan tâm</label>
          <select id="cf-topic" name="topic" className={field} defaultValue="Tấm ốp tường">
            {['Tấm ốp tường', 'Lam trang trí', 'Trần nhựa / trần gỗ', 'Sàn gỗ - sàn nhựa',
              'Gỗ nhựa ngoài trời', 'Cửa nhựa - vách ngăn', 'Hạng mục khác'].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>
        <div className="w-full px-2 pb-4 tile:w-1/2">
          <label htmlFor="cf-area" className="mb-1 block text-[14.4px] font-bold">Diện tích ước tính</label>
          <input id="cf-area" name="area" placeholder="ví dụ 80 m²" className={field} />
        </div>
        <div className="w-full px-2 pb-4">
          <label htmlFor="cf-message" className="mb-1 block text-[14.4px] font-bold">Nội dung</label>
          <textarea
            id="cf-message" name="message" rows={4}
            placeholder="Mô tả ngắn hiện trạng và mong muốn của bạn"
            className="w-full border border-black/15 bg-white px-3 py-2 text-[15px]/[25.6px] transition-colors duration-200 focus:border-primary-600 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className={buttonClass({ size: 'lg' })}>Gửi yêu cầu báo giá</button>
        {/* Nói rõ chuyện gì sắp xảy ra: bấm xong mà ứng dụng mail bật lên bất ngờ
            thì khách tưởng trang bị lỗi. */}
        <p className="text-[13px]/[20.8px] text-black/55">
          {sent
            ? 'Đã mở sẵn thư trong ứng dụng mail của bạn — bấm gửi ở đó là xong.'
            : 'Bấm gửi sẽ mở ứng dụng mail với nội dung đã điền sẵn.'}
        </p>
      </div>
    </form>
  )
}
