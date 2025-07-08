import { pretendard } from '@/lib/fonts/pretendard'
import './globals.css'
import { cn } from '@/lib/utils'
import { ThemeProvider } from 'next-themes'

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" suppressHydrationWarning className={cn(pretendard.className, 'scroll-smooth')}>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
