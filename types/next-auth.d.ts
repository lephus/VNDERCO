import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface Session { user: { id: string; email: string; usingDefaultPassword: boolean } & { name?: string | null } }
  interface User { usingDefaultPassword?: boolean }
}

declare module 'next-auth/jwt' {
  interface JWT { id?: string; usingDefaultPassword?: boolean }
}
