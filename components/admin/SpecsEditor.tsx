'use client'

import { useState } from 'react'

type Spec = { label: string; value: string }

export function SpecsEditor({ name, defaultValue = [] }: { name: string; defaultValue?: Spec[] }) {
  const [rows, setRows] = useState<Spec[]>(defaultValue.length ? defaultValue : [{ label: '', value: '' }])

  const update = (index: number, patch: Partial<Spec>) =>
    setRows(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)))

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(rows)} />
      <span className="block text-sm font-medium text-slate-700">Thông số kỹ thuật</span>
      <div className="mt-2 space-y-2">
        {rows.map((row, index) => (
          <div key={index} className="flex gap-2">
            <input aria-label={`Tên thông số ${index + 1}`} value={row.label} placeholder="Công suất"
              onChange={(e) => update(index, { label: e.target.value })}
              className="w-1/3 rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <input aria-label={`Giá trị thông số ${index + 1}`} value={row.value} placeholder="500W"
              onChange={(e) => update(index, { value: e.target.value })}
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <button type="button" onClick={() => setRows(rows.filter((_, i) => i !== index))}
              className="px-2 text-sm text-red-600">Xoá</button>
          </div>
        ))}
      </div>
      <button type="button" onClick={() => setRows([...rows, { label: '', value: '' }])}
        className="mt-2 rounded-lg border border-slate-300 px-3 py-1.5 text-sm">+ Thêm dòng</button>
      <p className="mt-1 text-xs text-slate-500">Dòng để trống nhãn hoặc giá trị sẽ tự bị bỏ qua khi lưu.</p>
    </div>
  )
}
