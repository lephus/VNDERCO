import { auth } from '@/lib/auth'
import { logoutAction } from '@/lib/actions/auth'
import { Sidebar } from '@/components/admin/Sidebar'
import { DefaultPasswordBanner } from '@/components/admin/DefaultPasswordBanner'

export const metadata = { title: { template: '%s | Quản trị VNDERCO', default: 'Quản trị VNDERCO' } }

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  return (
    <div className="min-h-screen bg-slate-50">
      {session?.user?.usingDefaultPassword && <DefaultPasswordBanner />}
      <div className="flex">
        <Sidebar />
        <div className="flex-1">
          <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
            <span className="text-sm text-slate-600">{session?.user?.email}</span>
            <form action={logoutAction}>
              <button type="submit" className="text-sm text-slate-600 hover:text-slate-900">Đăng xuất</button>
            </form>
          </header>
          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  )
}
