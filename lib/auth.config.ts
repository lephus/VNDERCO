import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  pages: { signIn: '/admin/login' },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isAdminArea = request.nextUrl.pathname.startsWith('/admin')
      const isLoginPage = request.nextUrl.pathname === '/admin/login'
      if (!isAdminArea) return true
      if (isLoginPage) return true
      return Boolean(auth?.user)
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.usingDefaultPassword = (user as { usingDefaultPassword?: boolean }).usingDefaultPassword ?? false
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      session.user.usingDefaultPassword = token.usingDefaultPassword as boolean
      return session
    },
  },
} satisfies NextAuthConfig
