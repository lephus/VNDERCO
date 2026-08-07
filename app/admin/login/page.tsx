import { LoginForm } from './login-form'

export const metadata = { title: 'Đăng nhập quản trị' }

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-xl font-bold text-slate-900">Quản trị VNDERCO</h1>
        <LoginForm />
      </div>
    </main>
  )
}
