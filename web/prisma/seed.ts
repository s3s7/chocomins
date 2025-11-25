import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('securepassword', 10)

// 管理者ユーザーを作成
  await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin1@example.com',
      password: hashedPassword,
      role: Role.ADMIN, // ADMINとしてロールを設定
    },
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
