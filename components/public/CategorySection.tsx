import { CategoryTile } from '@/components/public/CategoryTile'

export type CategoryTileItem = {
  id: string
  name: string
  href: string
  imageUrl?: string | null
}

/**
 * Dải ô danh mục nền xanh nhạt.
 *
 * Hai điểm dễ làm sai và đều là số đo, không phải cảm nhận:
 *
 * 1. Dải màu KHÔNG tràn hết bề ngang màn hình. Nó rộng đúng 1050px — bằng lòng
 *    trong của khung nội dung — nên hai mép màu thẳng hàng với chữ ở trên và
 *    dưới. Dựng full-bleed là hỏng ngay bố cục.
 * 2. Màu nhìn thấy là kết quả của HAI lớp: một lớp xanh đặc, phủ lên bởi một lớp
 *    trắng 85%. Không phải một màu xanh nhạt pha sẵn. Giữ đúng hai lớp thì khi
 *    khách đổi màu chủ đạo trong admin, dải này nhạt theo đúng cùng tỉ lệ.
 *
 * KHÔNG port `min-height: 600px` của bản gốc, dù đó là số đo thật. Trên bản gốc
 * quy tắc đó không bao giờ có tác dụng: 8 ô xếp thành hai hàng đã cao 637px, nên
 * dải luôn ôm sát nội dung. Đưa nguyên con số sang đây thì với 3 danh mục (một
 * hàng, cao ~317px) nó lại kích hoạt và chừa ra gần 300px nền trống — tái tạo
 * đúng dòng CSS nhưng sai hẳn cái mà người xem nhìn thấy.
 */
export function CategorySection({ items }: { items: CategoryTileItem[] }) {
  if (items.length === 0) return null

  return (
    <section aria-label="Danh mục sản phẩm" className="relative flex items-center px-[30px]">
      <div aria-hidden className="absolute inset-0 bg-primary-500" />
      <div aria-hidden className="absolute inset-0 bg-white/85" />
      <div className="relative w-full">
        <div className="-mx-[15px] flex flex-wrap">
          {items.map((item) => (
            <div key={item.id} className="vnd-reveal-item w-1/2 px-[15px] pb-[30px] tile:w-1/4">
              <CategoryTile name={item.name} href={item.href} imageUrl={item.imageUrl} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
