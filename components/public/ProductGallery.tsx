'use client'

import Image from 'next/image'
import { useState } from 'react'
import type { ProductImage } from '@prisma/client'

export function ProductGallery({ images, name }: { images: ProductImage[]; name: string }) {
  const [active, setActive] = useState(0)

  if (images.length === 0) {
    return <div className="aspect-4/3 rounded-2xl bg-primary-50" aria-hidden />
  }

  return (
    <div>
      <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-primary-50">
        <Image src={images[active].url} alt={images[active].alt ?? name} fill priority className="object-cover" />
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2">
          {images.map((image, index) => (
            <button key={image.id} type="button" onClick={() => setActive(index)}
              aria-label={`Xem ảnh ${index + 1}`} aria-current={index === active}
              className={`relative h-16 w-20 overflow-hidden rounded-lg border-2 ${
                index === active ? 'border-primary-600' : 'border-transparent'
              }`}>
              <Image src={image.url} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
