import Image from 'next/image'
import Link from 'next/link'
import { BLUR_DATA_URL } from '@/lib/image-placeholder'

/**
 * Ô danh mục — ảnh VUÔNG 225×225 (đo trên bản tham chiếu ở khung 1050px), cách
 * chữ đúng 16px, bên dưới là tên danh mục căn giữa.
 *
 * Chữ dùng cỡ thân bài 16px/25,6px nét thường chứ không in đậm: bản gốc phân
 * biệt ô danh mục với thẻ tin bằng độ đậm, nên tô đậm ở đây là mất một tầng
 * phân cấp. Màu #0693E3 nhạt hơn màu tiêu đề mục một chút, cũng là số đo thật.
 */
export function CategoryTile({
  name, href, imageUrl, imageAlt,
}: { name: string; href: string; imageUrl?: string | null; imageAlt?: string | null }) {
  return (
    <article className="group">
      <Link href={href} className="block">
        <div className="relative mb-4 aspect-square overflow-hidden bg-primary-50">
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={imageAlt ?? ''}
              fill
              sizes="(max-width: 550px) 50vw, 25vw"
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
          )}
        </div>
        {/* Xanh → đen khi rê chuột: ngược quy ước, nhưng là số đo thật của bản
            gốc (#228FF5 → #000000) và là nét dễ nhận ra nhất của giao diện. */}
        <p className="mb-[20.8px] text-center text-[16px]/[25.6px] text-[#0693e3] transition-colors duration-200 group-hover:text-black">
          {name}
        </p>
      </Link>
    </article>
  )
}
