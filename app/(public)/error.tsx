'use client'

export default function PublicError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-2xl font-extrabold text-slate-900">Đã có lỗi xảy ra</h1>
      <p className="mt-2 text-slate-600">Vui lòng thử lại. Nếu vẫn lỗi, hãy liên hệ với chúng tôi.</p>
      <button type="button" onClick={reset}
        className="mt-8 rounded-full bg-primary-600 px-6 py-3 font-semibold text-primary-fg">
        Thử lại
      </button>
    </div>
  )
}
