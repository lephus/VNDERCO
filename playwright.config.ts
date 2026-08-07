import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  // Tất cả spec dùng chung một database Postgres (vnderco_test) và một tài
  // khoản admin đã seed. change-password.spec.ts tự dọn lại mật khẩu về mặc
  // định sau khi chạy (xem afterEach ở đó) nên thứ tự chạy không còn quyết
  // định spec nào pass/fail — nhưng nếu hai spec chạy CÙNG LÚC ở hai worker
  // khác nhau, vẫn có khoảng hở giữa lúc mật khẩu bị đổi và lúc hook dọn lại
  // xong, nơi một spec khác có thể đăng nhập bằng Admin@6868 và thất bại vì
  // trùng thời điểm. Ghim workers: 1 để loại bỏ hẳn khoảng hở race đó — với
  // 6 test hiện tại (và sẽ còn thêm ở các task sau), độ xác định quan trọng
  // hơn tốc độ. fullyParallel mặc định đã là false (test trong cùng 1 file
  // chạy tuần tự); khai báo tường minh ở đây để không ai bật lại nhầm.
  fullyParallel: false,
  workers: 1,
  use: { baseURL: 'http://localhost:3000' },
  webServer: {
    command: 'dotenv -e .env.test -- npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
