import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAllPublishedProductSlugs, getProductBySlug } from '@/lib/queries/products'
import { getSiteSettings } from '@/lib/queries/settings'
import { breadcrumbJsonLd, pickOgImage, productJsonLd, siteUrl } from '@/lib/seo'
import { ProductGallery } from '@/components/public/ProductGallery'
import { ContactButtons } from '@/components/public/ContactButtons'
import { Breadcrumb } from '@/components/public/Breadcrumb'
import { RichContent } from '@/components/public/RichContent'

export const revalidate = 3600

// Prerender sẵn mọi trang chi tiết đã xuất bản ngay lúc build, thay vì để lượt
// khách đầu tiên phải chờ render. Trên Vercel, mỗi instance serverless mới khởi
// động sẽ phải truy vấn Supabase (đặt ở ap-northeast-1) rồi mới dựng được HTML;
// prerender xong thì trang được phục vụ thẳng từ CDN.
// KHÔNG đặt `dynamicParams = false`: bài viết/sản phẩm tạo sau lần build vẫn
// phải hiện ra được, chúng chỉ render theo yêu cầu ở lượt truy cập đầu tiên rồi
// được cache như cũ.
export async function generateStaticParams() {
  return (await getAllPublishedProductSlugs()).map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const [product, settings] = await Promise.all([getProductBySlug(slug), getSiteSettings()])
  if (!product) return { title: 'Không tìm thấy' }

  return {
    title: product.seoTitle ?? product.name,
    description: product.seoDescription ?? product.summary ?? undefined,
    alternates: { canonical: `/san-pham/${product.slug}` },
    openGraph: {
      type: 'website',
      title: product.seoTitle ?? product.name,
      description: product.seoDescription ?? product.summary ?? undefined,
      images: [pickOgImage({ contentImage: product.images[0]?.url, settingsImage: settings.seoOgImageUrl })],
    },
  }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [product, settings] = await Promise.all([getProductBySlug(slug), getSiteSettings()])
  if (!product) notFound()

  const specs = (product.specs as { label: string; value: string }[]) ?? []

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 pb-24 sm:pb-12">
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product, `${siteUrl()}/san-pham/${product.slug}`)) }} />
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd([
          { name: 'Trang chủ', url: siteUrl() },
          { name: 'Sản phẩm', url: `${siteUrl()}/san-pham` },
          { name: product.name, url: `${siteUrl()}/san-pham/${product.slug}` },
        ])) }} />
      <Breadcrumb items={[
        { name: 'Trang chủ', href: '/' },
        { name: 'Sản phẩm', href: '/san-pham' },
        { name: product.name },
      ]} />
      <div className="grid gap-10 sm:grid-cols-2">
        <ProductGallery images={product.images} name={product.name} />

        <div>
          {product.category && (
            <span className="text-xs font-bold uppercase tracking-wide text-primary-600">{product.category.name}</span>
          )}
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight">{product.name}</h1>
          {product.summary && <p className="mt-3 text-slate-600">{product.summary}</p>}

          {specs.length > 0 && (
            <table className="mt-6 w-full text-sm">
              <caption className="sr-only">Thông số kỹ thuật {product.name}</caption>
              <tbody>
                {specs.map((spec) => (
                  <tr key={spec.label} className="border-b border-slate-100">
                    <th scope="row" className="py-2 pr-4 text-left font-medium text-slate-500">{spec.label}</th>
                    <td className="py-2 text-slate-900">{spec.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="mt-8">
            <ContactButtons settings={settings} productName={product.name} />
          </div>
        </div>
      </div>

      {product.description && (
        <div className="mt-12 max-w-3xl"><RichContent html={product.description} /></div>
      )}

      <ContactButtons settings={settings} productName={product.name} sticky />
    </div>
  )
}
