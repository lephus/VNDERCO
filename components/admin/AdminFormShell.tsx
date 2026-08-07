import Link from 'next/link'

export function AdminFormShell({
  title, backHref, children,
}: { title: string; backHref: string; children: React.ReactNode }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href={backHref} className="text-sm text-slate-500 hover:text-slate-900">← Quay lại</Link>
        <h1 className="text-xl font-bold text-slate-900">{title}</h1>
      </div>
      <div className="rounded-xl bg-white p-6 shadow-sm">{children}</div>
    </div>
  )
}
