import Image from 'next/image'
import Link from 'next/link'
import type { SiteSetting } from '@prisma/client'
import { buttonClass } from '@/lib/ui/button'

/**
 * Dải cam kết — ảnh vuông bên trái, câu dẫn và danh sách gạch đầu dòng bên phải.
 *
 * Cũng như dải ô danh mục, dải màu này rộng đúng 1050px chứ không tràn màn hình.
 * Tỉ lệ hai cột 41,6667% / 58,3333% là 5/7 của lưới 12 cột bản gốc; dưới 550px
 * thì xếp chồng, ảnh chiếm hết bề ngang.
 *
 * Mỗi dòng của homeIntroBody thành một mục danh sách: bản gốc trình bày phần
 * này dưới dạng danh sách gạch đầu dòng (thụt 20,8px, cách nhau 9,6px), và
 * khách vẫn nhập nội dung như một khối văn bản nhiều dòng trong admin.
 */
export function CommitmentBand({ settings }: { settings: SiteSetting }) {
  const lines = settings.homeIntroBody
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  if (!settings.homeIntroTitle && lines.length === 0) return null

  return (
    <section className="flex items-center bg-primary-600 p-[30px] text-[#f5f0f0]">
      <div className="w-full">
        {/* Không có lề âm -15px ở đây, khác với hàng ô danh mục/sản phẩm — và
            đó là số đo chứ không phải quên: bản gốc khoá hàng này ở đúng bề
            ngang lòng trong (990px ở 1440), nên hai cột chia 41,6667%/58,3333%
            của 990 chứ không phải của 1020. Thêm lề âm vào là ảnh vuông bên
            trái phình từ 382,5px lên 395px. */}
        <div className="flex flex-wrap items-center">
          {settings.homeIntroImageUrl && (
            <div className="w-full px-[15px] pb-[30px] text-center tile:w-[41.6667%]">
              <div className="relative mx-auto aspect-square w-full overflow-hidden">
                <Image
                  src={settings.homeIntroImageUrl}
                  alt=""
                  fill
                  sizes="(max-width: 550px) 100vw, 40vw"
                  className="object-cover"
                />
              </div>
            </div>
          )}
          <div
            className={`w-full px-[15px] pb-[30px] ${settings.homeIntroImageUrl ? 'tile:w-[58.3333%]' : ''}`}
          >
            {settings.homeIntroTitle && (
              <p className="mb-[20.8px] text-[16px]/[25.6px]">{settings.homeIntroTitle}</p>
            )}
            {lines.length > 0 && (
              <ul className="list-disc">
                {lines.map((line) => (
                  <li key={line} className="mb-[9.6px] ml-[20.8px] text-[16px]/[25.6px]">
                    {line}
                  </li>
                ))}
              </ul>
            )}
            {settings.homeIntroCtaHref && settings.homeIntroCtaLabel && (
              <Link
                href={settings.homeIntroCtaHref}
                className={`mt-6 ${buttonClass({ size: 'lg', variant: 'onDark' })}`}
              >
                {settings.homeIntroCtaLabel}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
