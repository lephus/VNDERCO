import { describe, expect, it } from 'vitest'
import { assertTestDatabase } from '@/scripts/assert-test-db'

describe('assertTestDatabase', () => {
  it('từ chối khi DATABASE_URL không được thiết lập (undefined)', () => {
    const result = assertTestDatabase(undefined)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toMatch(/thiếu|trống/)
  })

  it('từ chối khi DATABASE_URL là chuỗi rỗng', () => {
    const result = assertTestDatabase('')
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toMatch(/thiếu|trống/)
  })

  it('cho phép khi host là localhost và database là vnderco_test', () => {
    const result = assertTestDatabase('postgresql://vnderco:vnderco@localhost:5433/vnderco_test')
    expect(result).toEqual({ ok: true, database: 'vnderco_test' })
  })

  it('cho phép khi host là 127.0.0.1 và database là vnderco_test', () => {
    const result = assertTestDatabase('postgresql://vnderco:vnderco@127.0.0.1:5433/vnderco_test')
    expect(result).toEqual({ ok: true, database: 'vnderco_test' })
  })

  it('từ chối database development (tên khác vnderco_test) dù host là localhost', () => {
    const result = assertTestDatabase('postgresql://vnderco:vnderco@localhost:5433/vnderco')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.reason).toMatch(/database|tên/i)
      expect(result.reason).not.toMatch(/host|cục bộ/i)
    }
  })

  it('từ chối URL kiểu Supabase kết thúc bằng /postgres', () => {
    const result = assertTestDatabase('postgresql://postgres:pw@db.abcxyzproj.supabase.co:5432/postgres')
    expect(result.ok).toBe(false)
  })

  it('từ chối host từ xa dù tên database đúng là vnderco_test, và lý do phải khác với lý do sai tên database', () => {
    const remoteHostResult = assertTestDatabase('postgresql://vnderco:vnderco@db.example.com:5432/vnderco_test')
    const wrongDbNameResult = assertTestDatabase('postgresql://vnderco:vnderco@localhost:5433/vnderco')

    expect(remoteHostResult.ok).toBe(false)
    expect(wrongDbNameResult.ok).toBe(false)
    if (!remoteHostResult.ok && !wrongDbNameResult.ok) {
      expect(remoteHostResult.reason).not.toBe(wrongDbNameResult.reason)
      expect(remoteHostResult.reason).toMatch(/host|cục bộ/i)
    }
  })

  it('từ chối chuỗi không phải URL hợp lệ mà không ném lỗi (not-a-url)', () => {
    expect(() => assertTestDatabase('not-a-url')).not.toThrow()
    const result = assertTestDatabase('not-a-url')
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toMatch(/URL|hợp lệ/i)
  })

  it('từ chối khi URL chứa từ khoá cloud dù host và tên database vượt qua các kiểm tra khác (belt-and-braces)', () => {
    const result = assertTestDatabase('postgresql://vnderco:vnderco@localhost:5433/vnderco_test?options=enable-pooler')
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toMatch(/pooler|cloud/i)
  })
})
