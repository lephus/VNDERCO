'use client'

import { useState } from 'react'
import type { Category, Post } from '@prisma/client'
import { createPostAction, updatePostAction } from '@/lib/actions/post'
import { useActionForm } from '@/components/admin/useActionForm'
import { FieldError } from '@/components/admin/FieldError'
import { SlugField } from '@/components/admin/SlugField'
import { MediaPicker } from '@/components/admin/MediaPicker'
import { RichTextEditor } from '@/components/admin/RichTextEditor'

export function PostForm({ post, categories }: { post?: Post; categories: Category[] }) {
  const [title, setTitle] = useState(post?.title ?? '')
  const [cover, setCover] = useState<string | null>(post?.coverImageUrl ?? null)
  const action = post ? updatePostAction : createPostAction
  const { pending, submit, fieldError, state } = useActionForm(action, { redirectTo: '/admin/tin-tuc' })

  return (
    <form onSubmit={submit} className="grid grid-cols-3 gap-6">
      {post && <input type="hidden" name="id" value={post.id} />}
      <input type="hidden" name="coverImageUrl" value={cover ?? ''} />

      <div className="col-span-2 space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-700">Tiêu đề</label>
          <input id="title" name="title" value={title} onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-lg" />
          <FieldError errors={fieldError('title')} />
        </div>

        <SlugField titleValue={title} defaultValue={post?.slug ?? ''} errors={fieldError('slug')} />

        <div>
          <label htmlFor="excerpt" className="block text-sm font-medium text-slate-700">Tóm tắt</label>
          <textarea id="excerpt" name="excerpt" rows={2} defaultValue={post?.excerpt ?? ''}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
          <FieldError errors={fieldError('excerpt')} />
        </div>

        <div>
          <span className="block text-sm font-medium text-slate-700">Nội dung</span>
          <div className="mt-1"><RichTextEditor name="content" defaultValue={post?.content ?? ''} /></div>
          <FieldError errors={fieldError('content')} />
        </div>
      </div>

      <aside className="space-y-4">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-slate-700">Trạng thái</label>
          <select id="status" name="status" defaultValue={post?.status ?? 'DRAFT'}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
            <option value="DRAFT">Nháp</option>
            <option value="PUBLISHED">Xuất bản</option>
          </select>
        </div>

        <div>
          <label htmlFor="categoryId" className="block text-sm font-medium text-slate-700">Danh mục</label>
          <select id="categoryId" name="categoryId" defaultValue={post?.categoryId ?? ''}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
            <option value="">— Chưa phân loại —</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" name="featured" defaultChecked={post?.featured ?? false} />
          Bài nổi bật (hiện ở trang chủ)
        </label>

        <MediaPicker label="Ảnh bìa" value={cover} onChange={setCover} />
        <div>
          <label htmlFor="coverImageAlt" className="block text-sm font-medium text-slate-700">Mô tả ảnh bìa</label>
          <input id="coverImageAlt" name="coverImageAlt" defaultValue={post?.coverImageAlt ?? ''}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
        </div>

        <details className="rounded-lg border border-slate-200 p-3">
          <summary className="cursor-pointer text-sm font-medium text-slate-700">SEO</summary>
          <div className="mt-3 space-y-3">
            <div>
              <label htmlFor="seoTitle" className="block text-sm text-slate-600">Tiêu đề SEO</label>
              <input id="seoTitle" name="seoTitle" defaultValue={post?.seoTitle ?? ''}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
            </div>
            <div>
              <label htmlFor="seoDescription" className="block text-sm text-slate-600">Mô tả SEO</label>
              <textarea id="seoDescription" name="seoDescription" rows={3} defaultValue={post?.seoDescription ?? ''}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
            </div>
          </div>
        </details>

        {state && !state.ok && state.formError && <p role="alert" className="text-sm text-red-600">{state.formError}</p>}

        <button type="submit" disabled={pending}
          className="w-full rounded-lg bg-primary-600 px-5 py-2 font-semibold text-primary-fg disabled:opacity-60">
          {pending ? 'Đang lưu…' : 'Lưu'}
        </button>
      </aside>
    </form>
  )
}
