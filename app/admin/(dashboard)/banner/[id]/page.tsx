import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { AdminFormShell } from '@/components/admin/AdminFormShell'
import { BannerForm } from '../form'

export const metadata = { title: 'Sửa banner' }

export default async function EditBannerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const banner = await prisma.banner.findUnique({ where: { id } })
  if (!banner) notFound()

  return (
    <AdminFormShell title="Sửa banner" backHref="/admin/banner">
      <BannerForm banner={banner} />
    </AdminFormShell>
  )
}
