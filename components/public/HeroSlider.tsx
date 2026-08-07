'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { Banner } from '@prisma/client'

export function HeroSlider({ banners, fallbackTitle }: { banners: Banner[]; fallbackTitle: string }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (banners.length < 2) return
    const timer = setInterval(() => setIndex((i) => (i + 1) % banners.length), 6000)
    return () => clearInterval(timer)
  }, [banners.length])

  const gradient = {
    backgroundImage: 'linear-gradient(125deg, var(--vnd-gradient-from), var(--vnd-gradient-via), var(--vnd-gradient-to))',
    color: 'var(--vnd-primary-fg)',
  }

  if (banners.length === 0) {
    return (
      <section style={gradient} className="px-4 py-24 text-center">
        <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">
          {fallbackTitle || 'Giải pháp cho doanh nghiệp Việt'}
        </h1>
      </section>
    )
  }

  const banner = banners[index]

  return (
    <section style={gradient} className="relative overflow-hidden">
      {banner.imageUrl && (
        <Image src={banner.imageUrl} alt={banner.imageAlt ?? ''} fill priority
          className="absolute inset-0 object-cover opacity-25" />
      )}
      <div className="relative mx-auto max-w-6xl px-4 py-24">
        <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">{banner.title}</h1>
        {banner.subtitle && <p className="mt-4 max-w-xl text-lg opacity-90">{banner.subtitle}</p>}
        {banner.ctaHref && banner.ctaLabel && (
          <Link href={banner.ctaHref}
            className="mt-8 inline-block rounded-full bg-white px-6 py-3 font-semibold text-slate-900 shadow-lg">
            {banner.ctaLabel}
          </Link>
        )}
        {banners.length > 1 && (
          <div className="mt-8 flex gap-2">
            {banners.map((b, i) => (
              <button key={b.id} type="button" onClick={() => setIndex(i)}
                aria-label={`Chuyển tới banner ${i + 1}`} aria-current={i === index}
                className={`h-2 rounded-full transition-all ${i === index ? 'w-8 bg-white' : 'w-2 bg-white/50'}`} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
