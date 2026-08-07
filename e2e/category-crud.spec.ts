import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/admin/login')
  await page.getByLabel('Email').fill('admin@app.com')
  await page.getByLabel('Mật khẩu').fill('Admin@6868')
  await page.getByRole('button', { name: 'Đăng nhập' }).click()
  await expect(page).toHaveURL(/\/admin$/)
})

test('tạo, sửa, xoá một danh mục tin tức', async ({ page }) => {
  await page.goto('/admin/danh-muc/moi')
  await page.getByLabel('Tên danh mục').fill('Chuyển đổi số')
  await expect(page.getByLabel('Đường dẫn (slug)')).toHaveValue('chuyen-doi-so')
  await page.getByLabel('Loại').selectOption('NEWS')
  await page.getByRole('button', { name: 'Lưu' }).click()

  await expect(page).toHaveURL(/\/admin\/danh-muc$/)
  await expect(page.getByText('Chuyển đổi số')).toBeVisible()

  await page.getByRole('link', { name: 'Chuyển đổi số' }).click()
  await page.getByLabel('Tên danh mục').fill('Chuyển đổi số 2026')
  await page.getByRole('button', { name: 'Lưu' }).click()
  await expect(page.getByText('Chuyển đổi số 2026')).toBeVisible()

  page.on('dialog', (d) => d.accept())
  await page.getByRole('row', { name: /Chuyển đổi số 2026/ }).getByRole('button', { name: 'Xoá' }).click()
  await expect(page.getByText('Chuyển đổi số 2026')).toHaveCount(0)
})

test('báo lỗi ngay dưới ô nhập khi bỏ trống tên', async ({ page }) => {
  await page.goto('/admin/danh-muc/moi')
  await page.getByLabel('Tên danh mục').fill('   ')
  await page.getByRole('button', { name: 'Lưu' }).click()
  await expect(page.getByText('Tên danh mục không được để trống')).toBeVisible()
  await expect(page).toHaveURL(/\/admin\/danh-muc\/moi$/)
})
