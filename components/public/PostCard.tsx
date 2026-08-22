import Image from 'next/image'
import Link from 'next/link'
import type { Category, Post } from '@prisma/client'
import { asDate } from '@/lib/seo'
import { BLUR_DATA_URL } from '@/lib/image-placeholder'

/**
 * Ô tin tức — cùng dáng với ô sản phẩm (ảnh vuông + chữ căn giữa, xem
 * ProductCard) nhưng tiêu đề in đậm theo thang chữ H5 đo được: 16,56px/21,528px,
 * nét 700. Ngày đăng xuống dưới cùng, cỡ nhỏ và nhạt hơn.
 */
export function PostCard({ post }: { post: Post & { category?: Category | null } }) {
  // asDate(): xem chú thích trong lib/seo.ts — post đến từ getPublishedPosts (bọc
  // unstable_cache) nên publishedAt có thể là chuỗi ISO thay vì Date thật tuỳ trạng thái cache.
  const publishedAt = asDate(post.publishedAt)

  return (
    <article className="group">
      <Link href={`/tin-tuc/${post.slug}`} className="block">
        <div className="relative mb-4 aspect-square overflow-hidden bg-primary-50">
          {post.coverImageUrl && (
            <Image
              src={post.coverImageUrl}
              alt={post.coverImageAlt ?? ''}
              fill
              sizes="(max-width: 550px) 50vw, 25vw"
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
          )}
        </div>
        <h3 className="text-center text-[16.56px]/[21.528px] font-bold text-primary-600 transition-colors duration-200 group-hover:text-black">
          {post.title}
        </h3>
        {publishedAt && (
          <time
            dateTime={publishedAt.toISOString()}
            className="mt-2 mb-[20.8px] block text-center text-[13px]/[20.8px] text-slate-500"
          >
            {publishedAt.toLocaleDateString('vi-VN')}
          </time>
        )}
      </Link>
    </article>
  )
}
