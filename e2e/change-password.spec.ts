import { expect, test } from '@playwright/test'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'

// Đây là spec DUY NHẤT thay đổi mật khẩu tài khoản admin đã seed. Mọi spec
// khác (login.spec.ts, category-crud.spec.ts, và các spec sẽ thêm ở các task
// sau) đăng nhập bằng mật khẩu mặc định Admin@6868 — nếu không dọn lại, spec
// nào chạy sau (thứ tự không đảm bảo khi Playwright chạy nhiều worker song
// song) sẽ đăng nhập thất bại. Khôi phục trực tiếp qua Prisma thay vì đi lại
// UI: một hook UI-driven sẽ tự thất bại nếu chính test ở trên đã fail giữa
// chừng (ví dụ vừa đổi xong mật khẩu thì assertion sau đó ném lỗi), còn ghi
// thẳng xuống DB luôn đưa được trạng thái về đúng bất kể test pass hay fail.
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@app.com'
const DEFAULT_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'Admin@6868'

const login = async (page: import('@playwright/test').Page, password: string) => {
  await page.goto('/admin/login')
  await page.getByLabel('Email').fill(ADMIN_EMAIL)
  await page.getByLabel('Mật khẩu').fill(password)
  await page.getByRole('button', { name: 'Đăng nhập' }).click()
}

test.afterEach(async () => {
  await prisma.user.update({
    where: { email: ADMIN_EMAIL },
    data: {
      passwordHash: await bcrypt.hash(DEFAULT_PASSWORD, 10),
      usingDefaultPassword: true,
    },
  })
})

test.afterAll(async () => {
  await prisma.$disconnect()
})

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
