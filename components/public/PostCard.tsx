import Image from 'next/image'
import Link from 'next/link'
import type { Category, Post } from '@prisma/client'
import { asDate } from '@/lib/seo'
import { BLUR_DATA_URL } from '@/lib/image-placeholder'

export function PostCard({ post }: { post: Post & { category?: Category | null } }) {
  // asDate(): xem chú thích trong lib/seo.ts — post đến từ getPublishedPosts (bọc
  // unstable_cache) nên publishedAt có thể là chuỗi ISO thay vì Date thật tuỳ trạng thái cache.
  const publishedAt = asDate(post.publishedAt)

  return (
    <article className="group overflow-hidden rounded-2xl bg-white shadow-[0_4px_20px_-8px_var(--vnd-primary-300)]
      transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_18px_40px_-14px_var(--vnd-primary-400)]">
      <Link href={`/tin-tuc/${post.slug}`}>
        {/* overflow-hidden nằm ở đây chứ không chỉ ở <article>: ảnh phóng to khi
            rê chuột, phải bị cắt trong khung ảnh thay vì tràn xuống phần chữ. */}
        <div className="relative h-44 overflow-hidden bg-primary-50">
          {post.coverImageUrl && (
            <Image src={post.coverImageUrl} alt={post.coverImageAlt ?? ''} fill
              placeholder="blur" blurDataURL={BLUR_DATA_URL}
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105" />
          )}
        </div>
        <div className="p-5">
          {post.category && (
            <span className="text-xs font-bold uppercase tracking-wide text-primary-600">{post.category.name}</span>
          )}
          <h3 className="mt-1 line-clamp-2 font-bold leading-snug text-slate-900 transition-colors duration-200 group-hover:text-primary-700">{post.title}</h3>
          {post.excerpt && <p className="mt-2 line-clamp-2 text-sm text-slate-600">{post.excerpt}</p>}
          {/* slate-500 chứ không phải slate-400: trên nền trắng, slate-400 chỉ
              đạt tương phản 2,56:1 — dưới mức 4,5:1 của WCAG AA cho chữ nhỏ.
              slate-500 đạt 4,76:1 mà nhìn vẫn nhạt hơn phần chữ chính. */}
          {publishedAt && (
            <time dateTime={publishedAt.toISOString()} className="mt-3 block text-xs text-slate-500">
              {publishedAt.toLocaleDateString('vi-VN')}
            </time>
          )}
        </div>
      </Link>
    </article>
  )
}
