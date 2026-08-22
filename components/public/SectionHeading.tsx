import Link from 'next/link'

/**
 * Tiêu đề mục — mô-típ đặc trưng của bản thiết kế: chữ nằm giữa, hai bên là hai
 * đường kẻ 2px kéo dài hết chỗ trống, cuối hàng là mũi "xem tất cả".
 *
 * Hai đường kẻ dùng <span aria-hidden> chứ không phải ::before/::after: chúng cần
 * `flex: 1` để tự chia phần còn lại sau khi chữ đã chiếm chỗ, mà pseudo-element
 * trong một flex container thì không nhận được phần chia đó một cách chắc chắn
 * khi chữ đổi độ dài.
 *
 * Mọi cỡ chữ dưới đây là số đo lấy bằng getComputedStyle trên bản tham chiếu
 * (25,6px cho h2 / 23,552px cho chữ giữa / 17,664px ở mobile), không phải lớp
 * tiện ích làm tròn — text-2xl là 24px, lệch 0,4px và sai cả line-height.
 */
export function SectionHeading({
  title, href, linkLabel, inSection = false,
}: { title: string; href?: string; linkLabel?: string; inSection?: boolean }) {
  return (
    // Tiêu đề đứng riêng có lề trên 30px; tiêu đề nằm TRONG một mục thì không —
    // mục đã tự có đệm 30px, cộng thêm lề nữa là hở gấp đôi so với bản gốc.
    <div className={inSection ? 'mb-6' : 'mt-[30px] mb-6'}>
      {/* Dưới 550px cả cụm tiêu đề thu nhỏ đúng hệ số 0,75 — đo được ở 549px và
          551px: h2 25,6→19,2px, chữ giữa 23,552→17,664px, mũi 20,48→15,36px,
          lề dưới h2 12,8→9,6px. Đây là một bước nhảy ở đúng 550px chứ không
          phải co giãn dần, nên dùng điểm ngắt `tile` chứ không phải clamp(). */}
      <h2 className="mb-[9.6px] flex items-center justify-between text-[19.2px]/[24.96px] font-bold text-primary-600 tile:mb-[12.8px] tile:text-[25.6px]/[33.28px]">
        <Rule side="left" />
        <span className="mx-[15px] shrink-0 text-center text-[17.664px]/[22.9632px] font-bold tile:text-[23.552px]/[30.6176px]">
          {title}
        </span>
        <Rule side="right" />
        {href && linkLabel && (
          <Link
            href={href}
            aria-label={linkLabel}
            className="group flex shrink-0 items-center pl-[15px] text-[15.36px]/[19.968px] font-bold text-primary-500 transition-colors duration-200 hover:text-black tile:text-[20.48px]/[26.624px]"
          >
            {/* Nhãn chỉ hiện từ tile trở lên: ở màn hẹp hai đường kẻ đã bị bóp
                gần hết, thêm chữ vào là tiêu đề vỡ xuống hai dòng. Mũi tên vẫn
                còn, và aria-label giữ nguyên nghĩa cho trình đọc màn hình. */}
            <span className="hidden text-[14.4px]/[23.04px] tile:inline">{linkLabel}</span>
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="ml-[10px] size-[0.75em] transition-transform duration-300 ease-out group-hover:translate-x-1"
            >
              <path d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </h2>
    </div>
  )
}

function Rule({ side }: { side: 'left' | 'right' }) {
  return (
    <span
      aria-hidden
      // Vạch trái mọc từ mép phải của nó (sát chữ) ra ngoài, vạch phải ngược lại.
      style={{ transformOrigin: side === 'left' ? 'right' : 'left' }}
      className="vnd-rule h-[2px] min-w-0 flex-1 bg-primary-600"
    />
  )
}
