import { expect, test } from '@playwright/test'

// Kích thước một chiếc điện thoại phổ thông. Dưới 640px (breakpoint `sm`) là
// nơi thanh nav ngang không còn đủ chỗ và phải nhường cho menu trượt.
test.use({ viewport: { width: 390, height: 844 } })

test('trên điện thoại có nút mở menu, thanh nav ngang bị ẩn đi', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('button', { name: 'Mở menu' })).toBeVisible()
  // Thanh nav ngang vẫn nằm trong DOM (chỉ ẩn bằng CSS), nên phải hỏi đúng cái
  // <nav> có aria-label, không phải hỏi chung chung theo tên link — link cùng
  // tên còn nằm trong panel menu nữa.
  await expect(page.getByRole('navigation', { name: 'Điều hướng chính' })).toBeHidden()
})

test('mở menu, bấm một mục thì chuyển trang và menu tự đóng', async ({ page }) => {
  await page.goto('/')
  const panel = page.getByRole('dialog', { name: 'Menu' })

  await expect(panel).toBeHidden()
  await page.getByRole('button', { name: 'Mở menu' }).click()
  await expect(panel).toBeVisible()

  await panel.getByRole('link', { name: 'Sản phẩm' }).click()
  await expect(page).toHaveURL(/\/san-pham$/)
  // Đây là cái dễ quên nhất: chuyển trang xong menu phải tự đóng, không thì nó
  // nằm che luôn trang vừa mở.
  await expect(panel).toBeHidden()
})

test('panel menu phủ hết chiều cao màn hình, không bị nhốt trong header', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Mở menu' }).click()
  const panel = page.getByRole('dialog', { name: 'Menu' })
  await expect(panel).toBeVisible()

  // Đây là bài học từ một lỗi thật: <header> có backdrop-blur, mà backdrop-filter
  // biến phần tử thành containing block cho con cháu `position: fixed`. Menu vì
  // thế bị nhốt trong khung header cao 68px, trong khi ba test kia vẫn xanh vì
  // chúng chỉ hỏi ẩn/hiện. Phải đo hình học thì mới bắt được.
  const box = (await panel.boundingBox())!
  const viewport = page.viewportSize()!
  expect(box.height).toBeGreaterThan(viewport.height * 0.9)
  expect(box.y).toBeLessThan(4)
  expect(Math.round(box.x + box.width)).toBe(viewport.width)
})

test('phím Esc đóng được menu', async ({ page }) => {
  await page.goto('/')
  const panel = page.getByRole('dialog', { name: 'Menu' })

  await page.getByRole('button', { name: 'Mở menu' }).click()
  await expect(panel).toBeVisible()

  await page.keyboard.press('Escape')
  await expect(panel).toBeHidden()
})

test('không trang công khai nào bị cuộn ngang trên điện thoại', async ({ page }) => {
  for (const path of ['/', '/tin-tuc', '/san-pham', '/gioi-thieu']) {
    await page.goto(path)
    const overflows = await page.evaluate(() =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)
    expect(overflows, `${path} bị cuộn ngang`).toBe(false)
  }
})
