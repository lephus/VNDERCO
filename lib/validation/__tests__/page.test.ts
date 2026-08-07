import { describe, expect, it } from 'vitest'
import { pageCreateSchema, resolvePageSlug } from '@/lib/validation/page'

const base = {
  title: 'Giới thiệu công ty', slug: '', content: '<p>Nội dung</p>',
  status: 'DRAFT', seoTitle: '', seoDescription: '',
}

describe('pageCreateSchema', () => {
  it('sinh slug từ tiêu đề và làm sạch nội dung', () => {
    const p = pageCreateSchema.parse({ ...base, content: '<p>ok</p><script>x</script>' })
    expect(p.slug).toBe('gioi-thieu-cong-ty')
    expect(p.content).toBe('<p>ok</p>')
  })

  it('chuyển seoTitle/seoDescription rỗng thành null', () => {
    const p = pageCreateSchema.parse(base)
    expect(p.seoTitle).toBeNull()
    expect(p.seoDescription).toBeNull()
  })

  it('báo lỗi khi thiếu tiêu đề hoặc nội dung rỗng', () => {
    expect(pageCreateSchema.safeParse({ ...base, title: '' }).error!.flatten().fieldErrors.title)
      .toContain('Tiêu đề không được để trống')
    expect(pageCreateSchema.safeParse({ ...base, content: '<p></p>' }).error!.flatten().fieldErrors.content)
      .toContain('Nội dung không được để trống')
  })
})

// resolvePageSlug là nơi thực sự chặn slug trùng route hệ thống (RESERVED_SLUGS) và
// xử lý việc sửa trang mà không đổi slug — đây là đúng hàm mà lib/actions/page.ts gọi,
// không phải bản viết lại để test, nên hư hỏng ở đây sẽ làm test dưới đây fail thật.
describe('resolvePageSlug', () => {
  it('slug trùng route hệ thống bị đổi thành "-2" dù chưa có trang nào dùng nó', () => {
    expect(resolvePageSlug('tin-tuc', [])).toBe('tin-tuc-2')
    expect(resolvePageSlug('san-pham', [])).toBe('san-pham-2')
    expect(resolvePageSlug('admin', [])).toBe('admin-2')
  })

  it('đổi tên một trang đang có sang slug hệ thống vẫn bị chặn', () => {
    // Trang đang sửa có slug hiện tại là "gioi-thieu", người dùng đổi thành "san-pham".
    expect(resolvePageSlug('san-pham', ['gioi-thieu', 'lien-he'], 'gioi-thieu')).toBe('san-pham-2')
  })

  it('lưu lại mà không đổi slug thì giữ nguyên, không tự thêm "-2"', () => {
    // existingSlugs vẫn chứa slug của chính bản ghi đang sửa (như khi đọc toàn bộ
    // bảng), nhưng vì ownSlug trùng khớp nên nó phải được loại ra trước khi so khớp.
    expect(resolvePageSlug('gioi-thieu', ['gioi-thieu', 'lien-he'], 'gioi-thieu')).toBe('gioi-thieu')
  })

  it('đổi tên sang slug một trang KHÁC đang dùng vẫn bị chặn (không phải do tự loại nhầm)', () => {
    expect(resolvePageSlug('lien-he', ['gioi-thieu', 'lien-he'], 'gioi-thieu')).toBe('lien-he-2')
  })

  it('tạo mới trùng slug một trang đã có (không phải slug hệ thống) vẫn bị đổi thành "-2"', () => {
    expect(resolvePageSlug('gioi-thieu', ['gioi-thieu'])).toBe('gioi-thieu-2')
  })
})
