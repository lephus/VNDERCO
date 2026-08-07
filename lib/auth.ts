import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { authConfig } from './auth.config'
import { prisma } from './db'

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

// Hash tính sẵn một lần lúc khởi động, dùng khi không tìm thấy user để chi
// phí bcrypt luôn tốn như nhau — tránh lộ email nào tồn tại qua thời gian phản hồi.
const DUMMY_PASSWORD_HASH = bcrypt.hashSync('vnderco-dummy-password', 10)

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw)
        if (!parsed.success) return null

        const user = await prisma.user.findUnique({ where: { email: parsed.data.email } })
        if (!user) {
          await bcrypt.compare(parsed.data.password, DUMMY_PASSWORD_HASH)
          return null
        }
        if (!(await bcrypt.compare(parsed.data.password, user.passwordHash))) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          usingDefaultPassword: user.usingDefaultPassword,
        }
      },
    }),
  ],
})

export async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.id) throw new Error('UNAUTHORIZED')
  return session.user
}
