import { Fragment } from 'react'
import { getActiveBanners } from '@/lib/queries/banners'
import { getFolderBanners } from '@/lib/queries/banner-folder'
import { getHomeCategoryGroups } from '@/lib/queries/home'
import { getFeaturedPosts } from '@/lib/queries/posts'
import { getSiteSettings } from '@/lib/queries/settings'
import { CategorySection } from '@/components/public/CategorySection'
import { CommitmentBand } from '@/components/public/CommitmentBand'
import { HeroSlider } from '@/components/public/HeroSlider'
import { PostBoxCard } from '@/components/public/PostBoxCard'
import { ProductCard } from '@/components/public/ProductCard'
import { SectionHeading } from '@/components/public/SectionHeading'

export const revalidate = 3600

/** Bản gốc xếp 3 thẻ tin một hàng. */
const NEWS_ON_HOME = 3

/**
 * Trang chủ — dựng theo đúng thứ tự khối đo được trên bản tham chiếu:
 *
 *   băng ảnh → tiêu đề đứng riêng → dải ô danh mục → các nhóm nội dung → dải cam kết
 *
 * Điều dễ làm sai nhất ở trang này: hai dải màu (ô danh mục và cam kết) KHÔNG
 * tràn hết bề ngang màn hình. Chúng rộng đúng bằng lòng trong khung nội dung
 * (1050px), nên mép màu thẳng hàng với chữ phía trên và phía dưới. Vì vậy cả
 * trang nằm trong MỘT khung `.vnd-container` duy nhất chứ không phải mỗi mục tự
 * bọc khung riêng.
 *
 * Đệm dọc 30px xuất hiện hai lần và đó là đúng: 30px của khung nội dung
 * (`py-[30px]`) cộng 30px đáy của cột (`pb-[30px]`) — bản gốc cũng chồng hai lớp
 * đệm này, và nó là toàn bộ khoảng thở giữa khối cuối và chân trang.
 */
export default async function HomePage() {
  const [banners, posts, groups, settings] = await Promise.all([
    getActiveBanners(), getFeaturedPosts(), getHomeCategoryGroups(), getSiteSettings(),
  ])

  // Banner đến từ hai nguồn: bảng Banner (khách tự tạo trong admin, có tiêu đề và
  // nút riêng) và thư mục `public/banners` (chỉ cần thả ảnh vào rồi deploy — xem
  // public/banners/README.md). Banner trong admin đứng trước vì nó được soạn có
  // chủ đích; ảnh trong thư mục chạy tiếp sau.
  //
  // Tiêu đề mặc định để RỖNG: bản tham chiếu chạy banner ảnh trần, không có hộp
  // chữ đè lên. Ảnh thả vào thư mục vì thế không mượn tên site nữa — HeroSlider
  // chỉ dựng hộp chữ khi slide thật sự có tiêu đề. Muốn một tấm cụ thể có chữ
  // thì khai `title` cho nó trong public/banners/captions.json, hoặc tạo banner
  // trong admin.
  const slides = [...banners, ...getFolderBanners({ title: '' })]

  // Ô danh mục mượn ảnh của sản phẩm đầu tiên trong danh mục — xem lib/queries/home.ts.
  const tiles = groups.map((group) => ({
    id: group.id,
    name: group.name,
    href: `/san-pham?danh-muc=${group.slug}`,
    imageUrl: group.products[0]?.images[0]?.url ?? null,
  }))

  const productGroups = groups.filter((group) => group.products.length > 0)
  const newsItems = posts.slice(0, NEWS_ON_HOME)
  const hasContentGrid = productGroups.length > 0 || newsItems.length > 0

  return (
    <div className="py-[30px]">
      <div className="vnd-container pb-[30px]">
        <HeroSlider banners={slides} fallbackTitle={settings.homeIntroTitle} />

        <SectionHeading title="Danh mục sản phẩm" href="/san-pham" linkLabel="Xem tất cả" />

        <CategorySection items={tiles} />

        {hasContentGrid && (
          <section className="p-[30px]">
            {productGroups.map((group) => (
              <Fragment key={group.id}>
                {/* Tiêu đề trong mục không có mũi "xem tất cả" — bản gốc chỉ đặt
                    mũi này ở tiêu đề đứng riêng phía trên dải danh mục. */}
                <SectionHeading inSection title={group.name} />
                <div className="-mx-[15px] flex flex-wrap">
                  {group.products.map((product) => (
                    <div key={product.id} className="w-1/2 px-[15px] pb-[30px] tile:w-1/4">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </Fragment>
            ))}

            {newsItems.length > 0 && (
              <>
                <SectionHeading inSection title="Tin tức" />
                {/* Tin xếp 3 cột với ảnh 16:9, khác hẳn ô sản phẩm 4 cột ảnh
                    vuông — đó là cách bản gốc tách hàng tin khỏi hàng sản phẩm
                    ngay phía trên mà không cần thêm đường kẻ hay nền. */}
                <div className="-mx-[15px] flex flex-wrap">
                  {newsItems.map((post) => (
                    <div key={post.id} className="w-full px-[15px] pb-[30px] tile:w-1/3">
                      <PostBoxCard post={post} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        )}

        <CommitmentBand settings={settings} />
      </div>
    </div>
  )
}
