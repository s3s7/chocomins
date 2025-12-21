// import { auth } from '@/lib/auth'
// import { NextResponse } from 'next/server'
// import type { NextRequest } from 'next/server'
// import { Role } from '@prisma/client'

// export async function middleware(request: NextRequest) {
//   const session = await auth()

//   // 管理者以外が /admin にアクセスしようとしたらトップにリダイレクト
//   const isAdmin = session?.user?.role === Role.ADMIN
//   const isAdminPath = request.nextUrl.pathname.startsWith('/admin')

//   if (isAdminPath && !isAdmin) {
//     return NextResponse.redirect(new URL('/', request.url)) // `/`にリダイレクト
//   }

//   return NextResponse.next() // 次の処理に進む
// }

// export const config = {
//   matcher: ['/admin/:path*'],
// }
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { Role } from "@prisma/client"

export async function middleware(req: NextRequest) {
  // Edgeでは auth() を呼ばない（重い/Node依存）
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  const isAdminPath = req.nextUrl.pathname.startsWith("/admin")
  const isAdmin = token?.role === Role.ADMIN || token?.role === "ADMIN"

  if (isAdminPath && !isAdmin) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
