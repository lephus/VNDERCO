import { describe, expect, it } from 'vitest'
import { assertUploadable, storageKey } from '@/lib/storage'
import { MAX_SIZE_BYTES } from '@/lib/upload-constraints'

describe('assertUploadable', () => {
  it('chấp nhận các định dạng ảnh cho phép', () => {
    for (const type of ['image/jpeg', 'image/png', 'image/webp', 'image/avif']) {
      expect(() => assertUploadable({ type, size: 1000 })).not.toThrow()
    }
  })

  it('từ chối định dạng khác kèm thông báo tiếng Việt', () => {
    expect(() => assertUploadable({ type: 'application/pdf', size: 1000 }))
      .toThrow('Chỉ nhận ảnh JPG, PNG, WEBP hoặc AVIF')
    expect(() => assertUploadable({ type: 'image/svg+xml', size: 1000 })).toThrow()
  })

  it('từ chối file quá 5MB', () => {
    expect(() => assertUploadable({ type: 'image/png', size: MAX_SIZE_BYTES + 1 }))
      .toThrow('Ảnh không được vượt quá 5MB')
    expect(() => assertUploadable({ type: 'image/png', size: MAX_SIZE_BYTES })).not.toThrow()
  })
})

// Không cần thông tin đăng nhập Supabase — hàm này chỉ biến đổi chuỗi, không
// gọi mạng. Bao phủ riêng vì đây là logic thuần có thể kiểm chứng ngay cả khi
// chưa có SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY.
describe('storageKey', () => {
  it('luôn có tiền tố vnderco/ và giữ đuôi mở rộng viết thường', () => {
    expect(storageKey('anh-bia.PNG')).toMatch(/^vnderco\/\d+-anh-bia\.png$/)
  })

  it('chuẩn hoá tên có dấu tiếng Việt và khoảng trắng thành slug an toàn', () => {
    expect(storageKey('Ảnh Bìa Công Ty.jpg')).toMatch(/^vnderco\/\d+-anh-bia-cong-ty\.jpg$/)
  })

  it('dùng đuôi bin khi tên file không có phần mở rộng', () => {
    expect(storageKey('avatar')).toMatch(/^vnderco\/\d+-avatar\.bin$/)
  })

  it('loại bỏ ký tự không phải chữ/số khỏi phần đuôi mở rộng', () => {
    expect(storageKey('logo.j@p!g')).toMatch(/^vnderco\/\d+-logo\.jpg$/)
  })
})
