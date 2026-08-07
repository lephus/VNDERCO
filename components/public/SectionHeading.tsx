import Link from 'next/link'

export function SectionHeading({ title, href, linkLabel }: { title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="mb-6 flex items-end justify-between">
      <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">{title}</h2>
      {href && linkLabel && (
        <Link href={href} className="group inline-flex items-center gap-1 text-sm font-semibold text-primary-600 transition-colors hover:text-primary-700">
          <span className="transition-[background-size] duration-300 bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat group-hover:bg-[length:100%_1px]">
            {linkLabel}
          </span>
          {/* Mũi tên nhích sang phải khi rê chuột — gợi ý hướng đi tiếp. */}
          <span aria-hidden className="transition-transform duration-300 ease-out group-hover:translate-x-1">→</span>
        </Link>
      )}
    </div>
  )
}
