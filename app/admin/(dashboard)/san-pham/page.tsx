import Link from 'next/link'
import { prisma } from '@/lib/db'
import { AdminListShell } from '@/components/admin/AdminListShell'
import { DeleteButton } from '@/components/admin/DeleteButton'
import { deleteProductAction } from '@/lib/actions/product'

export const metadata = { title: 'Sản phẩm' }

export default async function ProductListPage({
  searchParams,
}: { searchParams: Promise<{ q?: string; trang_thai?: string }> }) {
  const { q, trang_thai } = await searchParams
  const products = await prisma.product.findMany({
    where: {
      ...(q ? { name: { contains: q, mode: 'insensitive' as const } } : {}),
      ...(trang_thai === 'DRAFT' || trang_thai === 'PUBLISHED' ? { status: trang_thai } : {}),
    },
    include: { category: true, images: { orderBy: { order: 'asc' } } },
    orderBy: { updatedAt: 'desc' },
  })

  return (
    <AdminListShell
      title="Sản phẩm"
      createHref="/admin/san-pham/moi"
      createLabel="Thêm sản phẩm"
      toolbar={
        <form className="flex gap-2">
          <input name="q" defaultValue={q ?? ''} placeholder="Tìm theo tên"
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm" />
          <select name="trang_thai" defaultValue={trang_thai ?? ''}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm">
            <option value="">Mọi trạng thái</option>
            <option value="DRAFT">Nháp</option>
            <option value="PUBLISHED">Đã xuất bản</option>
          </select>
          <button type="submit" className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm">Lọc</button>
        </form>
      }
    >
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-slate-500">
          <tr><th className="p-3">Tên</th><th className="p-3">Danh mục</th><th className="p-3">Trạng thái</th><th className="p-3">Thứ tự</th><th className="p-3" /></tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-t border-slate-100">
              <td className="p-3">
                <Link href={`/admin/san-pham/${p.id}`} className="font-medium text-slate-900 hover:underline">{p.name}</Link>
                {p.featured && <span className="ml-2 rounded bg-primary-100 px-1.5 py-0.5 text-xs text-primary-700">Nổi bật</span>}
              </td>
              <td className="p-3 text-slate-600">{p.category?.name ?? '—'}</td>
              <td className="p-3">{p.status === 'PUBLISHED' ? 'Đã xuất bản' : 'Nháp'}</td>
              <td className="p-3 text-slate-500">{p.order}</td>
              <td className="p-3 text-right">
                <DeleteButton id={p.id} action={deleteProductAction} confirmText={`Xoá sản phẩm “${p.name}”? Không khôi phục được.`} />
              </td>
            </tr>
          ))}
          {products.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-slate-400">Không có sản phẩm nào.</td></tr>}
        </tbody>
      </table>
    </AdminListShell>
  )
}
