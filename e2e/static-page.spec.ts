import { expect, test } from '@playwright/test'
import { prisma } from '@/lib/db'

// Trang thử nghiệm dùng slug cố định (suy ra từ tiêu đề 'Giới thiệu' qua slugify()) để test
// có thể khẳng định đúng URL /gioi-thieu. Test tạo trang này qua giao diện admin nên phải tự
// dọn lại qua CHÍNH giao diện đó (deletePageAction) — không xoá thẳng bằng Prisma — vì
// getPageBySlug được bọc unstable_cache theo tag (lib/queries/pages.ts) và chỉ revalidateTag
// bên trong action mới dọn đúng cache của tiến trình dev server sống suốt lượt chạy suite
// (playwright.config.ts ghim workers: 1, reuseExistingServer khi chạy local) — cùng lý do đã
// giải thích trong e2e/publish-flow.spec.ts.
const TITLE = 'Giới thiệu'
const SLUG = 'gioi-thieu'

test.afterEach(async ({ page }) => {
  const existing = await prisma.page.findUnique({ where: { slug: SLUG } })
  if (!existing) return

  await page.goto('/admin/trang')
  if (page.url().includes('/admin/login')) {
    await page.getByLabel('Email').fill('admin@app.com')
    await page.getByLabel('Mật khẩu').fill('Admin@6868')
    await page.getByRole('button', { name: 'Đăng nhập' }).click()
    await expect(page).toHaveURL(/\/admin$/)
    await page.goto('/admin/trang')
  }

  page.on('dialog', (d) => d.accept())
  await page.getByRole('row', { name: new RegExp(TITLE) }).getByRole('button', { name: 'Xoá' }).click()
  await expect(page.getByText(TITLE)).toHaveCount(0)

  // deletePageAction chỉ đánh dấu cache cũ hết hạn (revalidateTag), không tính lại ngay —
  // ép tính lại NGAY TRONG tiến trình hiện tại để lần chạy suite kế tiếp không đọc nhầm
  // bản ghi vừa xoá (xem chú thích tương tự trong e2e/publish-flow.spec.ts).
  await page.goto(`/${SLUG}`)
})

test.afterAll(async () => {
  await prisma.$disconnect()
})

test('trang tĩnh đã xuất bản hiện đúng nội dung, giữ header của site', async ({ page }) => {
  await page.goto('/admin/login')
  await page.getByLabel('Email').fill('admin@app.com')
  await page.getByLabel('Mật khẩu').fill('Admin@6868')
  await page.getByRole('button', { name: 'Đăng nhập' }).click()
  // Đợi điều hướng đăng nhập hoàn tất trước khi goto trang khác — nếu không, goto() huỷ
  // ngang request đăng nhập đang chạy dở trước khi cookie phiên kịp được set (cùng lý do
  // publish-flow.spec.ts, login.spec.ts, change-password.spec.ts và theme.spec.ts đều chờ
  // URL đổi trước khi đi tiếp).
  await expect(page).toHaveURL(/\/admin$/)

  await page.goto('/admin/trang/moi')
  // exact: true — nếu không, "Tiêu đề" khớp cả nhãn "Tiêu đề SEO" (chứa nó như một chuỗi
  // con) và Playwright báo strict-mode violation, giống cách publish-flow.spec.ts và
  // change-password.spec.ts đã xử lý với những nhãn lồng nhau tương tự.
  await page.getByLabel('Tiêu đề', { exact: true }).fill(TITLE)
  await page.locator('.ProseMirror').fill('VNDERCO thành lập năm 2015.')
  await page.getByLabel('Trạng thái').selectOption('PUBLISHED')
  await page.getByRole('button', { name: 'Lưu' }).click()
  // Chờ điều hướng sau khi lưu hoàn tất trước khi goto('/gioi-thieu') — nếu không, goto()
  // huỷ ngang request tạo trang đang chạy dở, khiến trang chưa kịp được ghi (và
  // revalidateTag chưa kịp chạy) khi ta đã sang trang công khai kiểm tra.
  await expect(page).toHaveURL(/\/admin\/trang$/)

  await page.goto('/gioi-thieu')
  await expect(page.getByRole('heading', { name: 'Giới thiệu', level: 1 })).toBeVisible()
  await expect(page.getByText('VNDERCO thành lập năm 2015')).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Điều hướng chính' })).toBeVisible()
})
