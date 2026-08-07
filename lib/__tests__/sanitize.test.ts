import { describe, expect, it } from 'vitest'
import { sanitizeHtml } from '@/lib/sanitize'

describe('sanitizeHtml', () => {
  it('giữ lại thẻ định dạng hợp lệ', () => {
    const html = '<h2>Tiêu đề</h2><p><strong>đậm</strong> và <em>nghiêng</em></p><ul><li>một</li></ul>'
    expect(sanitizeHtml(html)).toBe(html)
  })

  it('loại bỏ thẻ script', () => {
    expect(sanitizeHtml('<p>ok</p><script>alert(1)</script>')).toBe('<p>ok</p>')
  })

  it('loại bỏ thuộc tính bắt sự kiện', () => {
    expect(sanitizeHtml('<p onclick="alert(1)">ok</p>')).toBe('<p>ok</p>')
  })

  it('chặn liên kết javascript: nhưng giữ liên kết http', () => {
    expect(sanitizeHtml('<a href="javascript:alert(1)">x</a>')).not.toContain('javascript:')
    expect(sanitizeHtml('<a href="https://vnderco.vn">x</a>')).toContain('https://vnderco.vn')
  })

  it('giữ iframe nhúng YouTube', () => {
    const embed = '<iframe src="https://www.youtube.com/embed/abc123"></iframe>'
    expect(sanitizeHtml(embed)).toContain('youtube.com/embed/abc123')
  })

  it('loại iframe từ tên miền lạ', () => {
    expect(sanitizeHtml('<iframe src="https://evil.example/x"></iframe>')).toBe('')
  })
})
