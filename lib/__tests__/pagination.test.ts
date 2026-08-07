import { describe, expect, it } from 'vitest'
import { parsePageParam } from '@/lib/pagination'

describe('parsePageParam', () => {
  it('thiếu tham số thì về trang 1', () => {
    expect(parsePageParam(undefined)).toBe(1)
  })

  it('chuỗi rỗng thì về trang 1', () => {
    expect(parsePageParam('')).toBe(1)
  })

  it('không phải số thì về trang 1', () => {
    expect(parsePageParam('abc')).toBe(1)
  })

  it('0 thì về trang 1', () => {
    expect(parsePageParam('0')).toBe(1)
  })

  it('số âm thì về trang 1', () => {
    expect(parsePageParam('-1')).toBe(1)
  })

  it('giữ nguyên số nguyên hợp lệ', () => {
    expect(parsePageParam('1')).toBe(1)
    expect(parsePageParam('2')).toBe(2)
  })

  it('số thập phân bị cắt xuống số nguyên thay vì lọt xuống Prisma skip', () => {
    expect(parsePageParam('1.5')).toBe(1)
    expect(parsePageParam('2.3')).toBe(2)
  })

  it('số trang vượt quá dữ liệu vẫn là một số nguyên hợp lệ (việc kẹp về trang cuối do phía gọi xử lý)', () => {
    expect(parsePageParam('999999')).toBe(999999)
  })

  it('mảng (query bị lặp, ví dụ ?trang=1&trang=2) thì về trang 1 — có chủ đích, không phải ngẫu nhiên', () => {
    expect(parsePageParam(['1', '2'])).toBe(1)
  })
})
