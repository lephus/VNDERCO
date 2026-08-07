import { revalidateTag } from 'next/cache'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth'

// `{ expire: 0 }` yêu cầu Next thanh lọc tag ngay lập tức cho cả các trang
// tĩnh lẫn động — đúng ngữ nghĩa "admin vừa lưu nội dung, trang công khai
// phải render lại ở lượt truy cập kế tiếp". Không dùng `updateTag`: hàm đó
// dành cho read-your-own-writes trong cùng một Server Action (người vừa ghi
// tự đọc lại), còn ở đây người đọc là khách công khai ở một request khác hẳn.

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

// `.safeParse()` chỉ bắt lỗi kiểu ZodError của chính zod — một `.transform()` ném
// lỗi khác (vd. TypeError khi gọi .trim() trên giá trị hoá ra không phải chuỗi) thoát
// thẳng ra ngoài .safeParse(), KHÔNG được bọc thành { success: false }. Bọc thêm một
// lớp try/catch ở đây để lỗi bất ngờ từ BẤT KỲ schema nào (hiện tại lẫn sau này) cũng
// hạ cánh mềm thành ActionResult thay vì làm sập cả Server Action.
function safeParse<S extends z.ZodTypeAny>(schema: S, data: unknown): z.ZodSafeParseResult<z.infer<S>> | null {
  try {
    return schema.safeParse(data)
  } catch (error) {
    console.error('[action:validate]', error)
    return null
  }
}

export function createAction<S extends z.ZodTypeAny, T>({ schema, handler, tags }: Options<S, T>) {
  return async (input: FormData | unknown): Promise<ActionResult<T>> => {
    try {
      await requireAdmin()
    } catch {
      return { ok: false, formError: 'Bạn cần đăng nhập lại.' }
    }

    const parsed = safeParse(schema, toPlainObject(input))
    if (!parsed) {
      return { ok: false, formError: 'Dữ liệu gửi lên không hợp lệ.' }
    }
    if (!parsed.success) {
      return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
    }

    let result: T
    try {
      result = await handler(parsed.data)
    } catch (error) {
      if ((error as { code?: string }).code === 'WRONG_PASSWORD') {
        return { ok: false, fieldErrors: { currentPassword: ['Mật khẩu hiện tại không đúng'] } }
      }
      if ((error as { code?: string }).code === 'P2002') {
        return { ok: false, formError: 'Dữ liệu đã tồn tại (slug hoặc email bị trùng).' }
      }
      if ((error as { code?: string }).code === 'P2025') {
        return { ok: false, formError: 'Không tìm thấy bản ghi cần thao tác.' }
      }
      console.error('[action]', error)
      return { ok: false, formError: 'Có lỗi xảy ra, vui lòng thử lại.' }
    }

    for (const tag of tags(parsed.data, result)) revalidateTag(tag, { expire: 0 })
    return { ok: true, data: result }
  }
}
