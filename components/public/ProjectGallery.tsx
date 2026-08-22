'use client'

import Image from 'next/image'
import { useCallback, useEffect, useMemo, useState } from 'react'

export type Project = {
  title: string
  kind: string
  place: string
  area: string
  year: number
  imageUrl: string
}

/**
 * Lưới công trình có lọc theo loại hình và xem ảnh lớn.
 *
 * Lọc bằng cách GIỮ NGUYÊN thẻ trong DOM và đổi opacity/scale chứ không tháo ra
 * lắp lại: tháo ra thì trình duyệt vẽ lại cả lưới, ảnh chớp trắng một nhịp vì
 * phải giải mã lại. Giữ nguyên thì chỉ có một phép chuyển màu, mượt và không tốn
 * thêm lượt tải ảnh nào.
 *
 * Thẻ bị lọc ra vẫn nằm đó nhưng `hidden` — không chiếm chỗ trong lưới, không
 * nhận tab, không bị trình đọc màn hình đọc.
 */
export function ProjectGallery({ projects }: { projects: Project[] }) {
  const kinds = useMemo(
    () => ['Tất cả', ...Array.from(new Set(projects.map((p) => p.kind)))],
    [projects],
  )
  const [active, setActive] = useState('Tất cả')
  const [lightbox, setLightbox] = useState<Project | null>(null)

  const close = useCallback(() => setLightbox(null), [])

  useEffect(() => {
    if (!lightbox) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    document.addEventListener('keydown', onKey)
    // Khoá cuộn nền khi ảnh lớn đang mở, không thì cuộn chuột lại kéo trang phía sau.
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [lightbox, close])

  return (
    <>
      <div className="mb-[30px] flex flex-wrap justify-center gap-2">
        {kinds.map((kind) => {
          const on = kind === active
          return (
            <button
              key={kind}
              type="button"
              onClick={() => setActive(kind)}
              aria-pressed={on}
              className={`h-9 rounded-full px-4 text-[14.4px] font-bold transition-all duration-300 ease-out ${
                on
                  ? 'bg-primary-600 text-primary-fg shadow-sm'
                  : 'border border-primary-600/30 text-primary-600 hover:bg-primary-50'
              }`}
            >
              {kind}
            </button>
          )
        })}
      </div>

      <div className="-mx-[15px] flex flex-wrap">
        {projects.map((project, i) => {
          const visible = active === 'Tất cả' || project.kind === active
          return (
            <div
              key={project.title}
              className={`w-full px-[15px] pb-[30px] tile:w-1/2 nav:w-1/3 ${visible ? '' : 'hidden'}`}
            >
              <button
                type="button"
                onClick={() => setLightbox(project)}
                style={{ transitionDelay: `${Math.min(i, 6) * 40}ms` }}
                className="group block w-full text-left transition-all duration-500 ease-out hover:-translate-y-1"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-primary-50">
                  <Image
                    src={project.imageUrl}
                    alt={project.title}
                    fill
                    sizes="(max-width: 550px) 100vw, (max-width: 850px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                  {/* Lớp phủ chỉ hiện khi rê chuột — để ảnh ở trạng thái thường
                      được nhìn nguyên vẹn, không bị chữ đè lên. */}
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/75 via-black/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    <span className="p-4 text-[14.4px] font-bold text-white">Xem ảnh lớn</span>
                  </div>
                  <span className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[12px] font-bold text-primary-700">
                    {project.kind}
                  </span>
                </div>
                <h3 className="mt-4 text-[16.56px]/[21.528px] font-bold text-primary-600 transition-colors duration-200 group-hover:text-black">
                  {project.title}
                </h3>
                <p className="mt-1 text-[14.4px]/[23.04px] text-black/70">
                  {project.place} · {project.area} · {project.year}
                </p>
              </button>
            </div>
          )
        })}
      </div>

      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={lightbox.title}
          onClick={close}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 motion-safe:animate-[vnd-fade_220ms_ease-out]"
        >
          <div className="relative max-h-full w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <div className="relative aspect-[4/3] w-full">
              <Image src={lightbox.imageUrl} alt={lightbox.title} fill sizes="90vw" className="object-contain" />
            </div>
            <div className="mt-3 text-center text-white">
              <p className="text-[18px] font-bold">{lightbox.title}</p>
              <p className="mt-1 text-[14.4px] text-white/75">
                {lightbox.kind} · {lightbox.place} · {lightbox.area} · {lightbox.year}
              </p>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Đóng"
              className="absolute -top-2 right-0 flex size-10 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/30"
            >
              <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="size-5">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
