'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { uploadMediaAction } from '@/lib/actions/media'
import { ALLOWED_MIME, MAX_SIZE_BYTES } from '@/lib/upload-constraints'

export function MediaUploader({ onUploaded }: { onUploaded?: (url: string) => void }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  return (
    <div>
      <label className="inline-block cursor-pointer rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-primary-fg">
        {pending ? 'Đang tải lên…' : 'Tải ảnh lên'}
        <input
          type="file"
          accept={ALLOWED_MIME.join(',')}
          className="hidden"
          disabled={pending}
          onChange={async (event) => {
            const file = event.target.files?.[0]
            event.target.value = ''         // cho phép chọn lại đúng file đó sau khi lỗi
            if (!file) return

            // Kiểm tra phía trình duyệt để báo lỗi ngay, server vẫn kiểm tra lại
            if (!ALLOWED_MIME.includes(file.type)) return setError('Chỉ nhận ảnh JPG, PNG, WEBP hoặc AVIF')
            if (file.size > MAX_SIZE_BYTES) return setError('Ảnh không được vượt quá 5MB')

            setError(null)
            setPending(true)
            const fd = new FormData()
            fd.set('file', file)
            const result = await uploadMediaAction(fd)
            setPending(false)

            if (!result.ok) return setError(result.formError ?? 'Tải ảnh thất bại, vui lòng thử lại.')
            onUploaded?.(result.data.url)
            router.refresh()
          }}
        />
      </label>
      {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}
