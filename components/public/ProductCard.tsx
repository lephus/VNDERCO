import Image from 'next/image'
import Link from 'next/link'
import type { Product, ProductImage } from '@prisma/client'
import { BLUR_DATA_URL } from '@/lib/image-placeholder'

/**
 * Ô sản phẩm theo bản thiết kế: ảnh VUÔNG 1:1, cách chữ 16px, bên dưới là tên
 * căn giữa. Không khung, không đổ bóng, không bo góc — chính sự trần trụi đó là
 * dáng của bản gốc; thêm thẻ card vào là hỏng ngay.
 *
 * Liên kết ĐỔI TỪ XANH SANG ĐEN khi rê chuột, ngược với thói quen thường thấy.
 * Đây là số đo thật trên bản tham chiếu (#228FF5 → #000000) chứ không phải nhầm,
 * và nó là một phần dễ nhận ra của giao diện nên giữ nguyên.
 */
export function ProductCard({ product }: { product: Product & { images: ProductImage[] } }) {
  const image = product.images[0]

  return (
    <article className="group">
      <Link href={`/san-pham/${product.slug}`} className="block">
        <div className="relative mb-4 aspect-square overflow-hidden bg-primary-50">
          {image && (
            <Image
              src={image.url}
              alt={image.alt ?? ''}
              fill
              sizes="(max-width: 550px) 50vw, 25vw"
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
          )}
        </div>
        <p className="mb-[20.8px] text-center text-[16px]/[25.6px] text-primary-500 transition-colors duration-200 group-hover:text-black">
          {product.name}
        </p>
      </Link>
    </article>
  )
}
