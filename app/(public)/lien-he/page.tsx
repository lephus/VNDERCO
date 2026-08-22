import type { Metadata } from 'next'
import media from '@/lib/generated/page-media.json'
import { getSiteSettings } from '@/lib/queries/settings'
import { PageHero } from '@/components/public/PageHero'
import { SectionHeading } from '@/components/public/SectionHeading'
import { ContactForm } from '@/components/public/ContactForm'
import { buttonClass } from '@/lib/ui/button'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Liên hệ',
  description: 'Liên hệ VNDERCO để khảo sát và báo giá vật liệu ốp lát nội thất: tấm ốp tường, lam trang trí, trần nhựa, sàn gỗ và sàn nhựa.',
  alternates: { canonical: '/lien-he' },
}

const HOURS = [
  { day: 'Thứ 2 – Thứ 6', time: '08:00 – 17:30' },
  { day: 'Thứ 7', time: '08:00 – 12:00' },
  { day: 'Chủ nhật', time: 'Nghỉ — vẫn nhận cuộc gọi gấp' },
]

function ChannelCard({
  label, value, href, note, icon,
}: { label: string; value: string; href: string; note: string; icon: React.ReactNode }) {
  return (
    <a
      href={href}
      className="group flex h-full flex-col border border-black/10 p-6 transition-all duration-500 ease-out hover:-translate-y-1 hover:border-primary-600/40 hover:shadow-lg"
    >
      <span className="flex size-11 items-center justify-center rounded-full bg-primary-50 text-primary-600 transition-transform duration-300 ease-out group-hover:scale-110">
        {icon}
      </span>
      <span className="mt-4 text-[13px] font-bold tracking-[0.14em] text-black/45 uppercase">{label}</span>
      <span className="mt-1 text-[17px]/[26px] font-bold text-primary-600 transition-colors duration-200 group-hover:text-black">
        {value}
      </span>
      <span className="mt-2 text-[14.4px]/[23.04px] text-black/65">{note}</span>
    </a>
  )
}

const Icon = ({ d }: { d: string }) => (
  <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" className="size-5">
    <path d={d} />
  </svg>
)

export default async function ContactPage() {
  const settings = await getSiteSettings()
  const address = settings.contactAddress ?? ''
  // Bản đồ nhúng theo TOẠ ĐỘ chứ không theo chuỗi địa chỉ, và đây là kết quả đo
  // chứ không phải sở thích: với `?q=<địa chỉ>` thì thêm `&z=` vào là khung bản
  // đồ ra một mảng xanh trống — Google chỉ áp được mức zoom khi nó định vị chắc
  // chắn, mà địa chỉ tiếng Việt viết đầy đủ thì nó lùi ra tận mức quốc gia. Với
  // `?q=<vĩ độ>,<kinh độ>` thì `z` chạy đúng.
  //
  // Toạ độ dưới đây trỏ tới đoạn Nguyễn Văn Linh, Quận 7 — ĐỔI LẠI cho đúng kho
  // hàng thật khi có địa chỉ chính thức.
  const MAP_CENTER = '10.7295,106.7215'
  const MAP_ZOOM = 15

  return (
    <>
      <PageHero
        title="Liên hệ"
        subtitle="Khảo sát miễn phí trong nội thành. Báo giá chi tiết trong 24 giờ kể từ khi nhận đủ thông tin."
        imageUrl={media.singles['contact-office']}
        breadcrumb={[{ name: 'Trang chủ', href: '/' }, { name: 'Liên hệ' }]}
      />

      <div className="py-[30px]">
        <div className="vnd-container pb-[30px]">
          {/* --- kênh liên hệ --- */}
          <section className="vnd-reveal p-[30px]">
            <div className="-mx-[15px] flex flex-wrap">
              {settings.contactPhone && (
                <div className="w-full px-[15px] pb-[30px] tile:w-1/2 nav:w-1/3">
                  <ChannelCard
                    label="Gọi trực tiếp" value={settings.contactPhone} href={`tel:${settings.contactPhone}`}
                    note="Nhanh nhất. Có người trực máy trong giờ làm việc."
                    icon={<Icon d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />}
                  />
                </div>
              )}
              {settings.zaloUrl && (
                <div className="w-full px-[15px] pb-[30px] tile:w-1/2 nav:w-1/3">
                  <ChannelCard
                    label="Nhắn Zalo" value="Chat với kỹ thuật" href={settings.zaloUrl}
                    note="Gửi ảnh hiện trạng để được tư vấn vật liệu phù hợp."
                    icon={<Icon d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />}
                  />
                </div>
              )}
              {settings.contactEmail && (
                <div className="w-full px-[15px] pb-[30px] tile:w-1/2 nav:w-1/3">
                  <ChannelCard
                    label="Gửi email" value={settings.contactEmail} href={`mailto:${settings.contactEmail}`}
                    note="Phù hợp khi cần gửi bản vẽ hoặc bảng khối lượng."
                    icon={<Icon d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm18 2-10 7L2 6" />}
                  />
                </div>
              )}
            </div>
          </section>

          {/* --- form + thông tin --- */}
          <section className="vnd-reveal p-[30px]">
            <SectionHeading inSection title="Gửi yêu cầu báo giá" />
            <div className="-mx-[15px] flex flex-wrap">
              <div className="w-full px-[15px] pb-[30px] nav:w-[58.3333%]">
                <ContactForm email={settings.contactEmail || 'lienhe@vnderco.vn'} />
              </div>
              <div className="w-full px-[15px] pb-[30px] nav:w-[41.6667%]">
                <div className="border border-black/10 p-6">
                  <h3 className="text-[17px]/[24px] font-bold text-primary-600">Văn phòng &amp; kho hàng</h3>
                  <div aria-hidden className="mt-3 mb-4 h-[2px] w-[28px] bg-primary-600" />
                  {address && <p className="text-[15px]/[25.6px]">{address}</p>}

                  <h3 className="mt-6 text-[17px]/[24px] font-bold text-primary-600">Giờ làm việc</h3>
                  <div aria-hidden className="mt-3 mb-4 h-[2px] w-[28px] bg-primary-600" />
                  <dl className="space-y-2 text-[15px]/[25.6px]">
                    {HOURS.map((h) => (
                      <div key={h.day} className="flex justify-between gap-4 border-b border-dashed border-black/10 pb-2 last:border-0">
                        <dt className="text-black/70">{h.day}</dt>
                        <dd className="text-right font-semibold">{h.time}</dd>
                      </div>
                    ))}
                  </dl>

                  {settings.contactPhone && (
                    <a href={`tel:${settings.contactPhone}`} className={`mt-6 w-full ${buttonClass({ size: 'lg' })}`}>
                      Gọi {settings.contactPhone}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* --- bản đồ --- */}
          <section className="vnd-reveal p-[30px]">
            <SectionHeading inSection title="Đường tới kho hàng" />
            {/* loading="lazy": bản đồ nằm cuối trang, tải ngay từ đầu chỉ làm chậm
                phần nội dung khách thực sự đọc trước. */}
            <div className="relative aspect-[16/7] w-full overflow-hidden border border-black/10">
              <iframe
                title="Bản đồ tới văn phòng VNDERCO"
                src={`https://www.google.com/maps?q=${MAP_CENTER}&z=${MAP_ZOOM}&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 size-full"
              />
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
