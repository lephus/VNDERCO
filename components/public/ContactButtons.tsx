import type { SiteSetting } from '@prisma/client'

export function ContactButtons({
  settings, productName, sticky = false,
}: { settings: SiteSetting; productName: string; sticky?: boolean }) {
  const subject = encodeURIComponent(`Hỏi về sản phẩm ${productName}`)

  const wrapper = sticky
    ? 'fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-slate-200 bg-white p-3 sm:hidden'
    : 'hidden flex-wrap gap-3 sm:flex'

  // Ở bản dính đáy trên điện thoại, ba nút trước đây đều là flex-1 nên bị ép
  // rộng bằng nhau; nút "Gọi 0900000000" dài nhất không đủ chỗ, kéo cả ba xuống
  // dòng thành "Gửi / email", "Nhắn / Zalo". Nay chỉ nút gọi được giãn, hai nút
  // còn lại giữ đúng bề rộng nội dung, và cấm xuống dòng.
  const base = sticky
    ? 'whitespace-nowrap rounded-full px-4 py-3 text-center text-sm font-semibold'
    : 'flex-1 rounded-full px-6 py-3 text-center font-semibold'
  const grow = sticky ? 'flex-1' : ''
  const fixed = sticky ? 'shrink-0' : ''

  return (
    <div className={wrapper}>
      {settings.contactPhone && (
        <a href={`tel:${settings.contactPhone}`}
          className={`${base} ${grow} bg-primary-600 text-primary-fg transition duration-200 hover:brightness-110 active:brightness-95`}>
          Gọi {settings.contactPhone}
        </a>
      )}
      {settings.contactEmail && (
        <a href={`mailto:${settings.contactEmail}?subject=${subject}`}
          className={`${base} ${fixed} border border-primary-600 text-primary-700 transition duration-200 hover:bg-primary-50`}>
          Gửi email
        </a>
      )}
      {settings.zaloUrl && (
        <a href={settings.zaloUrl} target="_blank" rel="noopener noreferrer"
          className={`${base} ${fixed} border border-slate-300 text-slate-700 transition duration-200 hover:bg-slate-50`}>
          Nhắn Zalo
        </a>
      )}
    </div>
  )
}
