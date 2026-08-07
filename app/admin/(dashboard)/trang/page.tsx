import Link from 'next/link'
import { prisma } from '@/lib/db'
import { AdminListShell } from '@/components/admin/AdminListShell'
import { DeleteButton } from '@/components/admin/DeleteButton'
import { deletePageAction } from '@/lib/actions/page'

export const metadata = { title: 'Trang tĩnh' }

export default async function PageListPage() {
  const pages = await prisma.page.findMany({ orderBy: { updatedAt: 'desc' } })

  return (
    <AdminListShell title="Trang tĩnh" createHref="/admin/trang/moi" createLabel="Thêm trang">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-slate-500">
          <tr><th className="p-3">Tiêu đề</th><th className="p-3">Đường dẫn</th><th className="p-3">Trạng thái</th><th className="p-3">Cập nhật</th><th className="p-3" /></tr>
        </thead>
        <tbody>
          {pages.map((p) => (
            <tr key={p.id} className="border-t border-slate-100">
              <td className="p-3">
                <Link href={`/admin/trang/${p.id}`} className="font-medium text-slate-900 hover:underline">{p.title}</Link>
              </td>
              <td className="p-3">
                <a href={`/${p.slug}`} target="_blank" rel="noopener noreferrer"
                  className="font-mono text-xs text-slate-500 hover:underline">/{p.slug}</a>
              </td>
              <td className="p-3">{p.status === 'PUBLISHED' ? 'Đã xuất bản' : 'Nháp'}</td>
              <td className="p-3 text-slate-500">{p.updatedAt.toLocaleDateString('vi-VN')}</td>
              <td className="p-3 text-right">
                <DeleteButton id={p.id} action={deletePageAction} confirmText={`Xoá trang “${p.title}”? Không khôi phục được.`} />
              </td>
            </tr>
          ))}
          {pages.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-slate-400">Chưa có trang nào.</td></tr>}
        </tbody>
      </table>
    </AdminListShell>
  )
}
