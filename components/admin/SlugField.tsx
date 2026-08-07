'use client'

import { useState } from 'react'
import { slugify } from '@/lib/slug'
import { FieldError } from './FieldError'

export function SlugField({
  name = 'slug', titleValue, defaultValue = '', errors,
}: { name?: string; titleValue: string; defaultValue?: string; errors?: string[] }) {
  const [touched, setTouched] = useState(Boolean(defaultValue))
  const [value, setValue] = useState(defaultValue)
  const shown = touched ? value : slugify(titleValue || '')

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-slate-700">Đường dẫn (slug)</label>
      <input
        id={name} name={name} value={shown}
        onChange={(e) => { setTouched(true); setValue(e.target.value) }}
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm"
      />
      <FieldError errors={errors} />
    </div>
  )
}
