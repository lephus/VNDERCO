'use client'

import { useState } from 'react'
import type { Banner } from '@prisma/client'
import { createBannerAction, updateBannerAction } from '@/lib/actions/banner'
import { useActionForm } from '@/components/admin/useActionForm'
import { FieldError } from '@/components/admin/FieldError'
import { MediaPicker } from '@/components/admin/MediaPicker'

export function BannerForm({ banner }: { banner?: Banner }) {
  const [image, setImage] = useState<string | null>(banner?.imageUrl ?? null)
  const action = banner ? updateBannerAction : createBannerAction
  const { pending, submit, fieldError, state } = useActionForm(action, { redirectTo: '/admin/banner' })

  return (
    <form onSubmit={submit} className="max-w-xl space-y-4">
      {banner && <input type="hidden" name="id" value={banner.id} />}
      <input type="hidden" name="imageUrl" value={image ?? ''} />

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-slate-700">Tiêu đề</label>
        <input id="title" name="title" defaultValue={banner?.title ?? ''}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
        <FieldError errors={fieldError('title')} />
      </div>

      <div>
        <label htmlFor="subtitle" className="block text-sm font-medium text-slate-700">Phụ đề</label>
        <input id="subtitle" name="subtitle" defaultValue={banner?.subtitle ?? ''}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
        <FieldError errors={fieldError('subtitle')} />
      </div>

      <MediaPicker label="Ảnh banner" value={image} onChange={setImage} />
      <FieldError errors={fieldError('imageUrl')} />

      <div>
        <label htmlFor="imageAlt" className="block text-sm font-medium text-slate-700">Mô tả ảnh</label>
        <input id="imageAlt" name="imageAlt" defaultValue={banner?.imageAlt ?? ''}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="ctaLabel" className="block text-sm font-medium text-slate-700">Nhãn nút</label>
          <input id="ctaLabel" name="ctaLabel" placeholder="Xem sản phẩm" defaultValue={banner?.ctaLabel ?? ''}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
          <FieldError errors={fieldError('ctaLabel')} />
        </div>
        <div>
          <label htmlFor="ctaHref" className="block text-sm font-medium text-slate-700">Link nút</label>
          <input id="ctaHref" name="ctaHref" placeholder="/san-pham" defaultValue={banner?.ctaHref ?? ''}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
          <FieldError errors={fieldError('ctaHref')} />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div>
          <label htmlFor="order" className="block text-sm font-medium text-slate-700">Thứ tự</label>
          <input id="order" name="order" type="number" min={0} defaultValue={banner?.order ?? 0}
            className="mt-1 w-24 rounded-lg border border-slate-300 px-3 py-2" />
        </div>
        <label className="mt-5 flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" name="active" defaultChecked={banner?.active ?? true} />
          Đang hiển thị
        </label>
      </div>

      {state && !state.ok && state.formError && <p role="alert" className="text-sm text-red-600">{state.formError}</p>}

      <button type="submit" disabled={pending}
        className="rounded-lg bg-primary-600 px-5 py-2 font-semibold text-primary-fg disabled:opacity-60">
        {pending ? 'Đang lưu…' : 'Lưu'}
      </button>
    </form>
  )
}
