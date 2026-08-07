import { prisma } from '@/lib/db'

export const metadata = { title: 'Tổng quan' }

export default async function AdminHome() {
  const [posts, products, pages] = await Promise.all([
    prisma.post.count(), prisma.product.count(), prisma.page.count(),
  ])
  const recent = await prisma.post.findMany({ orderBy: { updatedAt: 'desc' }, take: 5 })

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-900">Tổng quan</h1>
      <div className="grid grid-cols-3 gap-4">
        {[['Bài viết', posts], ['Sản phẩm', products], ['Trang tĩnh', pages]].map(([label, count]) => (
          <div key={label as string} className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{count}</p>
          </div>
        ))}
      </div>
      <section className="rounded-xl bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-semibold text-slate-900">Sửa gần đây</h2>
        <ul className="space-y-1 text-sm text-slate-600">
          {recent.map((p) => <li key={p.id}>{p.title}</li>)}
          {recent.length === 0 && <li className="text-slate-400">Chưa có bài viết nào.</li>}
        </ul>
      </section>
    </div>
  )
}
