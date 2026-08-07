/**
 * Bảo vệ chống chạy nhầm lệnh xoá database (`prisma db push --force-reset`)
 * lên một database không phải database test cục bộ.
 *
 * Script này là bước ĐẦU TIÊN của `npm run test:e2e:reset` (xem package.json),
 * chạy dưới cùng môi trường dotenv (.env.test) mà lệnh reset sẽ dùng, để bắt
 * được cả trường hợp thiếu `.env.test` lẫn trường hợp có DATABASE_URL cũ còn
 * export sẵn trong shell.
 */

const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1'])
const REQUIRED_DATABASE = 'vnderco_test'
const FORBIDDEN_KEYWORDS = ['supabase', 'neon', 'amazonaws', 'render.com', 'pooler']

export type AssertTestDatabaseResult =
  | { ok: true; database: string }
  | { ok: false; reason: string; host?: string; database?: string }

/** Hàm thuần (pure function): chỉ quyết định đúng/sai, không in gì, không thoát tiến trình. */
export function assertTestDatabase(url: string | undefined): AssertTestDatabaseResult {
  if (!url) {
    return {
      ok: false,
      reason: 'DATABASE_URL đang bị thiếu hoặc rỗng — không thể xác nhận đây là database test cục bộ.',
    }
  }

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return {
      ok: false,
      reason: 'DATABASE_URL không phải là một URL hợp lệ, không thể phân tích host và tên database.',
    }
  }

  const host = parsed.hostname.toLowerCase()
  const database = parsed.pathname.replace(/^\//, '')

  if (!LOOPBACK_HOSTS.has(host)) {
    return {
      ok: false,
      reason: `Host "${host}" không phải là host cục bộ (chỉ chấp nhận localhost hoặc 127.0.0.1).`,
      host,
      database,
    }
  }

  if (database !== REQUIRED_DATABASE) {
    return {
      ok: false,
      reason: `Tên database "${database}" không đúng bằng "${REQUIRED_DATABASE}".`,
      host,
      database,
    }
  }

  const lowerUrl = url.toLowerCase()
  const matchedKeyword = FORBIDDEN_KEYWORDS.find((keyword) => lowerUrl.includes(keyword))
  if (matchedKeyword) {
    return {
      ok: false,
      reason: `DATABASE_URL chứa từ khoá đáng ngờ "${matchedKeyword}" (dấu hiệu của một dịch vụ database trên cloud) — kiểm tra bảo vệ bổ sung này chặn lại dù host/tên database ở trên đã hợp lệ.`,
      host,
      database,
    }
  }

  return { ok: true, database }
}

function main(): void {
  const result = assertTestDatabase(process.env.DATABASE_URL)

  if (!result.ok) {
    console.error('==================================================')
    console.error('TỪ CHỐI: DATABASE_URL không phải database test cục bộ!')
    if (result.host) console.error(`Host phát hiện được: ${result.host}`)
    if (result.database) console.error(`Tên database phát hiện được: ${result.database}`)
    console.error(`Lý do từ chối: ${result.reason}`)
    console.error(
      'Lệnh "prisma db push --force-reset" sẽ XOÁ VĨNH VIỄN toàn bộ bảng trong database mà DATABASE_URL đang trỏ tới.',
    )
    console.error('(Không in DATABASE_URL đầy đủ ở đây vì nó chứa mật khẩu.)')
    console.error('Hãy kiểm tra lại file .env.test và các biến DATABASE_URL còn export sẵn trong shell.')
    console.error('==================================================')
    process.exit(1)
  }

  console.log(`OK: DATABASE_URL trỏ đúng database test cục bộ "${result.database}". Tiếp tục reset.`)
  process.exit(0)
}

// Cho phép chạy trực tiếp file này qua `tsx scripts/assert-test-db.ts`
if (process.argv[1]?.includes('assert-test-db')) {
  main()
}
