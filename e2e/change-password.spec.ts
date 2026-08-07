import { expect, test } from '@playwright/test'

const login = async (page: import('@playwright/test').Page, password: string) => {
  await page.goto('/admin/login')
  await page.getByLabel('Email').fill('admin@app.com')
  await page.getByLabel('Mật khẩu').fill(password)
  await page.getByRole('button', { name: 'Đăng nhập' }).click()
}

// Next.js App Router luôn gắn thêm một <p role="alert" id="__next-route-announcer__">
// để công bố tiêu đề trang cho trình đọc màn hình sau mỗi lần chuyển trang phía
// client (node_modules/next/dist/esm/client/route-announcer.js), và phần tử này
// tồn tại song song với dải cảnh báo của chúng ta sau khi đăng nhập/đăng xuất.
// Lọc theo nội dung để tránh Playwright báo strict-mode violation khi trang có
// nhiều hơn một phần tử role="alert".
const defaultPasswordAlert = (page: import('@playwright/test').Page) =>
  page.getByRole('alert').filter({ hasText: 'mật khẩu mặc định' })

test('hiện cảnh báo khi còn dùng mật khẩu mặc định, mất đi sau khi đổi', async ({ page }) => {
  await login(page, 'Admin@6868')
  await expect(defaultPasswordAlert(page)).toContainText('mật khẩu mặc định')

  await page.goto('/admin/doi-mat-khau')
  await page.getByLabel('Mật khẩu hiện tại').fill('Admin@6868')
  // exact: true — nếu không, "Mật khẩu mới" khớp cả nhãn "Nhập lại mật khẩu mới"
  // (chứa nó như một chuỗi con) và Playwright báo strict-mode violation.
  await page.getByLabel('Mật khẩu mới', { exact: true }).fill('Vnderco@2026')
  await page.getByLabel('Nhập lại mật khẩu mới').fill('Vnderco@2026')
  await page.getByRole('button', { name: 'Đổi mật khẩu' }).click()

  // Đổi mật khẩu xong là bị đăng xuất, không ở lại trang admin
  await expect(page).toHaveURL(/\/admin\/login/)
  await expect(page.getByText('Đã đổi mật khẩu, vui lòng đăng nhập lại')).toBeVisible()

  // Đăng nhập lại bằng mật khẩu mới, cảnh báo phải biến mất
  await login(page, 'Vnderco@2026')
  await expect(defaultPasswordAlert(page)).toHaveCount(0)
})
