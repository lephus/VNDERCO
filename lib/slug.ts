const FALLBACK = 'noi-dung'

export function slugify(input: string): string {
  const slug = input
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return slug || FALLBACK
}

export function uniqueSlug(base: string, taken: string[]): string {
  const used = new Set(taken)
  if (!used.has(base)) return base

  let n = 2
  while (used.has(`${base}-${n}`)) n++
  return `${base}-${n}`
}
