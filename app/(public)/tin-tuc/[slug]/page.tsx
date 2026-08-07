import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getPostBySlug, getRelatedPosts } from '@/lib/queries/posts'
import { RichContent } from '@/components/public/RichContent'
import { PostCard } from '@/components/public/PostCard'
import { SectionHeading } from '@/components/public/SectionHeading'

export const revalidate = 3600

export default async function PostDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) notFound()

  const related = await getRelatedPosts(post.id, post.categoryId)

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      {post.category && (
        <span className="text-xs font-bold uppercase tracking-wide text-primary-600">{post.category.name}</span>
      )}
      <h1 className="mt-2 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">{post.title}</h1>
      {post.publishedAt && (
        <time dateTime={post.publishedAt.toISOString()} className="mt-3 block text-sm text-slate-500">
          {post.publishedAt.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
        </time>
      )}

      {post.coverImageUrl && (
        <Image src={post.coverImageUrl} alt={post.coverImageAlt ?? ''} width={1200} height={630} priority
          className="mt-6 w-full rounded-2xl object-cover" />
      )}

      <div className="mt-8"><RichContent html={post.content} /></div>

      {related.length > 0 && (
        <section className="mt-16">
          <SectionHeading title="Bài liên quan" />
          <div className="grid gap-6 sm:grid-cols-3">
            {related.map((item) => <PostCard key={item.id} post={item} />)}
          </div>
        </section>
      )}
    </article>
  )
}
