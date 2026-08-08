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
      {/* overflow-x-auto chứ không phải overflow-hidden: bảng danh sách rộng hơn
          màn hình điện thoại, mà overflow-hidden thì bảng không cuộn được nên nó
          đẩy toàn trang giãn ra (đo được 674px trong khung 390px). Cho nó tự cuộn
          trong thẻ này thì phần cuộn ngang nằm gọn ở bảng, header và menu đứng yên. */}
      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">{children}</div>
    </div>
  )
}
