import Image from 'next/image'
import Link from 'next/link'
import type { Category, Post } from '@prisma/client'
import { asDate } from '@/lib/seo'

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
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105" />
          )}
        </div>
        <div className="p-5">
          {post.category && (
            <span className="text-xs font-bold uppercase tracking-wide text-primary-600">{post.category.name}</span>
          )}
          <h3 className="mt-1 line-clamp-2 font-bold leading-snug text-slate-900 transition-colors duration-200 group-hover:text-primary-700">{post.title}</h3>
          {post.excerpt && <p className="mt-2 line-clamp-2 text-sm text-slate-600">{post.excerpt}</p>}
          {publishedAt && (
            <time dateTime={publishedAt.toISOString()} className="mt-3 block text-xs text-slate-400">
              {publishedAt.toLocaleDateString('vi-VN')}
            </time>
          )}
        </div>
      </Link>
    </article>
  )
}
