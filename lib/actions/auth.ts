'use server'

import { AuthError, CredentialsSignin } from 'next-auth'
import { signIn, signOut } from '@/lib/auth'

export async function loginAction(_prev: { error?: string }, formData: FormData) {
  try {
    await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirectTo: '/admin',
    })
    return {}
  } catch (error) {
    if (error instanceof CredentialsSignin) return { error: 'Email hoặc mật khẩu không đúng' }
    if (error instanceof AuthError) {
      console.error('[login]', error)
      return { error: 'Không đăng nhập được, vui lòng thử lại sau.' }
    }
    throw error   // redirect của Next.js ném lỗi có chủ đích — phải cho nó đi tiếp
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: '/admin/login' })
}
