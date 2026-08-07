import Image from 'next/image'
import Link from 'next/link'
import type { Product, ProductImage } from '@prisma/client'

export function ProductCard({ product }: { product: Product & { images: ProductImage[] } }) {
  const image = product.images[0]

  return (
    <article className="group overflow-hidden rounded-2xl bg-white shadow-[0_4px_20px_-8px_var(--vnd-primary-300)] transition hover:-translate-y-1">
      <Link href={`/san-pham/${product.slug}`}>
        <div className="relative h-44 bg-primary-50">
          {image && (
            <Image src={image.url} alt={image.alt ?? ''} fill className="object-cover" />
          )}
        </div>
        <div className="p-5">
          <h3 className="mt-1 line-clamp-2 font-bold leading-snug text-slate-900">{product.name}</h3>
          {product.summary && <p className="mt-2 line-clamp-2 text-sm text-slate-600">{product.summary}</p>}
        </div>
      </Link>
    </article>
  )
}
