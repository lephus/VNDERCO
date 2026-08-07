import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error('Thiếu biến môi trường DATABASE_URL')
  // Supabase session pooler (cổng 5432, dùng cho `prisma db push`) giới hạn cứng
  // pool_size: 15 kết nối đồng thời. `next build` chạy nhiều worker song song
  // (mỗi worker là một tiến trình Node riêng, tự tạo PrismaClient/pool của mình
  // qua globalForPrisma ở trên) để prerender các route có đọc DB (/, /tin-tuc,
  // /san-pham, /sitemap.xml, /rss.xml, /opengraph-image...). Không giới hạn số
  // kết nối mỗi pool, tổng kết nối vượt 15 và Supabase trả lỗi (EMAXCONNSESSION)
  // "max clients reached in session mode". `pg.Pool` (mà PrismaPg bọc lại khi
  // nhận object thay vì chuỗi/instance có sẵn) nhận thẳng option `max` chuẩn của
  // node-postgres — set nhỏ để một tiến trình không bao giờ tự chiếm hết pool
  // phía Supabase, dù chạy build (nhiều worker) hay chạy production (nhiều
  // instance serverless, nơi bảng khuyến nghị dùng transaction pooler 6543).
  return new PrismaClient({ adapter: new PrismaPg({ connectionString, max: 3 }) })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
