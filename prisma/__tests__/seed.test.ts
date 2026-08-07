import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { seed } from '@/prisma/seed'

describe('seed', () => {
  beforeAll(async () => {
    await prisma.productImage.deleteMany()
    await prisma.product.deleteMany()
    await prisma.post.deleteMany()
    await prisma.category.deleteMany()
    await prisma.siteSetting.deleteMany()
    await prisma.user.deleteMany()
  })

  afterAll(async () => { await prisma.$disconnect() })

  it('tạo tài khoản admin với mật khẩu đã băm và cờ mật khẩu mặc định', async () => {
    await seed()
    const admin = await prisma.user.findUnique({ where: { email: 'admin@app.com' } })
    expect(admin).not.toBeNull()
    expect(admin!.passwordHash).not.toBe('Admin@6868')
    expect(await bcrypt.compare('Admin@6868', admin!.passwordHash)).toBe(true)
    expect(admin!.usingDefaultPassword).toBe(true)
    expect(admin!.role).toBe('ADMIN')
  })

  it('tạo bản ghi SiteSetting đơn với bảng màu violet', async () => {
    const settings = await prisma.siteSetting.findUnique({ where: { id: 1 } })
    expect(settings?.presetKey).toBe('violet')
    expect(settings?.themeMode).toBe('PRESET')
  })

  it('tạo danh mục mẫu cho cả tin tức lẫn sản phẩm', async () => {
    expect(await prisma.category.count({ where: { type: 'NEWS' } })).toBeGreaterThan(0)
    expect(await prisma.category.count({ where: { type: 'PRODUCT' } })).toBeGreaterThan(0)
  })

  it('chạy lần hai không lỗi và không nhân đôi dữ liệu', async () => {
    const before = await prisma.category.count()
    await expect(seed()).resolves.not.toThrow()
    expect(await prisma.user.count()).toBe(1)
    expect(await prisma.siteSetting.count()).toBe(1)
    expect(await prisma.category.count()).toBe(before)
  })
})
