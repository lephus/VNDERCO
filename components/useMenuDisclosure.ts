'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

/**
 * Trạng thái đóng/mở dùng chung cho menu điện thoại ở trang công khai và ngăn
 * kéo điều hướng trong trang quản trị. Gom lại một chỗ vì cả hai đều cần đúng
 * ba hành vi dễ quên sau, và quên bất kỳ cái nào cũng thành lỗi khó chịu:
 *
 *  - đóng khi chuyển trang (nếu không, bấm một mục xong menu vẫn nằm chình ình
 *    che trang vừa mở)
 *  - phím Esc đóng được (người dùng bàn phím không bị kẹt trong menu)
 *  - khoá cuộn nền khi menu đang mở (nếu không, cuộn trong menu sẽ kéo cả trang
 *    phía sau trôi theo — lỗi kinh điển trên iOS)
 */
export function useMenuDisclosure() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const [lastPathname, setLastPathname] = useState(pathname)

  // Đóng menu khi đổi trang bằng cách chỉnh state NGAY TRONG lúc render, không
  // phải trong useEffect. Đây là cách React khuyên dùng cho "sửa state khi một
  // giá trị đầu vào đổi": React thấy setState lúc render thì render lại ngay
  // trước khi vẽ ra màn hình, nên không có khung hình nào lọt ra với menu vẫn
  // mở. Làm trong useEffect thì menu kịp hiện một nhịp rồi mới đóng, và ESLint
  // (react-hooks/set-state-in-effect) cũng chặn.
  if (pathname !== lastPathname) {
    setLastPathname(pathname)
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)

    // Trả lại đúng giá trị cũ thay vì gán cứng '' — trang khác có thể đã đặt
    // overflow riêng, ghi đè bừa sẽ phá thứ mình không sở hữu.
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  return { open, setOpen }
}
