import Link from 'next/link'
import type { SiteSetting } from '@prisma/client'

export function SiteFooter({ settings }: { settings: SiteSetting }) {
  return (
    <footer className="mt-20 border-t border-slate-100 bg-slate-50">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3">
        <div>
          <p className="text-lg font-extrabold">{settings.siteName}</p>
          {settings.contactAddress && <p className="mt-2 text-sm text-slate-600">{settings.contactAddress}</p>}
        </div>
        <div className="text-sm text-slate-600">
          <p className="mb-2 font-semibold text-slate-900">Liên hệ</p>
          {settings.contactPhone && <p><a href={`tel:${settings.contactPhone}`} className="hover:underline">{settings.contactPhone}</a></p>}
          {settings.contactEmail && <p><a href={`mailto:${settings.contactEmail}`} className="hover:underline">{settings.contactEmail}</a></p>}
        </div>
        <div className="text-sm text-slate-600">
          <p className="mb-2 font-semibold text-slate-900">Liên kết</p>
          <p><Link href="/san-pham" className="hover:underline">Sản phẩm</Link></p>
          <p><Link href="/tin-tuc" className="hover:underline">Tin tức</Link></p>
          {settings.facebookUrl && <p><a href={settings.facebookUrl} className="hover:underline">Facebook</a></p>}
          {settings.zaloUrl && <p><a href={settings.zaloUrl} className="hover:underline">Zalo</a></p>}
        </div>
      </div>
      <p className="border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} {settings.siteName}
      </p>
    </footer>
  )
}
