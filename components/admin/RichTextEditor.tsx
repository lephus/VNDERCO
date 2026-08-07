'use client'

import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Youtube from '@tiptap/extension-youtube'
import { useState } from 'react'
import { MediaPicker } from './MediaPicker'

export function RichTextEditor({ name, defaultValue = '' }: { name: string; defaultValue?: string }) {
  const [html, setHtml] = useState(defaultValue)

  const editor = useEditor({
    immediatelyRender: false,          // bắt buộc với SSR của Next.js, thiếu sẽ lỗi hydration
    extensions: [
      // StarterKit tự kèm sẵn extension `link` — tắt để dùng cấu hình Link
      // riêng bên dưới, tránh cảnh báo "Duplicate extension names" của Tiptap.
      StarterKit.configure({ link: false }),
      Link.configure({ openOnClick: false }),
      Image,
      Youtube.configure({ nocookie: true }),
    ],
    content: defaultValue,
    onUpdate: ({ editor }) => setHtml(editor.getHTML()),
    editorProps: {
      attributes: { class: 'prose max-w-none min-h-64 p-4 focus:outline-none' },
    },
  })

  if (!editor) return <div className="h-64 rounded-lg border border-slate-300 bg-slate-50" />

  const btn = (active: boolean) =>
    `rounded px-2 py-1 text-sm ${active ? 'bg-primary-100 text-primary-700' : 'text-slate-600 hover:bg-slate-100'}`

  return (
    <div>
      <input type="hidden" name={name} value={html} />
      <div className="rounded-lg border border-slate-300">
        <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 p-2">
          <button type="button" className={btn(editor.isActive('heading', { level: 2 }))}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
          <button type="button" className={btn(editor.isActive('heading', { level: 3 }))}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</button>
          <button type="button" className={btn(editor.isActive('bold'))}
            onClick={() => editor.chain().focus().toggleBold().run()}><strong>B</strong></button>
          <button type="button" className={btn(editor.isActive('italic'))}
            onClick={() => editor.chain().focus().toggleItalic().run()}><em>I</em></button>
          <button type="button" className={btn(editor.isActive('bulletList'))}
            onClick={() => editor.chain().focus().toggleBulletList().run()}>• Danh sách</button>
          <button type="button" className={btn(editor.isActive('blockquote'))}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}>❝ Trích dẫn</button>
          <button type="button" className={btn(editor.isActive('link'))}
            onClick={() => {
              const url = window.prompt('Nhập đường dẫn (để trống để gỡ liên kết):', editor.getAttributes('link').href ?? '')
              if (url === null) return
              if (url === '') return void editor.chain().focus().unsetLink().run()
              editor.chain().focus().setLink({ href: url }).run()
            }}>Liên kết</button>
          <button type="button" className={btn(false)}
            onClick={() => {
              const url = window.prompt('Dán đường dẫn video YouTube:')
              if (url) editor.chain().focus().setYoutubeVideo({ src: url }).run()
            }}>YouTube</button>
        </div>
        <EditorContent editor={editor} />
      </div>
      <div className="mt-2">
        <MediaPicker
          label="Chèn ảnh vào bài"
          value={null}
          onChange={(url) => { if (url) editor.chain().focus().setImage({ src: url }).run() }}
        />
      </div>
    </div>
  )
}
