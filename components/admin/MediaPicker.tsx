'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { MediaUploader } from './MediaUploader'

type Media = { id: string; url: string; filename: string; alt: string | null }

export function MediaPicker({
  value, onChange, label = 'Ảnh',
}: { value: string | null; onChange: (url: string | null) => void; label?: string }) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<Media[]>([])

  useEffect(() => {
    if (open) fetch('/api/media').then((r) => r.json()).then(setItems)
  }, [open])

  return (
    <div>
      <span className="block text-sm font-medium text-slate-700">{label}</span>
      <div className="mt-1 flex items-center gap-3">
        {value ? (
          <Image src={value} alt="" width={96} height={64} className="h-16 w-24 rounded-lg object-cover" />
        ) : (
          <div className="flex h-16 w-24 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400">
            Chưa có
          </div>
        )}
        <button type="button" onClick={() => setOpen(true)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm">
          Chọn ảnh
        </button>
        {value && (
          <button type="button" onClick={() => onChange(null)} className="text-sm text-red-600">Bỏ ảnh</button>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <div className="max-h-[80vh] w-full max-w-3xl overflow-auto rounded-2xl bg-white p-5" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Thư viện ảnh</h2>
              <MediaUploader onUploaded={(url) => { onChange(url); setOpen(false) }} />
            </div>
            <div className="grid grid-cols-4 gap-3">
              {items.map((m) => (
                <button key={m.id} type="button" onClick={() => { onChange(m.url); setOpen(false) }}
                  className="overflow-hidden rounded-lg border border-slate-200 hover:border-primary-500">
                  <Image src={m.url} alt={m.alt ?? ''} width={200} height={140} className="h-24 w-full object-cover" />
                </button>
              ))}
            </div>
            {items.length === 0 && <p className="py-8 text-center text-sm text-slate-400">Chưa có ảnh nào.</p>}
          </div>
        </div>
      )}
    </div>
  )
}
