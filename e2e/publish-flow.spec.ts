import { expect, test } from '@playwright/test'
import { prisma } from '@/lib/db'

// Bài viết thử nghiệm dùng slug cố định (suy ra từ tiêu đề qua slugify()) để test có thể
// khẳng định đúng URL /tin-tuc/ban-tin-thu-nghiem-isr. Muốn chạy lại suite nhiều lần không
// cần reset database, afterEach phải xoá đúng bài này — và phải xoá QUA GIAO DIỆN ADMIN
// (deletePostAction), không ghi thẳng Prisma: getPostBySlug/getPublishedPosts được bọc
// unstable_cache theo tag (xem lib/queries/posts.ts), dev server sống suốt cả lượt chạy
// (playwright.config.ts ghim workers: 1, reuseExistingServer khi chạy local) nên chỉ có
// revalidateTag bên trong deletePostAction/updatePostAction mới dọn đúng cache của tiến
// trình server đang chạy — giống lý do change-password.spec.ts và theme.spec.ts đều dọn
// qua UI hoặc phải tính lại cache ngay trong hook thay vì ghi thẳng DB.
const TITLE = 'Bản tin thử nghiệm ISR'
const SLUG = 'ban-tin-thu-nghiem-isr'

test.afterEach(async ({ page }) => {
  const existing = await prisma.post.findUnique({ where: { slug: SLUG } })
  if (!existing) return

  await page.goto('/admin/tin-tuc')
  if (page.url().includes('/admin/login')) {
    await page.getByLabel('Email').fill('admin@app.com')
    await page.getByLabel('Mật khẩu').fill('Admin@6868')
    await page.getByRole('button', { name: 'Đăng nhập' }).click()
    await expect(page).toHaveURL(/\/admin$/)
    await page.goto('/admin/tin-tuc')
  }

  page.on('dialog', (d) => d.accept())
  await page.getByRole('row', { name: new RegExp(TITLE) }).getByRole('button', { name: 'Xoá' }).click()
  await expect(page.getByText(TITLE)).toHaveCount(0)

  // deletePostAction chỉ đánh dấu cache cũ hết hạn (revalidateTag), không tính lại ngay —
  // ép tính lại NGAY TRONG tiến trình hiện tại để lần chạy suite kế tiếp không đọc nhầm
  // bản ghi/slug vừa xoá (xem chú thích tương tự trong e2e/theme.spec.ts).
  await page.goto('/tin-tuc')
  await page.goto(`/tin-tuc/${SLUG}`)
})

test.afterAll(async () => {
  await prisma.$disconnect()
})

test('bài nháp không lộ ra ngoài, xuất bản xong thì hiện ngay', async ({ page }) => {
  await page.goto('/admin/login')
  await page.getByLabel('Email').fill('admin@app.com')
  await page.getByLabel('Mật khẩu').fill('Admin@6868')
  await page.getByRole('button', { name: 'Đăng nhập' }).click()
  // Đợi điều hướng đăng nhập hoàn tất trước khi goto trang khác — nếu không, goto() huỷ
  // ngang request đăng nhập đang chạy dở trước khi cookie phiên kịp được set (cùng lý do
  // login.spec.ts, change-password.spec.ts và theme.spec.ts đều chờ URL đổi trước khi đi tiếp).
  await expect(page).toHaveURL(/\/admin$/)

  // Lưu ở trạng thái nháp
  await page.goto('/admin/tin-tuc/moi')
  // exact: true — nếu không, "Tiêu đề" khớp cả nhãn "Tiêu đề SEO" (chứa nó như một chuỗi
  // con) và Playwright báo strict-mode violation, giống cách change-password.spec.ts đã
  // xử lý với "Mật khẩu mới" / "Nhập lại mật khẩu mới".
  await page.getByLabel('Tiêu đề', { exact: true }).fill(TITLE)
  await page.locator('.ProseMirror').fill('Nội dung bản tin thử nghiệm.')
  await page.getByLabel('Trạng thái').selectOption('DRAFT')
  await page.getByRole('button', { name: 'Lưu' }).click()
  await expect(page).toHaveURL(/\/admin\/tin-tuc$/)

  await page.goto('/tin-tuc')
  await expect(page.getByText(TITLE)).toHaveCount(0)
  await page.goto(`/tin-tuc/${SLUG}`)
  await expect(page.getByText('Không tìm thấy')).toBeVisible()

  // Chuyển sang xuất bản
  await page.goto('/admin/tin-tuc')
  await page.getByRole('link', { name: TITLE }).click()
  await page.getByLabel('Trạng thái').selectOption('PUBLISHED')
  await page.getByRole('button', { name: 'Lưu' }).click()
  // Cùng lý do với lần đăng nhập ở trên: chờ điều hướng sau khi lưu hoàn tất trước khi
  // goto('/tin-tuc') — nếu không, goto() huỷ ngang request cập nhật đang chạy dở, khiến
  // bài viết chưa kịp chuyển sang PUBLISHED (và revalidateTag chưa kịp chạy) khi ta đã
  // sang trang công khai kiểm tra.
  await expect(page).toHaveURL(/\/admin\/tin-tuc$/)

  // Trang tĩnh phải được làm mới ngay, không phải chờ hết 3600 giây
  await page.goto('/tin-tuc')
  await expect(page.getByText(TITLE)).toBeVisible()
  await page.goto(`/tin-tuc/${SLUG}`)
  await expect(page.getByRole('heading', { name: TITLE })).toBeVisible()
})
