import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-6xl font-extrabold text-primary-600">404</p>
      <h1 className="mt-4 text-2xl font-extrabold text-slate-900">Không tìm thấy trang</h1>
      <p className="mt-2 text-slate-600">Trang bạn tìm có thể đã bị xoá hoặc đổi đường dẫn.</p>
      <Link href="/" className="mt-8 inline-block rounded-full bg-primary-600 px-6 py-3 font-semibold text-primary-fg">
        Về trang chủ
      </Link>
    </div>
  )
}
