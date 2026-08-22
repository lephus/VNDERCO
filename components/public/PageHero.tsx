import Image from 'next/image'
import Link from 'next/link'

/**
 * Dải đầu trang cho các trang tĩnh.
 *
 * Không dùng lại HeroSlider: băng ảnh trang chủ cao 426px và chạy nhiều slide,
 * còn ở đây chỉ cần một dải thấp đủ đặt tên trang và đường dẫn. Ảnh nền phủ một
 * lớp xanh đậm để chữ trắng luôn đọc được bất kể ảnh sáng hay tối — không phụ
 * thuộc vào việc chọn được tấm ảnh "vừa đủ tối".
 */
export function PageHero({
  title, subtitle, imageUrl, breadcrumb,
}: {
  title: string
  subtitle?: string
  imageUrl?: string
  breadcrumb: { name: string; href?: string }[]
}) {
  return (
    <section className="relative overflow-hidden bg-primary-700">
      {imageUrl && (
        <Image
          src={imageUrl}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-30"
        />
      )}
      {/* Hai lớp phủ: một lớp màu để giữ tông thương hiệu, một lớp dốc từ dưới
          lên để chân dải không bị "cắt ngang" khi ảnh có chi tiết sáng ở đáy. */}
      <div aria-hidden className="absolute inset-0 bg-primary-700/70" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-primary-800/60 to-transparent" />

      <div className="vnd-container relative py-[46px] tile:py-[64px]">
        <nav aria-label="Đường dẫn" className="mb-3 text-[13px]/[20.8px] text-white/70">
          {breadcrumb.map((item, i) => (
            <span key={item.name}>
              {i > 0 && <span aria-hidden className="mx-2 text-white/40">/</span>}
              {item.href ? (
                <Link href={item.href} className="transition-colors duration-200 hover:text-white">
                  {item.name}
                </Link>
              ) : (
                <span className="text-white">{item.name}</span>
              )}
            </span>
          ))}
        </nav>

        <h1 className="text-[26px]/[1.2] font-bold text-white tile:text-[38px]">{title}</h1>
        {subtitle && (
          <p className="mt-3 max-w-2xl text-[15px]/[25.6px] text-white/85 tile:text-[16px]">{subtitle}</p>
        )}
        <div aria-hidden className="mt-5 h-[3px] w-[52px] bg-white/40" />
      </div>
    </section>
  )
}
