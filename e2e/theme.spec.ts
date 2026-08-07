import { expect, test } from '@playwright/test'
import { prisma } from '@/lib/db'
import { DEFAULT_PRESET_KEY, PRESETS } from '@/lib/theme/presets'
import { buildPalette, paletteToCssVars } from '@/lib/theme/palette'

// Test thứ hai đổi bảng màu của site qua UI admin thật — SiteSetting dùng chung cho mọi
// spec khác (giống lý do change-password.spec.ts phải tự dọn lại mật khẩu). Khác với mật
// khẩu, getSiteSettings() được bọc unstable_cache (tag 'settings'); nếu khôi phục bằng
// cách ghi thẳng Prisma, dev server (sống suốt cả lượt chạy vì playwright.config.ts ghim
// workers: 1) vẫn tiếp tục phục vụ bản đã cache (màu vừa đổi) cho mọi trang công khai ở các
// spec chạy sau, dù DB đã đúng — chỉ updateSettingsAction (qua UI) mới gọi revalidateTag để
// dọn cache đó. Nên phải đi lại UI, không ghi thẳng DB.
test.afterEach(async ({ page }) => {
  const current = await prisma.siteSetting.findUnique({ where: { id: 1 } })
  if (current?.themeMode === 'PRESET' && current.presetKey === DEFAULT_PRESET_KEY) return

  await page.goto('/admin/cai-dat')
  if (page.url().includes('/admin/login')) {
    await page.getByLabel('Email').fill('admin@app.com')
    await page.getByLabel('Mật khẩu').fill('Admin@6868')
    await page.getByRole('button', { name: 'Đăng nhập' }).click()
    await expect(page).toHaveURL(/\/admin$/)
    await page.goto('/admin/cai-dat')
  }
  await page.getByRole('button', { name: PRESETS[DEFAULT_PRESET_KEY].name }).click()
  await page.getByRole('button', { name: 'Lưu' }).click()
  await expect(page.getByText('Đã lưu cài đặt')).toBeVisible()

  // revalidateTag chỉ đánh dấu cache cũ hết hạn, không tính lại ngay — nếu hook dừng ở đây,
  // bản ghi cache trên đĩa (.next/dev/cache/fetch-cache, sống sót qua cả việc tắt/bật lại
  // dev server) vẫn giữ giá trị MÀU VỪA ĐỔI cho tới lần đọc kế tiếp. Load lại trang chủ để
  // ép getSiteSettings() tính lại NGAY TRONG tiến trình hiện tại, ghi đúng màu tím mặc định
  // xuống cache trước khi tiến trình này (và có thể cả .next) sống sót sang lượt chạy suite
  // kế tiếp — nếu không, spec chạy sau (kể cả ở task khác) có thể đọc nhầm màu vừa đổi dù
  // DB đã đúng.
  await page.goto('/')
  const restoredPrimary = await page.evaluate(() =>
    getComputedStyle(document.querySelector('header')!).getPropertyValue('--vnd-primary-500').trim())
  const expectedPrimary = paletteToCssVars(buildPalette(PRESETS[DEFAULT_PRESET_KEY].primary))['--vnd-primary-500']
  expect(restoredPrimary).toBe(expectedPrimary)
})

test.afterAll(async () => {
  await prisma.$disconnect()
})

test('màu chủ đạo nằm sẵn trong HTML server trả về, không nạp sau', async ({ page }) => {
  const response = await page.goto('/')
  const html = await response!.text()
  expect(html).toContain('--vnd-primary-500')
})

test('đổi bảng màu trong admin thì trang công khai đổi theo', async ({ page }) => {
  const readPrimary = async () => {
    await page.goto('/')
    // Biến màu được nhúng qua `style` trên <div> gốc của layout công khai
    // (app/(public)/layout.tsx), không phải trên <html> — CSS custom property chỉ kế
    // thừa TỪ TRÊN XUỐNG nên getComputedStyle(document.documentElement) sẽ luôn đọc
    // giá trị dự phòng tĩnh khai trong globals.css :root (dùng cho các trang ngoài
    // route group (public), ví dụ app/not-found.tsx), bất kể site đã đổi màu hay chưa.
    // Đọc computed style của <header> (con của <div> đó, luôn có mặt trên mọi trang
    // công khai) để thấy đúng giá trị palette theo từng request.
    return page.evaluate(() =>
      getComputedStyle(document.querySelector('header')!).getPropertyValue('--vnd-primary-500').trim())
  }

  const before = await readPrimary()

  await page.goto('/admin/login')
  await page.getByLabel('Email').fill('admin@app.com')
  await page.getByLabel('Mật khẩu').fill('Admin@6868')
  await page.getByRole('button', { name: 'Đăng nhập' }).click()
  // Đợi điều hướng đăng nhập hoàn tất trước khi goto trang khác — nếu không, goto() huỷ
  // ngang request đăng nhập đang chạy dở trước khi cookie phiên kịp được set (cùng lý do
  // login.spec.ts và change-password.spec.ts đều chờ URL đổi trước khi đi tiếp).
  await expect(page).toHaveURL(/\/admin$/)

  await page.goto('/admin/cai-dat')
  await page.getByRole('button', { name: 'Xanh ngọc' }).click()
  await page.getByRole('button', { name: 'Lưu' }).click()
  await expect(page.getByText('Đã lưu cài đặt')).toBeVisible()

  const after = await readPrimary()
  expect(after).not.toBe(before)
  expect(after).not.toBe('')
})
