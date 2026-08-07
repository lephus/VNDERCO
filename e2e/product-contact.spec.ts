import { expect, test, type Page } from '@playwright/test'
import { prisma } from '@/lib/db'

const CONTACT = { phone: '0987654321', email: 'kinhdoanh@vnderco.vn' }
// Giá trị seed mặc định (prisma/seed.ts) — spec này đổi cài đặt liên hệ dùng chung
// cho mọi spec khác nên phải khôi phục lại đúng giá trị này sau khi chạy, cùng lý
// do và cùng cách làm với e2e/change-password.spec.ts (mật khẩu) và e2e/theme.spec.ts
// (bảng màu): SiteSetting là bản ghi đơn dùng chung toàn site.
const ORIGINAL = { phone: '0900000000', email: 'lienhe@vnderco.vn' }

const login = async (page: Page) => {
  await page.goto('/admin/login')
  await page.getByLabel('Email').fill('admin@app.com')
  await page.getByLabel('Mật khẩu').fill('Admin@6868')
  await page.getByRole('button', { name: 'Đăng nhập' }).click()
  // Đợi điều hướng đăng nhập hoàn tất trước khi goto trang khác — nếu không, goto()
  // huỷ ngang request đăng nhập đang chạy dở trước khi cookie phiên kịp được set
  // (cùng lý do login.spec.ts, change-password.spec.ts và theme.spec.ts đều làm).
  await expect(page).toHaveURL(/\/admin$/)
}

const setContact = async (page: Page, contact: { phone: string; email: string }) => {
  await page.goto('/admin/cai-dat')
  if (page.url().includes('/admin/login')) {
    await login(page)
    await page.goto('/admin/cai-dat')
  }
  // Nhãn thật trên form (app/admin/(dashboard)/cai-dat/form.tsx) là "Điện thoại",
  // không phải "Số điện thoại".
  await page.getByLabel('Điện thoại').fill(contact.phone)
  await page.getByLabel('Email liên hệ').fill(contact.email)
  await page.getByRole('button', { name: 'Lưu' }).click()
  await expect(page.getByText('Đã lưu cài đặt')).toBeVisible()
}

test.afterEach(async ({ page }) => {
  const current = await prisma.siteSetting.findUnique({ where: { id: 1 } })
  if (current?.contactPhone === ORIGINAL.phone && current?.contactEmail === ORIGINAL.email) return

  await setContact(page, ORIGINAL)

  // getSiteSettings() được bọc unstable_cache (tag 'settings'); revalidateTag chỉ đánh
  // dấu cache cũ hết hạn chứ không tính lại ngay. Load lại một trang công khai hiển thị
  // số điện thoại (footer) để ép tính lại NGAY TRONG tiến trình hiện tại trước khi tiến
  // trình này (dev server sống suốt cả lượt chạy vì playwright.config.ts ghim workers: 1)
  // sống sót sang spec/lượt chạy kế tiếp — cùng lý do với hook khôi phục màu ở theme.spec.ts.
  await page.goto('/')
  await expect(page.locator('footer')).toContainText(ORIGINAL.phone)
})

test.afterAll(async () => {
  await prisma.$disconnect()
})

test('nút liên hệ trên trang sản phẩm dùng đúng số và email trong cài đặt', async ({ page }) => {
  await login(page)

  // Đặt thông tin liên hệ
  await setContact(page, CONTACT)

  // Tạo sản phẩm đã xuất bản
  await page.goto('/admin/san-pham/moi')
  await page.getByLabel('Tên sản phẩm').fill('Máy lọc không khí X1')
  await page.getByLabel('Trạng thái').selectOption('PUBLISHED')
  await page.getByRole('button', { name: 'Lưu' }).click()
  await expect(page).toHaveURL(/\/admin\/san-pham$/)

  await page.goto('/san-pham/may-loc-khong-khi-x1')

  // ContactButtons render hai lần trên trang chi tiết (bản thường trong cột thông tin,
  // ẩn trên mobile, và bản sticky dính đáy màn hình, chỉ hiện trên mobile) — cùng
  // component, chỉ khác prop `sticky`. Cả hai bản đều khớp locator nên phải lấy
  // `.first()` để tránh Playwright báo strict-mode violation vì có 2 phần tử khớp.
  await expect(page.getByRole('link', { name: /Gọi/ }).first())
    .toHaveAttribute('href', `tel:${CONTACT.phone}`)

  const mailto = await page.getByRole('link', { name: /email/i }).first().getAttribute('href')
  expect(mailto).toContain(`mailto:${CONTACT.email}`)
  expect(decodeURIComponent(mailto!)).toContain('Hỏi về sản phẩm Máy lọc không khí X1')
})
