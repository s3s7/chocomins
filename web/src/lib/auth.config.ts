import type { NextAuthConfig } from 'next-auth'
import { prisma } from '@/lib/prisma'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'

export default {
  // 認証プロバイダーの設定
  providers: [
    Credentials({
      // プロバイダー名（任意）
      name: 'credentials',
      // ログインフォームで受け取る値の定義
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      // ユーザー認証処理を行う関数
      authorize: async (credentials) => {
        // 入力があるか確認（emailとpasswordは必須）
        if (!credentials?.email || !credentials.password) {
          // いずれかがない場合は認証失敗としてnullを返す
          return null
        }

        // 入力されたemailでユーザーをDBから検索
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        // ユーザーが存在しない、またはパスワードが登録されていない場合は認証失敗
        if (!user || !user.password) {
          return null
        }

        // 入力されたパスワードとDBに保存されたハッシュ化パスワードを比較
        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password,
        )

        // パスワードが一致しなければ認証失敗
        if (!isValid) {
          return null
        }

        // 認証成功した場合、セッションに保存するユーザー情報を返す
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
} satisfies NextAuthConfig
