import { expect, test } from '@playwright/test'

test('slug không tồn tại trả 404 mang giao diện site', async ({ page }) => {
  const response = await page.goto('/khong-co-trang-nay')
  expect(response!.status()).toBe(404)
  await expect(page.getByText('Không tìm thấy')).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Điều hướng chính' })).toBeVisible()
})
