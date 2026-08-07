import Image from 'next/image'
import { getMediaList } from '@/lib/queries/media'
import { MediaUploader } from '@/components/admin/MediaUploader'

export const metadata = { title: 'Thư viện ảnh' }

export default async function MediaLibraryPage() {
  const items = await getMediaList()

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Thư viện ảnh</h1>
        <MediaUploader />
      </div>
      <div className="grid grid-cols-5 gap-4">
        {items.map((m) => (
          <figure key={m.id} className="overflow-hidden rounded-xl bg-white shadow-sm">
            <Image src={m.url} alt={m.alt ?? ''} width={300} height={200} className="h-28 w-full object-cover" />
            <figcaption className="truncate p-2 text-xs text-slate-500">{m.filename}</figcaption>
          </figure>
        ))}
      </div>
      {items.length === 0 && <p className="text-sm text-slate-400">Chưa có ảnh nào. Bấm “Tải ảnh lên” để bắt đầu.</p>}
    </div>
  )
}
