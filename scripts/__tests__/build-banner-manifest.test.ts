import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { buildManifest } from '@/scripts/build-banner-manifest'

const dirs: string[] = []

const makeDir = (files: Record<string, string>) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'banners-'))
  dirs.push(dir)
  for (const [name, content] of Object.entries(files)) fs.writeFileSync(path.join(dir, name), content)
  return dir
}

afterEach(() => {
  for (const dir of dirs.splice(0)) fs.rmSync(dir, { recursive: true, force: true })
})

describe('buildManifest', () => {
  it('chỉ liệt kê ảnh, bỏ qua README và file chú thích', () => {
    const dir = makeDir({
      '02-b.jpg': 'x', '01-a.png': 'x', 'README.md': 'x', 'captions.json': '{}', '.DS_Store': 'x',
    })
    expect(buildManifest(dir).files).toEqual(['01-a.png', '02-b.jpg'])
  })

  it('nhúng luôn nội dung captions.json vào manifest', () => {
    const dir = makeDir({ '01-a.jpg': 'x', 'captions.json': '{"01-a.jpg":{"title":"Xin chào"}}' })
    expect(buildManifest(dir).captions).toEqual({ '01-a.jpg': { title: 'Xin chào' } })
  })

  it('thư mục chưa tồn tại thì trả manifest rỗng chứ không ném lỗi làm hỏng lượt build', () => {
    expect(buildManifest(path.join(os.tmpdir(), 'khong-he-ton-tai-12345'))).toMatchObject({ files: [], captions: {} })
  })

  it('captions.json hỏng cú pháp vẫn build được, chỉ mất chú thích', () => {
    const dir = makeDir({ '01-a.jpg': 'x', 'captions.json': '{ hỏng,, }' })
    const manifest = buildManifest(dir)
    expect(manifest.files).toEqual(['01-a.jpg'])
    expect(manifest.captions).toEqual({})
  })
})
