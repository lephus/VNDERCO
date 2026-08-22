import Link from 'next/link'
import type { SiteSetting } from '@prisma/client'

/**
 * Chân trang hai tầng theo bản thiết kế: dải widget nền xanh đậm, rồi một vạch
 * bản quyền nền xám tách hẳn ra.
 *
 * Nền xám #5B5B5B của vạch dưới cùng để nguyên số cố định chứ không lấy từ bảng
 * màu: nó là màu trung tính, không phải màu thương hiệu, nên khi khách đổi màu
 * chủ đạo trong admin thì vạch này vẫn phải giữ nguyên.
 */
export function SiteFooter({ settings }: { settings: SiteSetting }) {
  return (
    <footer>
      <div className="bg-primary-700 pt-[30px] text-[#f1f1f1]">
        <div className="vnd-container flex flex-wrap">
          <FooterColumn title={settings.siteName}>
            {settings.contactAddress && <p>Địa chỉ: {settings.contactAddress}</p>}
            {settings.contactPhone && (
              <p>
                Điện thoại:{' '}
                <a href={`tel:${settings.contactPhone}`} className="hover:underline">
                  {settings.contactPhone}
                </a>
              </p>
            )}
            {settings.contactEmail && (
              <p>
                Email:{' '}
                <a href={`mailto:${settings.contactEmail}`} className="hover:underline">
                  {settings.contactEmail}
                </a>
              </p>
            )}
          </FooterColumn>

          <FooterColumn title="Liên kết">
            <p>
              <Link href="/san-pham" className="hover:underline">Sản phẩm</Link>
            </p>
            <p>
              <Link href="/tin-tuc" className="hover:underline">Tin tức</Link>
            </p>
            {settings.facebookUrl && (
              <p><a href={settings.facebookUrl} className="hover:underline">Facebook</a></p>
            )}
            {settings.zaloUrl && (
              <p><a href={settings.zaloUrl} className="hover:underline">Zalo</a></p>
            )}
          </FooterColumn>
        </div>
      </div>

      <div className="bg-[#5b5b5b] pt-[10px] pb-[15px] text-center text-[14.4px]/[23.04px] text-white/50">
        <div className="vnd-container">
          © {new Date().getFullYear()} {settings.siteName}
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    // 50% mỗi cột từ 850px trở lên, xuống dưới thì xếp chồng — cùng điểm ngắt
    // với thanh điều hướng, đúng như bản tham chiếu.
    <div className="mb-6 w-full px-[15px] nav:w-1/2">
      <p className="text-[16px]/[16.8px] font-semibold uppercase">{title}</p>
      {/* Vạch ngăn 30×3px dưới tiêu đề widget — chi tiết nhỏ nhưng là thứ làm
          chân trang trông "đúng bản" nhất. */}
      <div aria-hidden className="mt-[10.56px] mb-4 h-[3px] w-[30px] bg-white/30" />
      <div className="space-y-[4px] text-[13px]/[20.8px]">{children}</div>
    </div>
  )
}
