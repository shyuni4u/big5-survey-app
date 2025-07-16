import { pretendard } from '@/lib/fonts/pretendard'
import './globals.css'
import { cn } from '@/lib/utils'
import { ThemeProvider } from 'next-themes'
import { GoogleAnalytics } from '@next/third-parties/google'

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" suppressHydrationWarning className={cn(pretendard.className, 'scroll-smooth')}>
      <head>
        <meta name="google-adsense-account" content="ca-pub-7797435335029081" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7797435335029081"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body>
        <GoogleAnalytics gaId="G-2FW5XLPK5V" />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
