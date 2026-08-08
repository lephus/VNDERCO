/**
 * Đọc danh sách cặp nhãn/giá trị do một editor phía client gửi lên dưới dạng
 * chuỗi JSON trong input ẩn (SpecsEditor). Dùng chung cho bảng thông số sản phẩm
 * và dải con số ở trang chủ — cùng một hình dạng dữ liệu, cùng một cách hỏng.
 *
 * JSON hỏng không được làm sập form, và JSON HỢP LỆ NHƯNG SAI KIỂU bên trong
 * (label là số, value là object…) cũng vậy: từng có lỗi ép kiểu bằng `as` rồi
 * gọi thẳng .trim(), ném TypeError chứ không phải ZodError nên lọt qua
 * safeParse() ở lib/actions/helper.ts và làm sập cả action. Vì thế kiểm `typeof`
 * thật trước khi coi một trường là chuỗi; dòng nào thiếu nhãn hoặc giá trị thì
 * bỏ hẳn dòng đó.
 */
export type LabelValue = { label: string; value: string }

export function parseJsonArray(raw: string): unknown[] {
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export type UnknownRecord = Record<string, unknown>
export const isRecord = (v: unknown): v is UnknownRecord =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

export function parseLabelValueRows(raw: string): LabelValue[] {
  const rows: LabelValue[] = []
  for (const item of parseJsonArray(raw)) {
    if (!isRecord(item)) continue
    const label = typeof item.label === 'string' ? item.label.trim() : ''
    const value = typeof item.value === 'string' ? item.value.trim() : ''
    if (label && value) rows.push({ label, value })
  }
  return rows
}
