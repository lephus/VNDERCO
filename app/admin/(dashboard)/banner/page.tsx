import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { AdminListShell } from '@/components/admin/AdminListShell'
import { DeleteButton } from '@/components/admin/DeleteButton'
import { deleteBannerAction } from '@/lib/actions/banner'

export const metadata = { title: 'Banner' }

export default async function BannerListPage() {
  const banners = await prisma.banner.findMany({ orderBy: { order: 'asc' } })

  return (
    <AdminListShell title="Banner" createHref="/admin/banner/moi" createLabel="Thêm banner">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-slate-500">
          <tr><th className="p-3">Ảnh</th><th className="p-3">Tiêu đề</th><th className="p-3">Thứ tự</th><th className="p-3">Hiển thị</th><th className="p-3" /></tr>
        </thead>
        <tbody>
          {banners.map((b) => (
            <tr key={b.id} className="border-t border-slate-100">
              <td className="p-3">
                <Image src={b.imageUrl} alt={b.imageAlt ?? ''} width={96} height={54} className="h-14 w-24 rounded-lg object-cover" />
              </td>
              <td className="p-3">
                <Link href={`/admin/banner/${b.id}`} className="font-medium text-slate-900 hover:underline">{b.title}</Link>
              </td>
              <td className="p-3">{b.order}</td>
              <td className="p-3">{b.active ? 'Đang hiển thị' : 'Đang ẩn'}</td>
              <td className="p-3 text-right">
                <DeleteButton id={b.id} action={deleteBannerAction} confirmText={`Xoá banner “${b.title}”? Không khôi phục được.`} />
              </td>
            </tr>
          ))}
          {banners.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-slate-400">Chưa có banner nào.</td></tr>}
        </tbody>
      </table>
    </AdminListShell>
  )
}
