import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPageBySlug } from '@/lib/queries/pages'
import { breadcrumbJsonLd, siteUrl } from '@/lib/seo'
import { RichContent } from '@/components/public/RichContent'
import { Breadcrumb } from '@/components/public/Breadcrumb'

export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const page = await getPageBySlug(slug)
  if (!page) return { title: 'Không tìm thấy' }

  return {
    title: page.seoTitle ?? page.title,
    description: page.seoDescription ?? undefined,
    alternates: { canonical: `/${page.slug}` },
  }
}

export default async function StaticPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const page = await getPageBySlug(slug)
  if (!page) notFound()

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd([
          { name: 'Trang chủ', url: siteUrl() },
          { name: page.title, url: `${siteUrl()}/${page.slug}` },
        ])) }} />
      <Breadcrumb items={[
        { name: 'Trang chủ', href: '/' },
        { name: page.title },
      ]} />
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{page.title}</h1>
      <div className="mt-8"><RichContent html={page.content} /></div>
    </article>
  )
}
