'use client'

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="rounded-xl bg-white p-8 text-center shadow-sm">
      <h1 className="text-lg font-bold text-slate-900">Không tải được nội dung</h1>
      <p className="mt-2 text-sm text-slate-600">Thử lại, nếu vẫn lỗi hãy gửi mã sự cố bên dưới cho kỹ thuật.</p>
      {error.digest && <code className="mt-3 block text-xs text-slate-400">{error.digest}</code>}
      <button type="button" onClick={reset}
        className="mt-6 rounded-lg bg-primary-600 px-5 py-2 font-semibold text-primary-fg">Thử lại</button>
    </div>
  )
}
