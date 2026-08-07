import Link from 'next/link'

export function AdminListShell({
  title, createHref, createLabel = 'Thêm mới', toolbar, children,
}: {
  title: string; createHref?: string; createLabel?: string
  toolbar?: React.ReactNode; children: React.ReactNode
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">{title}</h1>
        {createHref && (
          <Link href={createHref} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-primary-fg">
            {createLabel}
          </Link>
        )}
      </div>
      {toolbar && <div className="flex flex-wrap gap-3">{toolbar}</div>}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm">{children}</div>
    </div>
  )
}
