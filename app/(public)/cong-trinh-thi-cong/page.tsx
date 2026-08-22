import Link from 'next/link'
import type { Metadata } from 'next'
import media from '@/lib/generated/page-media.json'
import { getSiteSettings } from '@/lib/queries/settings'
import { PageHero } from '@/components/public/PageHero'
import { SectionHeading } from '@/components/public/SectionHeading'
import { ProjectGallery, type Project } from '@/components/public/ProjectGallery'
import { StatCounter } from '@/components/public/StatCounter'
import { buttonClass } from '@/lib/ui/button'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Công trình thi công',
  description: 'Một số công trình VNDERCO đã hoàn thiện: căn hộ, nhà phố, khách sạn, nhà hàng, văn phòng và showroom.',
  alternates: { canonical: '/cong-trinh-thi-cong' },
}

const projects = media.projects as Project[]

export default async function ProjectsPage() {
  const settings = await getSiteSettings()

  // Số liệu dẫn xuất từ chính danh sách công trình — sửa dữ liệu là số tự đổi
  // theo, không phải nhớ cập nhật hai chỗ.
  const totalArea = projects.reduce((sum, p) => sum + Number.parseInt(p.area, 10), 0)
  const kinds = new Set(projects.map((p) => p.kind)).size

  return (
    <>
      <PageHero
        title="Công trình thi công"
        subtitle="Ảnh chụp tại công trình sau khi nghiệm thu. Bấm vào từng tấm để xem lớn."
        imageUrl={projects[1]?.imageUrl}
        breadcrumb={[{ name: 'Trang chủ', href: '/' }, { name: 'Công trình thi công' }]}
      />

      <div className="py-[30px]">
        <div className="vnd-container pb-[30px]">
          <section className="vnd-reveal relative overflow-hidden px-[30px] py-[36px]">
            <div aria-hidden className="absolute inset-0 bg-primary-500" />
            <div aria-hidden className="absolute inset-0 bg-white/85" />
            <div className="relative -mx-[15px] flex flex-wrap">
              <div className="w-1/2 px-[15px] py-3 tile:w-1/4">
                <StatCounter value={projects.length} suffix="" label="Công trình tiêu biểu" />
              </div>
              <div className="w-1/2 px-[15px] py-3 tile:w-1/4">
                <StatCounter value={totalArea} suffix=" m²" label="Tổng diện tích nhóm này" />
              </div>
              <div className="w-1/2 px-[15px] py-3 tile:w-1/4">
                <StatCounter value={kinds} suffix=" loại" label="Loại hình công trình" />
              </div>
              <div className="w-1/2 px-[15px] py-3 tile:w-1/4">
                <StatCounter value={24} suffix=" tháng" label="Bảo hành mỗi hạng mục" />
              </div>
            </div>
          </section>

          <section className="vnd-reveal p-[30px]">
            <SectionHeading inSection title="Danh mục công trình" />
            <ProjectGallery projects={projects} />
          </section>

          <section className="vnd-reveal bg-primary-600 p-[30px] text-center text-[#f5f0f0]">
            <h2 className="text-[23.552px]/[30.6176px] font-bold">Muốn xem hồ sơ năng lực đầy đủ?</h2>
            <p className="mx-auto mt-3 max-w-xl text-[16px]/[25.6px]">
              Bộ ảnh trên đây chỉ là phần trích. Liên hệ để nhận hồ sơ chi tiết từng hạng mục kèm
              chủng loại vật tư đã dùng.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/lien-he" className={buttonClass({ size: 'lg', variant: 'onDark' })}>
                Nhận hồ sơ năng lực
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
