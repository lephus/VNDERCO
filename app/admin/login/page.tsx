import { LoginForm } from './login-form'

export const metadata = { title: 'Đăng nhập quản trị' }

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const justChangedPassword = params['doi-mat-khau'] === '1'

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-xl font-bold text-slate-900">Quản trị VNDERCO</h1>
        {justChangedPassword && (
          <p className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
            Đã đổi mật khẩu, vui lòng đăng nhập lại.
          </p>
        )}
        <LoginForm />
      </div>
    </main>
  )
}
