/**
 * Một thang nút dùng chung cho cả site.
 *
 * Trước đây mỗi chỗ tự viết class riêng, nên đo ra sáu chiều cao khác nhau:
 * 34px (Lọc, Chọn ảnh, chip danh mục), 36px (Liên hệ ở header, Viết bài mới),
 * 40px (Lưu), 48px (CTA hero), 50px và cả 72px (nút liên hệ bị xuống dòng).
 * Cùng một loại hành động mà mỗi trang một cỡ thì trông như ghép từ hai sản phẩm.
 *
 * Đây là HÀM TRẢ VỀ CHUỖI CLASS chứ không phải component: nút trong dự án khi thì
 * <button>, khi thì <Link>, khi thì <a href="tel:">. Một hàm class dùng được cho
 * cả ba mà không phải bọc thêm lớp component nào, và không đụng vào cấu trúc DOM
 * nên các locator trong e2e giữ nguyên.
 *
 * Chiều cao đặt bằng `h-*` cố định thay vì padding dọc: padding cộng với line-height
 * cho ra chiều cao trôi nổi theo cỡ chữ, đó chính là lý do bộ nút cũ lệch nhau.
 */

type Variant = 'primary' | 'secondary' | 'neutral' | 'ghost' | 'danger' | 'onDark' | 'onDarkOutline'
type Size = 'sm' | 'md' | 'lg'
type Shape = 'pill' | 'rounded'

// Cỡ nhỏ nhất là 36px. WCAG 2.5.8 đòi tối thiểu 24px, nhưng 24px chỉ vừa đủ để
// không bị coi là lỗi chứ không dễ bấm; 44px là mức thoải mái cho ngón tay và
// được dùng cho mọi nút chính.
const SIZES: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-7 text-base',
}

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-primary-600 text-primary-fg shadow-sm hover:brightness-110 hover:shadow-md',
  secondary: 'border border-primary-600 bg-white text-primary-700 hover:bg-primary-50',
  neutral: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  danger: 'text-red-600 hover:bg-red-50',
  // Dùng trên nền gradient/ảnh tối, nơi màu thương hiệu chìm mất.
  onDark: 'bg-white text-slate-900 shadow-sm hover:shadow-md',
  onDarkOutline: 'border border-white/60 text-white hover:bg-white/10',
}

const SHAPES: Record<Shape, string> = {
  pill: 'rounded-full',
  rounded: 'rounded-lg',
}

// `whitespace-nowrap` là bắt buộc, không phải cho đẹp: nút liên hệ trên trang sản
// phẩm từng cao 72px vì "Gọi 0900000000" bị bẻ đôi trong cột hẹp.
const BASE =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold ' +
  'transition duration-200 ease-out active:translate-y-0 ' +
  'disabled:pointer-events-none disabled:opacity-50'

export function buttonClass({
  variant = 'primary', size = 'md', shape = 'pill', lift = true, className = '',
}: {
  variant?: Variant; size?: Size; shape?: Shape; lift?: boolean; className?: string
} = {}): string {
  // Nút chìm trong bảng hoặc thanh công cụ thì không nên nhấc lên khi rê chuột —
  // cả hàng nhấp nhô trông rối.
  const hover = lift ? 'hover:-translate-y-0.5' : ''
  return [BASE, SIZES[size], VARIANTS[variant], SHAPES[shape], hover, className]
    .filter(Boolean).join(' ')
}
