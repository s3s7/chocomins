'use server'

import { prisma } from '@/lib/prisma'
import { signUpSchema } from '@/schemas/sign-up'
import { ActionResult, ErrorCodes } from '@/types'
import bcrypt from 'bcryptjs'

type SignUpValues = {
  email: string
  password: string
  name: string
}

export async function signUp(values: SignUpValues): Promise<ActionResult> {
  // ZodのsafeParseを使って検証
  const parsed = signUpSchema.safeParse(values)

  // バリデーションエラー時の処理
  if (!parsed.success) {
    return { isSuccess: false, errorCode: ErrorCodes.INVALID_INPUT }
  }

  try {
    const { email, password, name } = parsed.data

    // すでに同じメールアドレスが登録されていないか確認
    const existingUser = await prisma.user.findUnique({ where: { email } })

    if (existingUser)
      return { isSuccess: false, errorCode: ErrorCodes.USER_EXISTS }

    const hashedPassword = await bcrypt.hash(password, 12)

    await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    })

    return {
      isSuccess: true,
    }
  } catch (err) {
    // サーバーエラー時の処理
    console.error('SignUp error:', err)
    return {
      isSuccess: false,
      errorCode: ErrorCodes.SERVER_ERROR,
    }
  }
}
