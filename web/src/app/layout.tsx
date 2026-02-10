import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import AuthProvider from '@/components/providers/auth-provider'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { GoogleAnalytics } from '@next/third-parties/google'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'ちょこみんず',
  description:
    'ちょこみんずは、気になるメーカーやチョコレートを記録し、レビューを通じて推しチョコを共有できるコミュニティです。',
  openGraph: {
    title: 'ちょこみんず',
    description:
      'ちょこみんずでメーカー・店舗やチョコを整理し、レビューを投稿して新しい一粒に出会いましょう。',
    images: ['/t.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ちょこみんず',
    description:
      'ちょこみんずは、メーカー・店舗登録からレビュー投稿までをサポートするチョコミント好きのための場所です。',
    images: ['/t.png'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID} />
      )}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 pt-16 pb-16">{children}</main>
            <Footer />
          </div>
          <Toaster richColors closeButton />
        </AuthProvider>
      </body>
    </html>
  )
}
