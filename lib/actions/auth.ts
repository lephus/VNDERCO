'use server'

import { AuthError } from 'next-auth'
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
    if (error instanceof AuthError) return { error: 'Email hoặc mật khẩu không đúng' }
    throw error   // redirect của Next.js ném lỗi có chủ đích — phải cho nó đi tiếp
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: '/admin/login' })
}
