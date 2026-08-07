import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { AdminFormShell } from '@/components/admin/AdminFormShell'
import { ProductForm } from '../form'

export const metadata = { title: 'Sửa sản phẩm' }

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id }, include: { images: { orderBy: { order: 'asc' } } } }),
    prisma.category.findMany({ where: { type: 'PRODUCT' }, orderBy: { order: 'asc' } }),
  ])
  if (!product) notFound()

  return (
    <AdminFormShell title="Sửa sản phẩm" backHref="/admin/san-pham">
      <ProductForm product={product} categories={categories} />
    </AdminFormShell>
  )
}
