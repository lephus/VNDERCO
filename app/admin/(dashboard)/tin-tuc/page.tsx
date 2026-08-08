import Link from 'next/link'
import { prisma } from '@/lib/db'
import { AdminListShell } from '@/components/admin/AdminListShell'
import { DeleteButton } from '@/components/admin/DeleteButton'
import { deletePostAction } from '@/lib/actions/post'
import { buttonClass } from '@/lib/ui/button'

export const metadata = { title: 'Tin tức' }

export default async function PostListPage({
  searchParams,
}: { searchParams: Promise<{ q?: string; trang_thai?: string }> }) {
  const { q, trang_thai } = await searchParams
  const posts = await prisma.post.findMany({
    where: {
      ...(q ? { title: { contains: q, mode: 'insensitive' as const } } : {}),
      ...(trang_thai === 'DRAFT' || trang_thai === 'PUBLISHED' ? { status: trang_thai } : {}),
    },
    include: { category: true },
    orderBy: { updatedAt: 'desc' },
  })

  return (
    <AdminListShell
      title="Tin tức"
      createHref="/admin/tin-tuc/moi"
      createLabel="Viết bài mới"
      toolbar={
        <form className="flex w-full flex-wrap gap-2">
          <input name="q" defaultValue={q ?? ''} placeholder="Tìm theo tiêu đề"
            className="h-9 min-w-0 flex-1 rounded-lg border border-slate-300 px-3 text-sm sm:flex-none" />
          <select name="trang_thai" defaultValue={trang_thai ?? ''}
            className="h-9 rounded-lg border border-slate-300 px-3 text-sm">
            <option value="">Mọi trạng thái</option>
            <option value="DRAFT">Nháp</option>
            <option value="PUBLISHED">Đã xuất bản</option>
          </select>
          <button type="submit" className={buttonClass({ size: 'sm', variant: 'neutral', shape: 'rounded', lift: false })}>Lọc</button>
        </form>
      }
    >
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-slate-500">
          <tr><th className="p-3">Tiêu đề</th><th className="p-3">Danh mục</th><th className="p-3">Trạng thái</th><th className="p-3">Cập nhật</th><th className="p-3" /></tr>
        </thead>
        <tbody>
          {posts.map((p) => (
            <tr key={p.id} className="border-t border-slate-100">
              <td className="p-3">
                <Link href={`/admin/tin-tuc/${p.id}`} className="font-medium text-slate-900 hover:underline">{p.title}</Link>
                {p.featured && <span className="ml-2 rounded bg-primary-100 px-1.5 py-0.5 text-xs text-primary-700">Nổi bật</span>}
              </td>
              <td className="p-3 text-slate-600">{p.category?.name ?? '—'}</td>
              <td className="p-3">{p.status === 'PUBLISHED' ? 'Đã xuất bản' : 'Nháp'}</td>
              <td className="p-3 text-slate-500">{p.updatedAt.toLocaleDateString('vi-VN')}</td>
              <td className="p-3 text-right">
                <DeleteButton id={p.id} action={deletePostAction} confirmText={`Xoá bài “${p.title}”? Không khôi phục được.`} />
              </td>
            </tr>
          ))}
          {posts.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-slate-400">Không có bài viết nào.</td></tr>}
        </tbody>
      </table>
    </AdminListShell>
  )
}
