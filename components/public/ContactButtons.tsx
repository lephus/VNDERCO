import type { SiteSetting } from '@prisma/client'
import { buttonClass } from '@/lib/ui/button'

export function ContactButtons({
  settings, productName, sticky = false,
}: { settings: SiteSetting; productName: string; sticky?: boolean }) {
  const subject = encodeURIComponent(`Hỏi về sản phẩm ${productName}`)

  const wrapper = sticky
    ? 'fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-slate-200 bg-white p-3 sm:hidden'
    // Bản trên máy tính nằm trong cột thông tin sản phẩm, chỉ rộng nửa trang.
    // Trước đây ba nút đều flex-1 nên "Gọi 0900000000" không đủ chỗ và bị bẻ đôi
    // — đo được nút cao 72px thay vì 48px. Nay cho xuống dòng cả nút (flex-wrap)
    // thay vì bẻ đôi chữ bên trong.
    : 'hidden flex-wrap gap-3 sm:flex'

  // Chỉ nút gọi được giãn; hai nút còn lại giữ đúng bề rộng nội dung. Cùng lý do
  // như trên: chia đều ba phần thì nhãn dài nhất luôn là nhãn bị vỡ.
  const grow = sticky ? 'flex-1' : ''
  const size = sticky ? 'md' : 'lg'

  return (
    <div className={wrapper}>
      {settings.contactPhone && (
        <a href={`tel:${settings.contactPhone}`}
          className={buttonClass({ size, variant: 'primary', lift: !sticky, className: grow })}>
          Gọi {settings.contactPhone}
        </a>
      )}
      {settings.contactEmail && (
        <a href={`mailto:${settings.contactEmail}?subject=${subject}`}
          className={buttonClass({ size, variant: 'secondary', lift: !sticky })}>
          Gửi email
        </a>
      )}
      {settings.zaloUrl && (
        <a href={settings.zaloUrl} target="_blank" rel="noopener noreferrer"
          className={buttonClass({ size, variant: 'neutral', lift: !sticky })}>
          Nhắn Zalo
        </a>
      )}
    </div>
  )
}
