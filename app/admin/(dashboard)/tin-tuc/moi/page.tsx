import { prisma } from '@/lib/db'
import { AdminFormShell } from '@/components/admin/AdminFormShell'
import { PostForm } from '../form'

export const metadata = { title: 'Viết bài mới' }

export default async function NewPostPage() {
  const categories = await prisma.category.findMany({ where: { type: 'NEWS' }, orderBy: { order: 'asc' } })
  return (
    <AdminFormShell title="Viết bài mới" backHref="/admin/tin-tuc">
      <PostForm categories={categories} />
    </AdminFormShell>
  )
}
