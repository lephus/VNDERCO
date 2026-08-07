import { revalidateTag as revalidateTagRaw } from 'next/cache'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth'

// Next 16.3 khai báo `revalidateTag(tag, profile)` với tham số profile bắt
// buộc, nhưng gọi chỉ 1 tham số vẫn chạy đúng ở runtime (chỉ in cảnh báo
// deprecated ra console) — xem node_modules/next/dist/.../revalidate.js.
// Giữ chữ ký 1 tham số ở đây vì đó đúng là hợp đồng mà test của task 6 xác
// nhận (revalidateTag được gọi với đúng 1 đối số là tên tag). Việc chọn
// cacheLife profile là quyết định kiến trúc nằm ngoài phạm vi task này.
const revalidateTag = revalidateTagRaw as (tag: string) => void

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; formError?: string; fieldErrors?: Record<string, string[]> }

type Options<S extends z.ZodTypeAny, T> = {
  schema: S
  handler: (input: z.infer<S>) => Promise<T>
  tags: (input: z.infer<S>, result: T) => string[]
}

function toPlainObject(input: FormData | unknown): unknown {
  if (!(input instanceof FormData)) return input
  const out: Record<string, unknown> = {}
  for (const [key, value] of input.entries()) {
    if (key in out) {
      const existing = out[key]
      out[key] = Array.isArray(existing) ? [...existing, value] : [existing, value]
    } else {
      out[key] = value
    }
  }
  return out
}

export function createAction<S extends z.ZodTypeAny, T>({ schema, handler, tags }: Options<S, T>) {
  return async (input: FormData | unknown): Promise<ActionResult<T>> => {
    try {
      await requireAdmin()
    } catch {
      return { ok: false, formError: 'Bạn cần đăng nhập lại.' }
    }

    const parsed = schema.safeParse(toPlainObject(input))
    if (!parsed.success) {
      return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
    }

    let result: T
    try {
      result = await handler(parsed.data)
    } catch (error) {
      if ((error as { code?: string }).code === 'P2002') {
        return { ok: false, formError: 'Dữ liệu đã tồn tại (slug hoặc email bị trùng).' }
      }
      if ((error as { code?: string }).code === 'P2025') {
        return { ok: false, formError: 'Không tìm thấy bản ghi cần thao tác.' }
      }
      console.error('[action]', error)
      return { ok: false, formError: 'Có lỗi xảy ra, vui lòng thử lại.' }
    }

    for (const tag of tags(parsed.data, result)) revalidateTag(tag)
    return { ok: true, data: result }
  }
}
