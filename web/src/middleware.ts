import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Role } from '@prisma/client'

export async function middleware(request: NextRequest) {
  const session = await auth()

  // 管理者以外が /admin にアクセスしようとしたらトップにリダイレクト
  const isAdmin = session?.user?.role === Role.ADMIN
  const isAdminPath = request.nextUrl.pathname.startsWith('/admin')

  if (isAdminPath && !isAdmin) {
    return NextResponse.redirect(new URL('/', request.url)) // `/`にリダイレクト
  }

  return NextResponse.next() // 次の処理に進む
}

export const config = {
  matcher: ['/admin/:path*'],
}
