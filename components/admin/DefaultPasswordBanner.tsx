import Link from 'next/link'

export function DefaultPasswordBanner() {
  return (
    <div role="alert" className="bg-red-600 px-4 py-2 text-sm text-white">
      Tài khoản đang dùng <strong>mật khẩu mặc định</strong>. Hãy{' '}
      <Link href="/admin/doi-mat-khau" className="underline">đổi mật khẩu</Link> ngay để tránh bị truy cập trái phép.
    </div>
  )
}
