import Link from 'next/link'

export type Crumb = { name: string; href?: string }

/**
 * Đường dẫn phân cấp hiển thị cho người xem. Trước đây trang chi tiết chỉ phát
 * breadcrumb dạng JSON-LD cho Google, còn khách vào thẳng từ kết quả tìm kiếm
 * thì không thấy mình đang ở đâu và không có đường quay lên mục cha.
 *
 * Mục cuối không phải link (đang đứng ở đó rồi) và mang aria-current="page".
 */
export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Đường dẫn" className="mb-6 text-sm">
      <ol className="flex flex-wrap items-center gap-x-1 gap-y-1 text-slate-500">
        {items.map((item, index) => {
          const last = index === items.length - 1
          return (
            <li key={`${item.name}-${index}`} className="flex items-center gap-x-1">
              {item.href && !last
                ? <Link href={item.href} className="inline-block py-1 transition-colors hover:text-primary-700 hover:underline">{item.name}</Link>
                : <span className="inline-block py-1 text-slate-700" aria-current={last ? 'page' : undefined}>{item.name}</span>}
              {/* Dấu phân cách chỉ để nhìn — ẩn khỏi trình đọc màn hình để nó
                  không đọc "gạch chéo" giữa từng mục. */}
              {!last && <span aria-hidden className="text-slate-300">/</span>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
