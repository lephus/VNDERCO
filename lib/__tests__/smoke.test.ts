import { describe, expect, it } from 'vitest'

describe('hạ tầng kiểm thử', () => {
  it('chạy được test và resolve alias @', async () => {
    const mod = await import('@/lib/env-marker')
    expect(mod.MARKER).toBe('vnderco')
  })
})
