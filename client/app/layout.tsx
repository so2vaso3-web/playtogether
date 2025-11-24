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
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    minimumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
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
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://img.vietqr.io" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Prevent zoom gestures
              (function() {
                let lastTouchEnd = 0;
                document.addEventListener('touchend', function(event) {
                  const now = Date.now();
                  if (now - lastTouchEnd <= 300) {
                    event.preventDefault();
                  }
                  lastTouchEnd = now;
                }, false);
                
                // Prevent pinch zoom
                document.addEventListener('gesturestart', function(e) {
                  e.preventDefault();
                });
                document.addEventListener('gesturechange', function(e) {
                  e.preventDefault();
                });
                document.addEventListener('gestureend', function(e) {
                  e.preventDefault();
                });
                
                // Prevent double tap zoom
                let lastTap = 0;
                document.addEventListener('touchend', function(event) {
                  const currentTime = new Date().getTime();
                  const tapLength = currentTime - lastTap;
                  if (tapLength < 500 && tapLength > 0) {
                    event.preventDefault();
                  }
                  lastTap = currentTime;
                }, false);
                
                // Force viewport scale
                function preventZoom() {
                  const viewport = document.querySelector('meta[name=viewport]');
                  if (viewport) {
                    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no');
                  }
                }
                preventZoom();
                window.addEventListener('resize', preventZoom);
                window.addEventListener('orientationchange', preventZoom);
              })();
            `,
          }}
        />
      </head>
      <body>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}

