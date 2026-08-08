'use client'

import { useState } from 'react'
import type { Category } from '@prisma/client'
import { createCategoryAction, updateCategoryAction } from '@/lib/actions/category'
import { useActionForm } from '@/components/admin/useActionForm'
import { FieldError } from '@/components/admin/FieldError'
import { SlugField } from '@/components/admin/SlugField'
import { buttonClass } from '@/lib/ui/button'

export function CategoryForm({ category }: { category?: Category }) {
  const [name, setName] = useState(category?.name ?? '')
  const action = category ? updateCategoryAction : createCategoryAction
  const { pending, submit, fieldError, state } = useActionForm(action, { redirectTo: '/admin/danh-muc' })

  return (
    <form onSubmit={submit} className="max-w-lg space-y-4">
      {category && <input type="hidden" name="id" value={category.id} />}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700">Tên danh mục</label>
        <input id="name" name="name" value={name} onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
        <FieldError errors={fieldError('name')} />
      </div>

      <SlugField titleValue={name} defaultValue={category?.slug ?? ''} errors={fieldError('slug')} />

      <div>
        <label htmlFor="type" className="block text-sm font-medium text-slate-700">Loại</label>
        <select id="type" name="type" defaultValue={category?.type ?? 'NEWS'}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
          <option value="NEWS">Tin tức</option>
          <option value="PRODUCT">Sản phẩm</option>
        </select>
        <FieldError errors={fieldError('type')} />
      </div>

      <div>
        <label htmlFor="order" className="block text-sm font-medium text-slate-700">Thứ tự</label>
        <input id="order" name="order" type="number" min={0} defaultValue={category?.order ?? 0}
          className="mt-1 w-32 rounded-lg border border-slate-300 px-3 py-2" />
        <FieldError errors={fieldError('order')} />
      </div>

      {state && !state.ok && state.formError && <p role="alert" className="text-sm text-red-600">{state.formError}</p>}

      <button type="submit" disabled={pending}
        className={buttonClass({ size: 'md', shape: 'rounded' })}>
        {pending ? 'Đang lưu…' : 'Lưu'}
      </button>
    </form>
  )
}
