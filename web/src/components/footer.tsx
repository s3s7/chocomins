'use client'

import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-[#563406] px-4 py-6 text-center text-sm text-white">
      <p>&copy; {new Date().getFullYear()} ちょこみんず</p>
      <div className="mt-2 flex flex-wrap justify-center gap-4">
        {/* <Link href="/contact" className="hover:text-gray-900">
          お問い合わせ
        </Link> */}
      </div>
    </footer>
  )
}
