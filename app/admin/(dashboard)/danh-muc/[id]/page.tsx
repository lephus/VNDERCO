import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { AdminFormShell } from '@/components/admin/AdminFormShell'
import { CategoryForm } from '../form'

export const metadata = { title: 'Sửa danh mục' }

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const category = await prisma.category.findUnique({ where: { id } })
  if (!category) notFound()

  return (
    <AdminFormShell title="Sửa danh mục" backHref="/admin/danh-muc">
      <CategoryForm category={category} />
    </AdminFormShell>
  )
}
