import Link from 'next/link'

export function SectionHeading({ title, href, linkLabel }: { title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="mb-6 flex items-end justify-between">
      <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">{title}</h2>
      {href && linkLabel && (
        <Link href={href} className="text-sm font-semibold text-primary-600 hover:underline">{linkLabel} →</Link>
      )}
    </div>
  )
}
