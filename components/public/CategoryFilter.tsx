import Link from 'next/link'
import type { Category } from '@prisma/client'

export function CategoryFilter({
  categories, active, basePath,
}: { categories: Category[]; active?: string; basePath: string }) {
  const item = (href: string, label: string, isActive: boolean) => (
    <Link key={href} href={href}
      className={`rounded-full px-4 py-1.5 text-sm ${
        isActive ? 'bg-primary-600 font-semibold text-primary-fg' : 'border border-slate-200 text-slate-600'
      }`}>
      {label}
    </Link>
  )

  return (
    <div className="mb-8 flex flex-wrap gap-2">
      {item(basePath, 'Tất cả', !active)}
      {categories.map((c) => item(`${basePath}?danh-muc=${c.slug}`, c.name, active === c.slug))}
    </div>
  )
}
