import type { SiteSetting } from '@prisma/client'

export function ContactButtons({
  settings, productName, sticky = false,
}: { settings: SiteSetting; productName: string; sticky?: boolean }) {
  const subject = encodeURIComponent(`Hỏi về sản phẩm ${productName}`)
  const wrapper = sticky
    ? 'fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-slate-200 bg-white p-3 sm:hidden'
    : 'hidden flex-wrap gap-3 sm:flex'

  return (
    <div className={wrapper}>
      {settings.contactPhone && (
        <a href={`tel:${settings.contactPhone}`}
          className="flex-1 rounded-full bg-primary-600 px-6 py-3 text-center font-semibold text-primary-fg">
          Gọi {settings.contactPhone}
        </a>
      )}
      {settings.contactEmail && (
        <a href={`mailto:${settings.contactEmail}?subject=${subject}`}
          className="flex-1 rounded-full border border-primary-600 px-6 py-3 text-center font-semibold text-primary-700">
          Gửi email
        </a>
      )}
      {settings.zaloUrl && (
        <a href={settings.zaloUrl} target="_blank" rel="noopener noreferrer"
          className="flex-1 rounded-full border border-slate-300 px-6 py-3 text-center font-semibold text-slate-700">
          Nhắn Zalo
        </a>
      )}
    </div>
  )
}
