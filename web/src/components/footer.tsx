'use client'

import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-gray-100 px-4 py-6 text-center text-sm text-gray-600">
      <p>&copy; {new Date().getFullYear()} My App. All rights reserved.</p>
      <div className="mt-2 flex flex-wrap justify-center gap-4">
        <Link href="/reviews" className="hover:text-gray-900">
          投稿一覧
        </Link>
        <Link href="/brands" className="hover:text-gray-900">
          ブランド一覧
        </Link>
        {/* <Link href="/contact" className="hover:text-gray-900">
          お問い合わせ
        </Link> */}
      </div>
    </footer>
  )
}
