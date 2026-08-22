import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/db'
import { TAGS } from '@/lib/cache-tags'

/** Số ô tối đa trong một hàng nội dung — bản tham chiếu xếp 8 ô (2 hàng 4 cột). */
export const HOME_GROUP_SIZE = 8

/**
 * Danh mục sản phẩm kèm vài sản phẩm đầu của từng danh mục.
 *
 * Trang chủ cần đúng hai thứ từ cùng một nguồn: dải ô danh mục ở trên (mỗi ô là
 * một danh mục) và các nhóm nội dung bên dưới (mỗi nhóm là một danh mục kèm sản
 * phẩm). Gộp vào một truy vấn để không phải đọc bảng Category hai lần.
 *
 * Ảnh của ô danh mục lấy từ sản phẩm đầu tiên trong danh mục đó: bảng Category
 * không có cột ảnh, mà thêm cột thì kéo theo cả form admin — nằm ngoài phạm vi
 * "chỉ sửa giao diện trang chủ". Danh mục chưa có sản phẩm nào thì ô không có
 * ảnh và component tự dựng nền chờ.
 */
export const getHomeCategoryGroups = unstable_cache(
  async () =>
    prisma.category.findMany({
      where: { type: 'PRODUCT' },
      orderBy: { order: 'asc' },
      include: {
        products: {
          where: { status: 'PUBLISHED' },
          orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
          take: HOME_GROUP_SIZE,
          include: { images: { orderBy: { order: 'asc' }, take: 1 } },
        },
      },
    }),
  ['home-category-groups'],
  { tags: [TAGS.categories, TAGS.products] },
)

export type HomeCategoryGroup = Awaited<ReturnType<typeof getHomeCategoryGroups>>[number]
