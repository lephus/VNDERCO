import { notFound } from 'next/navigation'
import { getProductBySlug } from '@/lib/queries/products'
import { getSiteSettings } from '@/lib/queries/settings'
import { ProductGallery } from '@/components/public/ProductGallery'
import { ContactButtons } from '@/components/public/ContactButtons'
import { RichContent } from '@/components/public/RichContent'

export const revalidate = 3600

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [product, settings] = await Promise.all([getProductBySlug(slug), getSiteSettings()])
  if (!product) notFound()

  const specs = (product.specs as { label: string; value: string }[]) ?? []

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 pb-24 sm:pb-12">
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
