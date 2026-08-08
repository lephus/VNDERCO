import Link from 'next/link'
import { buttonClass } from '@/lib/ui/button'
import type { Category } from '@prisma/client'

export function CategoryFilter({
  categories, active, basePath,
}: { categories: Category[]; active?: string; basePath: string }) {
  const item = (href: string, label: string, isActive: boolean) => (
    // Chọn hẳn variant theo trạng thái, KHÔNG nối thêm class đè lên: hai class
    // nền cùng nằm trong class attribute thì trình duyệt xử theo thứ tự trong
    // file CSS chứ không theo thứ tự mình viết, nên kiểu "neutral + bg-primary-600"
    // có thể ra đúng hoặc sai màu tuỳ Tailwind sắp xếp — không đoán được.
    <Link key={href} href={href}
      className={buttonClass({ size: 'sm', variant: isActive ? 'primary' : 'neutral', lift: false })}
      aria-current={isActive ? 'page' : undefined}>
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
