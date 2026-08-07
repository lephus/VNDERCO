// Trích ra từ ContentListPage để có thể unit-test độc lập (component đó là server
// component, khó test trực tiếp). `?trang=` trên URL công khai có thể là chuỗi, mảng
// (khi query bị lặp: ?trang=1&trang=2) hoặc thiếu hẳn — tất cả các trường hợp không
// suy ra được một số nguyên >= 1 hợp lệ đều phải rơi về trang 1, KHÔNG được để lọt số
// thập phân xuống Prisma `skip` (kiểu Int, ném PrismaClientValidationError nếu nhận
// giá trị không nguyên, ví dụ ?trang=2.3 → skip = 15.599999999999998).
export function parsePageParam(value: string | string[] | undefined): number {
  return Math.max(1, Math.floor(Number(value)) || 1)
}
