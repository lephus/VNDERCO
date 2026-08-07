import { defineConfig } from 'vitest/config'
import path from 'node:path'

// Config riêng cho test chạm CSDL thật (prisma/__tests__). Tách khỏi
// vitest.config.ts để `npm test` (chạy trên DB dev) không bao giờ nạp các
// test này — chỉ `npm run test:db` (chạy dưới `dotenv -e .env.test`) mới
// thấy và chạy chúng.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['prisma/__tests__/**/*.test.ts'],
    exclude: ['node_modules', '.next'],
  },
  resolve: { alias: { '@': path.resolve(__dirname) } },
})
