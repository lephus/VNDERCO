'use client'

import { useState } from 'react'
import type { Category, Product, ProductImage } from '@prisma/client'
import { createProductAction, updateProductAction } from '@/lib/actions/product'
import { useActionForm } from '@/components/admin/useActionForm'
import { FieldError } from '@/components/admin/FieldError'
import { SlugField } from '@/components/admin/SlugField'
import { RichTextEditor } from '@/components/admin/RichTextEditor'
import { SpecsEditor } from '@/components/admin/SpecsEditor'
import { GalleryEditor } from '@/components/admin/GalleryEditor'
import { buttonClass } from '@/lib/ui/button'

type ProductWithImages = Product & { images: ProductImage[] }

export function ProductForm({ product, categories }: { product?: ProductWithImages; categories: Category[] }) {
  const [name, setName] = useState(product?.name ?? '')
  const action = product ? updateProductAction : createProductAction
  const { pending, submit, fieldError, state } = useActionForm(action, { redirectTo: '/admin/san-pham' })

  return (
    <form onSubmit={submit} className="grid grid-cols-3 gap-6">
      {product && <input type="hidden" name="id" value={product.id} />}

      <div className="col-span-2 space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700">Tên sản phẩm</label>
          <input id="name" name="name" value={name} onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-lg" />
          <FieldError errors={fieldError('name')} />
        </div>

        <SlugField titleValue={name} defaultValue={product?.slug ?? ''} errors={fieldError('slug')} />

        <div>
          <label htmlFor="summary" className="block text-sm font-medium text-slate-700">Tóm tắt</label>
          <textarea id="summary" name="summary" rows={2} defaultValue={product?.summary ?? ''}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
          <FieldError errors={fieldError('summary')} />
        </div>

        <div>
          <span className="block text-sm font-medium text-slate-700">Mô tả</span>
          <div className="mt-1"><RichTextEditor name="description" defaultValue={product?.description ?? ''} /></div>
        </div>

        <SpecsEditor name="specs" defaultValue={(product?.specs as { label: string; value: string }[]) ?? []} />
        <GalleryEditor name="images"
          defaultValue={product?.images.map((i) => ({ url: i.url, alt: i.alt ?? '' })) ?? []} />
      </div>

      <aside className="space-y-4">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-slate-700">Trạng thái</label>
          <select id="status" name="status" defaultValue={product?.status ?? 'DRAFT'}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
            <option value="DRAFT">Nháp</option>
            <option value="PUBLISHED">Xuất bản</option>
          </select>
        </div>

        <div>
          <label htmlFor="categoryId" className="block text-sm font-medium text-slate-700">Danh mục</label>
          <select id="categoryId" name="categoryId" defaultValue={product?.categoryId ?? ''}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
            <option value="">— Chưa phân loại —</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" name="featured" defaultChecked={product?.featured ?? false} />
          Sản phẩm nổi bật
        </label>

        <div>
          <label htmlFor="order" className="block text-sm font-medium text-slate-700">Thứ tự</label>
          <input id="order" name="order" type="number" min={0} defaultValue={product?.order ?? 0}
            className="mt-1 w-32 rounded-lg border border-slate-300 px-3 py-2" />
        </div>

        <details className="rounded-lg border border-slate-200 p-3">
          <summary className="cursor-pointer text-sm font-medium text-slate-700">SEO</summary>
          <div className="mt-3 space-y-3">
            <input name="seoTitle" placeholder="Tiêu đề SEO" aria-label="Tiêu đề SEO" defaultValue={product?.seoTitle ?? ''}
              className="w-full rounded-lg border border-slate-300 px-3 py-2" />
            <textarea name="seoDescription" rows={3} placeholder="Mô tả SEO" aria-label="Mô tả SEO"
              defaultValue={product?.seoDescription ?? ''} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
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
