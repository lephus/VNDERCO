'use client'

import Image from 'next/image'
import { useState } from 'react'
import { MediaPicker } from './MediaPicker'

type GalleryImage = { url: string; alt: string }

export function GalleryEditor({ name, defaultValue = [] }: { name: string; defaultValue?: GalleryImage[] }) {
  const [images, setImages] = useState<GalleryImage[]>(defaultValue)

  const move = (index: number, delta: number) => {
    const target = index + delta
    if (target < 0 || target >= images.length) return
    const next = [...images]
    ;[next[index], next[target]] = [next[target], next[index]]
    setImages(next)
  }

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(images)} />
      <span className="block text-sm font-medium text-slate-700">Ảnh sản phẩm</span>
      <p className="text-xs text-slate-500">Ảnh đầu tiên được dùng làm ảnh đại diện ở trang danh sách.</p>

      <ul className="mt-2 space-y-2">
        {images.map((img, index) => (
          <li key={`${img.url}-${index}`} className="flex items-center gap-3 rounded-lg border border-slate-200 p-2">
            <Image src={img.url} alt="" width={80} height={56} className="h-14 w-20 rounded object-cover" />
            <input aria-label={`Mô tả ảnh ${index + 1}`} value={img.alt} placeholder="Mô tả ảnh (alt)"
              onChange={(e) => setImages(images.map((v, i) => (i === index ? { ...v, alt: e.target.value } : v)))}
              className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm" />
            <button type="button" onClick={() => move(index, -1)} className="px-1 text-slate-500" aria-label="Lên">↑</button>
            <button type="button" onClick={() => move(index, 1)} className="px-1 text-slate-500" aria-label="Xuống">↓</button>
            <button type="button" onClick={() => setImages(images.filter((_, i) => i !== index))}
              className="px-2 text-sm text-red-600">Xoá</button>
          </li>
        ))}
      </ul>

      <div className="mt-2">
        <MediaPicker label="Thêm ảnh" value={null}
          onChange={(url) => { if (url) setImages([...images, { url, alt: '' }]) }} />
      </div>
    </div>
  )
}
