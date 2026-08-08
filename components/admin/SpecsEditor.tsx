'use client'

import { useState } from 'react'

type Spec = { label: string; value: string }

// Nhận nhãn qua prop để dùng lại được cho cả bảng thông số sản phẩm lẫn dải con
// số ở trang chủ — cùng một hình dạng dữ liệu (cặp nhãn/giá trị), khác mỗi chữ
// hiển thị. Mặc định giữ nguyên như cũ nên các chỗ đang gọi không phải sửa gì.
export function SpecsEditor({
  name, defaultValue = [],
  legend = 'Thông số kỹ thuật',
  labelPlaceholder = 'Công suất',
  valuePlaceholder = '500W',
  labelName = 'Tên thông số',
  valueName = 'Giá trị thông số',
}: {
  name: string; defaultValue?: Spec[]
  legend?: string; labelPlaceholder?: string; valuePlaceholder?: string
  labelName?: string; valueName?: string
}) {
  const [rows, setRows] = useState<Spec[]>(defaultValue.length ? defaultValue : [{ label: '', value: '' }])

  const update = (index: number, patch: Partial<Spec>) =>
    setRows(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)))

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(rows)} />
      <span className="block text-sm font-medium text-slate-700">{legend}</span>
      <div className="mt-2 space-y-2">
        {rows.map((row, index) => (
          <div key={index} className="flex gap-2">
            <input aria-label={`${labelName} ${index + 1}`} value={row.label} placeholder={labelPlaceholder}
              onChange={(e) => update(index, { label: e.target.value })}
              className="w-1/3 rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <input aria-label={`${valueName} ${index + 1}`} value={row.value} placeholder={valuePlaceholder}
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
