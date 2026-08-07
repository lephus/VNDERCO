import { createClient } from '@supabase/supabase-js'
import { slugify } from '@/lib/slug'

export const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
export const MAX_SIZE_BYTES = 5 * 1024 * 1024

export function assertUploadable(file: { type: string; size: number }): void {
  if (!ALLOWED_MIME.includes(file.type)) {
    throw new Error('Chỉ nhận ảnh JPG, PNG, WEBP hoặc AVIF')
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error('Ảnh không được vượt quá 5MB')
  }
}

// Service role key bỏ qua RLS — file này chỉ được import từ server.
function storageClient() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Thiếu SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY')
  return createClient(url, key, { auth: { persistSession: false } })
}

function bucket() {
  return process.env.SUPABASE_STORAGE_BUCKET ?? 'media'
}

// Tên file gốc có dấu tiếng Việt và khoảng trắng sẽ hỏng key của Storage,
// nên chuẩn hoá phần tên và giữ lại đuôi mở rộng.
export function storageKey(filename: string): string {
  const dot = filename.lastIndexOf('.')
  const base = dot > 0 ? filename.slice(0, dot) : filename
  const ext = dot > 0 ? filename.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, '') : 'bin'
  return `vnderco/${Date.now()}-${slugify(base)}.${ext}`
}

export async function uploadImage(file: File): Promise<{ url: string; pathname: string }> {
  assertUploadable(file)
  const pathname = storageKey(file.name)
  const supabase = storageClient()

  const { error } = await supabase.storage
    .from(bucket())
    .upload(pathname, file, { contentType: file.type, upsert: false })
  if (error) throw new Error(`Tải ảnh thất bại: ${error.message}`)

  const { data } = supabase.storage.from(bucket()).getPublicUrl(pathname)
  return { url: data.publicUrl, pathname }
}

// Nhận pathname (key trong bucket), KHÔNG phải URL công khai.
export async function deleteImage(pathname: string): Promise<void> {
  const { error } = await storageClient().storage.from(bucket()).remove([pathname])
  if (error) throw new Error(`Xoá ảnh thất bại: ${error.message}`)
}
