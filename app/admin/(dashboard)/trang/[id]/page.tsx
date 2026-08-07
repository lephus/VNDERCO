import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { AdminFormShell } from '@/components/admin/AdminFormShell'
import { PageForm } from '../form'

export const metadata = { title: 'Sửa trang' }

export default async function EditPagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const page = await prisma.page.findUnique({ where: { id } })
  if (!page) notFound()

  return (
    <AdminFormShell title="Sửa trang" backHref="/admin/trang">
      <PageForm page={page} />
    </AdminFormShell>
  )
}
