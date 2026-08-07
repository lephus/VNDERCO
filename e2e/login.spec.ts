import { expect, test } from '@playwright/test'

test('từ chối sai mật khẩu', async ({ page }) => {
  await page.goto('/admin/login')
  await page.getByLabel('Email').fill('admin@app.com')
  await page.getByLabel('Mật khẩu').fill('sai-mat-khau')
  await page.getByRole('button', { name: 'Đăng nhập' }).click()
  await expect(page.getByText('Email hoặc mật khẩu không đúng')).toBeVisible()
  await expect(page).toHaveURL(/\/admin\/login/)
})

test('đăng nhập bằng tài khoản seed rồi vào được admin', async ({ page }) => {
  await page.goto('/admin/login')
  await page.getByLabel('Email').fill('admin@app.com')
  await page.getByLabel('Mật khẩu').fill('Admin@6868')
  await page.getByRole('button', { name: 'Đăng nhập' }).click()
  await expect(page).toHaveURL(/\/admin$/)
})

test('chưa đăng nhập thì bị đá về trang login', async ({ page }) => {
  await page.goto('/admin')
  await expect(page).toHaveURL(/\/admin\/login/)
})
