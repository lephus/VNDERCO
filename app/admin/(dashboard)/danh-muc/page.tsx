import Link from 'next/link'
import { prisma } from '@/lib/db'
import { AdminListShell } from '@/components/admin/AdminListShell'
import { DeleteButton } from '@/components/admin/DeleteButton'
import { deleteCategoryAction } from '@/lib/actions/category'

export const metadata = { title: 'Danh mục' }

const TYPE_LABEL = { NEWS: 'Tin tức', PRODUCT: 'Sản phẩm' } as const

export default async function CategoryListPage() {
  const categories = await prisma.category.findMany({ orderBy: [{ type: 'asc' }, { order: 'asc' }] })

  return (
    <AdminListShell title="Danh mục" createHref="/admin/danh-muc/moi" createLabel="Thêm danh mục">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-slate-500">
          <tr><th className="p-3">Tên</th><th className="p-3">Slug</th><th className="p-3">Loại</th><th className="p-3">Thứ tự</th><th className="p-3" /></tr>
        </thead>
        <tbody>
          {categories.map((c) => (
            <tr key={c.id} className="border-t border-slate-100">
              <td className="p-3">
                <Link href={`/admin/danh-muc/${c.id}`} className="font-medium text-slate-900 hover:underline">{c.name}</Link>
              </td>
              <td className="p-3 font-mono text-xs text-slate-500">{c.slug}</td>
              <td className="p-3">{TYPE_LABEL[c.type]}</td>
              <td className="p-3">{c.order}</td>
              <td className="p-3 text-right">
                <DeleteButton id={c.id} action={deleteCategoryAction}
                  confirmText={`Xoá danh mục “${c.name}”? Bài viết và sản phẩm thuộc danh mục này sẽ chuyển về chưa phân loại.`} />
              </td>
            </tr>
          ))}
          {categories.length === 0 && (
            <tr><td colSpan={5} className="p-6 text-center text-slate-400">Chưa có danh mục nào.</td></tr>
          )}
        </tbody>
      </table>
    </AdminListShell>
  )
}
