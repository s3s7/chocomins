import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('securepassword', 10)

  const usersData: {
    name: string
    email: string
    password: string
    role: Role
  }[] = Array.from({ length: 10 }).map((_, i) => ({
    name: `User${i + 1}`,
    email: `user${i + 1}@example.com`,
    password: hashedPassword,
    role: Role.USER,
  }))

  // 管理者ユーザーも追加したい場合
  const adminName = process.env.ADMIN_NAME ?? 'Admin User'
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@example.com'
  const adminPassword = process.env.ADMIN_PASSWORD

  // ADMIN_PASSWORD が未設定なら落とす（事故防止）
  if (!adminPassword) {
    throw new Error(
      'ADMIN_PASSWORD is not set. Please set it in environment variables.',
    )
  }

  const hashedAdminPassword = await bcrypt.hash(adminPassword, 10)
  usersData.push({
    name: adminName,
    email: adminEmail.toLowerCase(),
    password: hashedAdminPassword,
    role: Role.ADMIN,
  })
  // usersData.push({
  //   name: 'Admin User',
  //   email: 'admin@example.com',
  //   password: hashedPassword,
  //   role: Role.ADMIN,
  // })

  await prisma.user.createMany({
    data: usersData,
    skipDuplicates: true, // すでに同じメールがあればスキップ
  })

  console.log('Seed finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
