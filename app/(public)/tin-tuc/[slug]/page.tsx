import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getPostBySlug, getRelatedPosts } from '@/lib/queries/posts'
import { getSiteSettings } from '@/lib/queries/settings'
import { articleJsonLd, asDate, breadcrumbJsonLd, pickOgImage, siteUrl } from '@/lib/seo'
import { RichContent } from '@/components/public/RichContent'
import { PostCard } from '@/components/public/PostCard'
import { SectionHeading } from '@/components/public/SectionHeading'

export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const [post, settings] = await Promise.all([getPostBySlug(slug), getSiteSettings()])
  if (!post) return { title: 'Không tìm thấy' }

  return {
    title: post.seoTitle ?? post.title,
    description: post.seoDescription ?? post.excerpt ?? undefined,
    alternates: { canonical: `/tin-tuc/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.seoTitle ?? post.title,
      description: post.seoDescription ?? post.excerpt ?? undefined,
      publishedTime: asDate(post.publishedAt)?.toISOString(),
      images: [pickOgImage({ contentImage: post.coverImageUrl, settingsImage: settings.seoOgImageUrl })],
    },
  }
}

export default async function PostDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [post, settings] = await Promise.all([getPostBySlug(slug), getSiteSettings()])
  if (!post) notFound()

  const related = await getRelatedPosts(post.id, post.categoryId)
  // asDate(): xem chú thích trong lib/seo.ts — publishedAt lấy từ getPostBySlug (bọc
  // unstable_cache) có thể là chuỗi ISO thay vì Date thật tuỳ trạng thái cache.
  const publishedAt = asDate(post.publishedAt)

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd(post, settings.siteName, `${siteUrl()}/tin-tuc/${post.slug}`)) }} />
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd([
          { name: 'Trang chủ', url: siteUrl() },
          { name: 'Tin tức', url: `${siteUrl()}/tin-tuc` },
          { name: post.title, url: `${siteUrl()}/tin-tuc/${post.slug}` },
        ])) }} />
      {post.category && (
        <span className="text-xs font-bold uppercase tracking-wide text-primary-600">{post.category.name}</span>
      )}
      <h1 className="mt-2 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">{post.title}</h1>
      {publishedAt && (
        <time dateTime={publishedAt.toISOString()} className="mt-3 block text-sm text-slate-500">
          {publishedAt.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
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
