import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  })
  const isAdminPath = req.nextUrl.pathname.startsWith('/admin')
  const isAdmin = token?.role === 'ADMIN' // 文字列でOK

  if (isAdminPath && !isAdmin) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}

export const config = { matcher: ['/admin/:path*'] }
