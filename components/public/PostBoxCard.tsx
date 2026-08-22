import Image from 'next/image'
import Link from 'next/link'
import type { Category, Post } from '@prisma/client'
import { BLUR_DATA_URL } from '@/lib/image-placeholder'

/**
 * Thẻ tin ở trang chủ.
 *
 * Khác hẳn ô sản phẩm và đó là chủ ý của bản thiết kế: ảnh ở đây là 16:9 chứ
 * không vuông, thẻ xếp 3 cột chứ không 4, và dưới ảnh là một khối chữ có đệm
 * riêng (15px hai bên trên, 20px dưới) với vạch ngăn 30px căn giữa. Nhờ vậy hàng
 * tin đọc ra ngay là "tin", không lẫn với hàng sản phẩm ngay phía trên.
 *
 * Không sửa PostCard: component đó còn dùng ở /tin-tuc và trang chi tiết bài,
 * mà lần này phạm vi chỉ có trang chủ.
 */
export function PostBoxCard({ post }: { post: Post & { category?: Category | null } }) {
  return (
    <article className="group">
      <Link href={`/tin-tuc/${post.slug}`} className="block">
        <div className="relative aspect-[309.98/174.36] overflow-hidden bg-primary-50">
          {post.coverImageUrl && (
            <Image
              src={post.coverImageUrl}
              alt={post.coverImageAlt ?? ''}
              fill
              sizes="(max-width: 550px) 100vw, 33vw"
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
          )}
        </div>
        <div className="px-[15px] pt-[15px] pb-[20px] text-center">
          <h3 className="my-[1.656px] text-[16.56px]/[21.528px] font-bold text-primary-600 transition-colors duration-200 group-hover:text-black">
            {post.title}
          </h3>
          <div aria-hidden className="mx-auto my-[7.2px] h-px w-[30px] bg-black/10" />
          {post.excerpt && (
            <p className="my-[1.44px] text-[14.4px]/[23.04px] text-black">{post.excerpt}</p>
          )}
        </div>
      </Link>
    </article>
  )
}
