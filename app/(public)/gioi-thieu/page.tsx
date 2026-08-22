import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import media from '@/lib/generated/page-media.json'
import { getSiteSettings } from '@/lib/queries/settings'
import { PageHero } from '@/components/public/PageHero'
import { SectionHeading } from '@/components/public/SectionHeading'
import { StatCounter } from '@/components/public/StatCounter'
import { buttonClass } from '@/lib/ui/button'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Giới thiệu',
  description: 'VNDERCO — cung cấp và thi công vật liệu ốp lát nội thất: tấm ốp tường, lam trang trí, trần nhựa, sàn gỗ và sàn nhựa.',
  alternates: { canonical: '/gioi-thieu' },
}

const STATS = [
  { value: 15, suffix: ' năm', label: 'Trong nghề vật liệu hoàn thiện' },
  { value: 1200, suffix: '+', label: 'Công trình đã bàn giao' },
  { value: 480, suffix: '.000 m²', label: 'Diện tích đã thi công' },
  { value: 96, suffix: '%', label: 'Khách quay lại hoặc giới thiệu' },
]

const REASONS = [
  { title: 'Kho hàng tại chỗ', body: 'Hơn 400 mã hàng sẵn kho ở TP.HCM. Khách chốt mẫu hôm nay thì hôm sau có vật tư tại chân công trình, không phải chờ nhập từng đợt.' },
  { title: 'Thợ của công ty', body: 'Đội thi công là nhân sự cơ hữu, không khoán lại cho nhóm bên ngoài. Cùng một tay nghề ở công trình đầu tiên và công trình thứ một nghìn.' },
  { title: 'Báo giá trọn gói', body: 'Một bảng giá gồm vật tư, phụ kiện, nhân công và dọn dẹp. Không phát sinh nẹp, keo, ke nhựa giữa chừng.' },
  { title: 'Bảo hành tận nơi', body: 'Hai năm bảo hành, nhận xử lý tại chỗ trong 48 giờ. Hồ sơ từng công trình được lưu lại nên biết chính xác đã dùng lô hàng nào.' },
]

const PROCESS = [
  { step: '01', title: 'Khảo sát', body: 'Đo đạc hiện trạng, kiểm tra độ phẳng tường và độ ẩm nền. Bước này quyết định vật liệu nào dùng được.' },
  { step: '02', title: 'Chọn mẫu & báo giá', body: 'Xem mẫu thật tại kho hoặc mang mẫu tới công trình. Báo giá chi tiết trong 24 giờ.' },
  { step: '03', title: 'Ký hợp đồng', body: 'Chốt khối lượng, tiến độ và điều khoản bảo hành. Tạm ứng theo giai đoạn, không thu trước toàn bộ.' },
  { step: '04', title: 'Thi công', body: 'Xử lý nền, lắp đặt, chừa khe giãn nở theo khuyến cáo nhà sản xuất. Ảnh tiến độ gửi hằng ngày.' },
  { step: '05', title: 'Nghiệm thu & bàn giao', body: 'Kiểm tra từng mối nối, dọn sạch mặt bằng, bàn giao kèm phiếu bảo hành và hướng dẫn vệ sinh.' },
]

export default async function AboutPage() {
  const settings = await getSiteSettings()

  return (
    <>
      <PageHero
        title="Giới thiệu VNDERCO"
        subtitle="Mười lăm năm làm một việc: đưa vật liệu hoàn thiện đúng chủng loại tới công trình và lắp cho đúng kỹ thuật."
        imageUrl={media.singles['about-hero']}
        breadcrumb={[{ name: 'Trang chủ', href: '/' }, { name: 'Giới thiệu' }]}
      />

      <div className="py-[30px]">
        <div className="vnd-container pb-[30px]">
          {/* --- lời mở --- */}
          <section className="vnd-reveal p-[30px]">
            <div className="-mx-[15px] flex flex-wrap items-center">
              <div className="w-full px-[15px] pb-[30px] nav:w-[41.6667%]">
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={media.singles['about-workshop']}
                    alt="Xưởng cắt và gia công vật liệu của VNDERCO"
                    fill
                    sizes="(max-width: 850px) 100vw, 40vw"
                    className="object-cover transition-transform duration-700 ease-out hover:scale-105"
                  />
                </div>
              </div>
              <div className="w-full px-[15px] pb-[30px] nav:w-[58.3333%]">
                <h2 className="text-[23.552px]/[30.6176px] font-bold text-primary-600">
                  Chúng tôi bán vật liệu, nhưng bán được là nhờ tay nghề
                </h2>
                <div aria-hidden className="mt-[10.56px] mb-4 h-[3px] w-[40px] bg-primary-600/30" />
                <div className="space-y-4 text-[16px]/[25.6px]">
                  <p>
                    VNDERCO bắt đầu năm 2011 từ một cửa hàng vật liệu nhỏ ở Quận 7. Khách mua tấm ốp về
                    tự thuê thợ lắp, và phần lớn khiếu nại quay lại không phải vì tấm ốp kém mà vì lắp sai:
                    tường chưa phẳng đã dán, không chừa khe giãn nở, cắt góc không vát.
                  </p>
                  <p>
                    Vì vậy chúng tôi lập đội thi công riêng. Đến nay VNDERCO nhận trọn gói từ khảo sát tới
                    nghiệm thu, và vẫn bán vật tư rời cho ai đã có thợ quen — kèm hướng dẫn kỹ thuật cho
                    từng dòng hàng.
                  </p>
                  <p>
                    Kho hàng đặt tại TP.HCM, phục vụ công trình dân dụng và thương mại ở khu vực phía Nam,
                    nhận vận chuyển vật tư toàn quốc.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* --- con số --- */}
          <section className="vnd-reveal relative overflow-hidden px-[30px] py-[40px]">
            <div aria-hidden className="absolute inset-0 bg-primary-500" />
            <div aria-hidden className="absolute inset-0 bg-white/85" />
            <div className="relative -mx-[15px] flex flex-wrap">
              {STATS.map((stat) => (
                <div key={stat.label} className="w-1/2 px-[15px] py-4 tile:w-1/4">
                  <StatCounter value={stat.value} suffix={stat.suffix} label={stat.label} />
                </div>
              ))}
            </div>
          </section>

          {/* --- vì sao chọn --- */}
          <section className="vnd-reveal p-[30px]">
            <SectionHeading inSection title="Vì sao khách chọn VNDERCO" />
            <div className="-mx-[15px] flex flex-wrap">
              {REASONS.map((item, i) => (
                <div key={item.title} className="w-full px-[15px] pb-[30px] tile:w-1/2">
                  <div className="group h-full border border-black/10 p-6 transition-all duration-500 ease-out hover:-translate-y-1 hover:border-primary-600/40 hover:shadow-lg">
                    <span className="text-[13px] font-bold tracking-[0.2em] text-primary-600/50">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="mt-2 text-[18px]/[26px] font-bold text-primary-600">{item.title}</h3>
                    <div aria-hidden className="mt-3 mb-3 h-[2px] w-[28px] bg-primary-600 transition-all duration-500 ease-out group-hover:w-[56px]" />
                    <p className="text-[15px]/[25.6px] text-black/80">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* --- quy trình --- */}
          <section className="vnd-reveal p-[30px]">
            <SectionHeading inSection title="Quy trình năm bước" />
            <ol className="relative">
              {/* Đường dọc nối các bước, ẩn ở màn hẹp vì lúc đó các bước xếp sát nhau. */}
              <div aria-hidden className="absolute top-2 bottom-2 left-[19px] hidden w-px bg-primary-600/20 tile:block" />
              {PROCESS.map((item) => (
                <li key={item.step} className="group relative flex gap-4 pb-7 last:pb-0 tile:gap-6">
                  <span className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-600 text-[14px] font-bold text-primary-fg transition-transform duration-300 ease-out group-hover:scale-110">
                    {item.step}
                  </span>
                  <div className="pt-1">
                    <h3 className="text-[17px]/[24px] font-bold text-primary-600">{item.title}</h3>
                    <p className="mt-1 text-[15px]/[25.6px] text-black/80">{item.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* --- kêu gọi --- */}
          <section className="vnd-reveal bg-primary-600 p-[30px] text-center text-[#f5f0f0]">
            <h2 className="text-[23.552px]/[30.6176px] font-bold">Cần khảo sát và báo giá?</h2>
            <p className="mx-auto mt-3 max-w-xl text-[16px]/[25.6px]">
              Gửi hiện trạng công trình, chúng tôi trả lời trong 24 giờ kèm bảng khối lượng chi tiết.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/lien-he" className={buttonClass({ size: 'lg', variant: 'onDark' })}>
                Liên hệ ngay
              </Link>
              {settings.contactPhone && (
                <a href={`tel:${settings.contactPhone}`} className={buttonClass({ size: 'lg', variant: 'onDarkOutline' })}>
                  Gọi {settings.contactPhone}
                </a>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
