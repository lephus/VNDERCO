import type { Metadata } from 'next'
import { Be_Vietnam_Pro } from 'next/font/google'
import './globals.css'

// Font được thiết kế riêng cho tiếng Việt: dấu thanh, dấu mũ và các chữ ơ/ư
// được vẽ tay chứ không phải ghép máy móc như font phương Tây có thêm bộ dấu.
// Trước đây globals.css ép body dùng Arial (còn sót từ lúc dựng dự án) nên cả
// site chạy bằng font hệ thống, và biến --font-sans trong @theme trỏ vào một
// biến không ai định nghĩa.
const sans = Be_Vietnam_Pro({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-sans-vnd',
})

export const metadata: Metadata = { title: 'VNDERCO' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={sans.variable}>
      <body className="bg-white text-slate-900 antialiased">{children}</body>
    </html>
  )
}
