// Hằng số ràng buộc upload dùng chung cho cả client lẫn server. File này KHÔNG
// được import bất cứ thứ gì (đặc biệt là '@supabase/supabase-js' hay biến môi
// trường bí mật) — nếu nó có import, những thứ đó sẽ đi theo vào bundle của
// mọi client component import file này, kể cả khi bundler tree-shake được.
export const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
export const MAX_SIZE_BYTES = 5 * 1024 * 1024
