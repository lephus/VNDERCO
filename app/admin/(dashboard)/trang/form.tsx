'use client'

import { useState } from 'react'
import type { Page } from '@prisma/client'
import { createPageAction, updatePageAction } from '@/lib/actions/page'
import { useActionForm } from '@/components/admin/useActionForm'
import { FieldError } from '@/components/admin/FieldError'
import { SlugField } from '@/components/admin/SlugField'
import { RichTextEditor } from '@/components/admin/RichTextEditor'
import { buttonClass } from '@/lib/ui/button'

export function PageForm({ page }: { page?: Page }) {
  const [title, setTitle] = useState(page?.title ?? '')
  const action = page ? updatePageAction : createPageAction
  const { pending, submit, fieldError, state } = useActionForm(action, { redirectTo: '/admin/trang' })

  return (
    <form onSubmit={submit} className="grid grid-cols-3 gap-6">
      {page && <input type="hidden" name="id" value={page.id} />}

      <div className="col-span-2 space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-700">Tiêu đề</label>
          <input id="title" name="title" value={title} onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-lg" />
          <FieldError errors={fieldError('title')} />
        </div>

        <SlugField titleValue={title} defaultValue={page?.slug ?? ''} errors={fieldError('slug')} />

        <div>
          <span className="block text-sm font-medium text-slate-700">Nội dung</span>
          <div className="mt-1"><RichTextEditor name="content" defaultValue={page?.content ?? ''} /></div>
          <FieldError errors={fieldError('content')} />
        </div>
      </div>

      <aside className="space-y-4">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-slate-700">Trạng thái</label>
          <select id="status" name="status" defaultValue={page?.status ?? 'DRAFT'}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
            <option value="DRAFT">Nháp</option>
            <option value="PUBLISHED">Xuất bản</option>
          </select>
        </div>

        <details className="rounded-lg border border-slate-200 p-3">
          <summary className="cursor-pointer text-sm font-medium text-slate-700">SEO</summary>
          <div className="mt-3 space-y-3">
            <div>
              <label htmlFor="seoTitle" className="block text-sm text-slate-600">Tiêu đề SEO</label>
              <input id="seoTitle" name="seoTitle" defaultValue={page?.seoTitle ?? ''}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
            </div>
            <div>
              <label htmlFor="seoDescription" className="block text-sm text-slate-600">Mô tả SEO</label>
              <textarea id="seoDescription" name="seoDescription" rows={3} defaultValue={page?.seoDescription ?? ''}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
            </div>
          </div>
        </details>

        {state && !state.ok && state.formError && <p role="alert" className="text-sm text-red-600">{state.formError}</p>}

        <button type="submit" disabled={pending}
          className={buttonClass({ size: 'md', shape: 'rounded', className: 'w-full' })}>
          {pending ? 'Đang lưu…' : 'Lưu'}
        </button>
      </aside>
    </form>
  )
}
