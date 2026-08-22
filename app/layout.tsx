import type { Metadata } from 'next'
import { Lora, Roboto } from 'next/font/google'
import './globals.css'

// Roboto là font của bản thiết kế tham chiếu — cả trang chỉ dùng đúng hai nét
// 400 và 700, và toàn bộ thang chữ (16/25.6, 23.552/30.6176, 14.4/23.04) được
// đo trên chính font này, nên đổi sang font khác là lệch ngay chiều cao dòng.
//
// Đánh đổi có ý thức so với Be Vietnam Pro dùng trước đây: Be Vietnam Pro vẽ tay
// dấu tiếng Việt nên đặt dấu đẹp hơn ở cỡ chữ lớn. Roboto có subset `vietnamese`
// đầy đủ và hiển thị đúng, chỉ là dấu được ghép chứ không vẽ riêng. Ở đây ưu
// tiên khớp bản thiết kế; muốn quay lại thì đổi đúng import này.
const sans = Roboto({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-sans-vnd',
})

// Serif CHỈ dùng cho hộp chữ trên băng ảnh đầu trang — nơi cần một giọng khác
// hẳn phần còn lại để câu giới thiệu không bị đọc như một dòng nội dung nữa.
// Lora có subset `vietnamese` và có nét nghiêng thật (không phải nghiêng giả do
// trình duyệt bóp chữ), nên phụ đề nghiêng vẫn ra đúng dáng chữ.
const serif = Lora({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-serif-vnd',
})

export const metadata: Metadata = { title: 'VNDERCO' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${sans.variable} ${serif.variable}`}>
      <body className="bg-white text-slate-900 antialiased">{children}</body>
    </html>
  )
}
