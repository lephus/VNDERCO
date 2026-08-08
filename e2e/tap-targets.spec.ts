import { expect, test, type Page } from '@playwright/test'

test.use({ viewport: { width: 390, height: 844 } })

// WCAG 2.5.8 (mức AA) yêu cầu vùng bấm tối thiểu 24×24 CSS px. Đo bằng máy vì
// nhìn mắt thường một cái chấm nhỏ vẫn thấy "bấm được", cho tới lúc thử bằng
// ngón tay thật.
const MIN_TARGET = 24

const login = async (page: Page) => {
  await page.goto('/admin/login')
  await page.getByLabel('Email').fill('admin@app.com')
  await page.getByLabel('Mật khẩu').fill('Admin@6868')
  await page.getByRole('button', { name: 'Đăng nhập' }).click()
  await expect(page).toHaveURL(/\/admin$/)
}

test('link chân trang đủ cao để bấm', async ({ page }) => {
  await page.goto('/')
  const links = page.locator('footer a')
  const count = await links.count()
  expect(count).toBeGreaterThan(0)

  for (let i = 0; i < count; i++) {
    const box = (await links.nth(i).boundingBox())!
    expect(box.height, `link chân trang thứ ${i + 1} cao ${box.height}px`).toBeGreaterThanOrEqual(MIN_TARGET)
  }
})

test('cụm nút liên hệ dính đáy nằm gọn một dòng, không tràn màn hình', async ({ page }) => {
  // Database test không có sẵn sản phẩm nào (prisma/seed.ts chỉ tạo tài khoản,
  // cài đặt và danh mục), nên spec tự dựng lấy sản phẩm của mình qua đúng giao
  // diện admin — cùng cách product-contact.spec.ts đang làm.
  await login(page)
  await page.goto('/admin/san-pham/moi')
  await page.getByLabel('Tên sản phẩm').fill('Máy nén khí kiểm thử vùng chạm')
  await page.getByLabel('Trạng thái').selectOption('PUBLISHED')
  await page.getByRole('button', { name: 'Lưu' }).click()
  await expect(page).toHaveURL(/\/admin\/san-pham$/)

  await page.goto('/san-pham/may-nen-khi-kiem-thu-vung-cham')

  const bar = page.locator('div.fixed.inset-x-0.bottom-0')
  await expect(bar).toBeVisible()

  const barBox = (await bar.boundingBox())!
  // Một hàng nút cao khoảng 48px cộng đệm 24px. Chữ mà xuống dòng thì chiều cao
  // vọt lên thấy rõ — đó đúng là lỗi đã gặp ("Gửi / email", "Nhắn / Zalo").
  expect(barBox.height, `thanh liên hệ cao ${barBox.height}px, có vẻ chữ bị xuống dòng`).toBeLessThan(90)
  expect(barBox.width).toBeLessThanOrEqual(390)

  // Nút Zalo chỉ hiện khi cài đặt có zaloUrl, mà seed để trống, nên chỉ kiểm
  // hai nút luôn có mặt.
  for (const name of [/Gọi/, /email/i]) {
    const box = (await bar.getByRole('link', { name }).boundingBox())!
    expect(box.height, `nút ${name} cao ${box.height}px`).toBeLessThan(56)
    expect(box.height).toBeGreaterThanOrEqual(MIN_TARGET)
  }
})

test('trang danh sách không nhảy cấp tiêu đề h1 sang h3', async ({ page }) => {
  for (const path of ['/tin-tuc', '/san-pham']) {
    await page.goto(path)
    const levels = await page.evaluate(
      `Array.from(document.querySelectorAll('h1,h2,h3,h4')).map((h) => Number(h.tagName[1]))`,
    ) as number[]

    expect(levels[0], `${path} phải bắt đầu bằng h1`).toBe(1)
    for (let i = 1; i < levels.length; i++) {
      expect(levels[i] - levels[i - 1], `${path} nhảy từ h${levels[i - 1]} sang h${levels[i]}`)
        .toBeLessThanOrEqual(1)
    }
  }
})
