import { prisma } from '@/lib/db'
import { AdminFormShell } from '@/components/admin/AdminFormShell'
import { ProductForm } from '../form'

export const metadata = { title: 'Thêm sản phẩm' }

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ where: { type: 'PRODUCT' }, orderBy: { order: 'asc' } })
  return (
    <AdminFormShell title="Thêm sản phẩm" backHref="/admin/san-pham">
      <ProductForm categories={categories} />
    </AdminFormShell>
  )
}
