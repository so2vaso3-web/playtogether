import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'PlayTogether Hack Store - #1 Hack Store Việt Nam | Anti-Ban 100%',
  description: 'Cửa hàng hack PlayTogether hàng đầu Việt Nam. Công nghệ Anti-Ban tiên tiến, hỗ trợ Android, iOS, Giả Lập. Hỗ trợ 24/7, update miễn phí, bảo hành trong thời gian sử dụng.',
  keywords: 'playtogether hack, hack play together, mod playtogether, hack game, anti-ban, android hack, ios hack, giả lập hack',
  icons: {
    icon: [
      { url: '/api/favicon', sizes: '32x32', type: 'image/png' },
      { url: '/api/favicon', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/api/favicon',
    apple: '/api/favicon',
  },
  openGraph: {
    title: 'PlayTogether Hack Store - #1 Hack Store Việt Nam',
    description: 'Cửa hàng hack PlayTogether hàng đầu với công nghệ Anti-Ban tiên tiến',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://img.vietqr.io" />
      </head>
      <body>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}

