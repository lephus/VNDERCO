import { beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

const revalidateTag = vi.fn()
const requireAdmin = vi.fn()

vi.mock('next/cache', () => ({ revalidateTag }))
vi.mock('@/lib/auth', () => ({ requireAdmin }))

const { createAction } = await import('@/lib/actions/helper')

const schema = z.object({ name: z.string().min(1, 'Tên không được để trống') })

beforeEach(() => {
  revalidateTag.mockClear()
  requireAdmin.mockReset().mockResolvedValue({ id: 'u1', email: 'a@b.c', usingDefaultPassword: false })
})

describe('createAction', () => {
  it('chặn khi chưa đăng nhập và không đụng tới handler', async () => {
    requireAdmin.mockRejectedValue(new Error('UNAUTHORIZED'))
    const handler = vi.fn()
    const action = createAction({ schema, handler, tags: () => ['posts'] })

    const result = await action({ name: 'x' })

    expect(result).toEqual({ ok: false, formError: 'Bạn cần đăng nhập lại.' })
    expect(handler).not.toHaveBeenCalled()
    expect(revalidateTag).not.toHaveBeenCalled()
  })

  it('trả lỗi theo từng trường khi dữ liệu sai và không ghi gì', async () => {
    const handler = vi.fn()
    const action = createAction({ schema, handler, tags: () => ['posts'] })

    const result = await action({ name: '' })

    expect(result.ok).toBe(false)
    expect((result as { fieldErrors: Record<string, string[]> }).fieldErrors.name)
      .toContain('Tên không được để trống')
    expect(handler).not.toHaveBeenCalled()
    expect(revalidateTag).not.toHaveBeenCalled()
  })

  it('nhận được FormData chứ không chỉ object', async () => {
    const handler = vi.fn().mockResolvedValue({ id: '1' })
    const action = createAction({ schema, handler, tags: () => [] })

    const fd = new FormData()
    fd.set('name', 'Danh mục A')
    const result = await action(fd)

    expect(result).toEqual({ ok: true, data: { id: '1' } })
    expect(handler).toHaveBeenCalledWith({ name: 'Danh mục A' })
  })

  it('revalidate đúng các tag sau khi ghi thành công', async () => {
    const handler = vi.fn().mockResolvedValue({ slug: 'tin-moi' })
    const action = createAction({
      schema,
      handler,
      tags: (_input, result) => ['posts', `post:${result.slug}`],
    })

    await action({ name: 'Tin mới' })

    expect(revalidateTag).toHaveBeenCalledWith('posts')
    expect(revalidateTag).toHaveBeenCalledWith('post:tin-moi')
  })

  it('biến lỗi trùng khoá của Prisma thành thông báo tiếng Việt', async () => {
    const handler = vi.fn().mockRejectedValue(Object.assign(new Error('dup'), { code: 'P2002' }))
    const action = createAction({ schema, handler, tags: () => [] })

    const result = await action({ name: 'Trùng' })

    expect(result).toEqual({ ok: false, formError: 'Dữ liệu đã tồn tại (slug hoặc email bị trùng).' })
    expect(revalidateTag).not.toHaveBeenCalled()
  })
})
