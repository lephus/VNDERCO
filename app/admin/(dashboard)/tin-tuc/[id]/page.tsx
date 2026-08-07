import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { AdminFormShell } from '@/components/admin/AdminFormShell'
import { PostForm } from '../form'

export const metadata = { title: 'Sửa bài viết' }

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [post, categories] = await Promise.all([
    prisma.post.findUnique({ where: { id } }),
    prisma.category.findMany({ where: { type: 'NEWS' }, orderBy: { order: 'asc' } }),
  ])
  if (!post) notFound()

  return (
    <AdminFormShell title="Sửa bài viết" backHref="/admin/tin-tuc">
      <PostForm post={post} categories={categories} />
    </AdminFormShell>
  )
}
