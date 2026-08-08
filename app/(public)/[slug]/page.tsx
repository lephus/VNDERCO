import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAllPublishedPageSlugs, getPageBySlug } from '@/lib/queries/pages'
import { breadcrumbJsonLd, siteUrl } from '@/lib/seo'
import { RichContent } from '@/components/public/RichContent'
import { Breadcrumb } from '@/components/public/Breadcrumb'

export const revalidate = 3600

// Prerender sẵn mọi trang chi tiết đã xuất bản ngay lúc build, thay vì để lượt
// khách đầu tiên phải chờ render. Trên Vercel, mỗi instance serverless mới khởi
// động sẽ phải truy vấn Supabase (đặt ở ap-northeast-1) rồi mới dựng được HTML;
// prerender xong thì trang được phục vụ thẳng từ CDN.
// KHÔNG đặt `dynamicParams = false`: bài viết/sản phẩm tạo sau lần build vẫn
// phải hiện ra được, chúng chỉ render theo yêu cầu ở lượt truy cập đầu tiên rồi
// được cache như cũ.
export async function generateStaticParams() {
  return (await getAllPublishedPageSlugs()).map(({ slug }) => ({ slug }))
}

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
