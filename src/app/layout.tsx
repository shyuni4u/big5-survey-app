import { pretendard } from '@/lib/fonts/pretendard'
import './globals.css'
import { cn } from '@/lib/utils'
import { ThemeProvider } from 'next-themes'
import { GoogleAnalytics } from '@next/third-parties/google'
import { Toaster } from 'react-hot-toast'
import ErrorBoundary from '@/components/ErrorBoundary'

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID

  return (
    <html lang="ko" suppressHydrationWarning className={cn(pretendard.className, 'scroll-smooth')}>
      <body>
        {gaId && <GoogleAnalytics gaId={gaId} />}
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ErrorBoundary>{children}</ErrorBoundary>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'hsl(var(--background))',
                color: 'hsl(var(--foreground))',
                border: '1px solid hsl(var(--border))',
              },
              success: {
                iconTheme: {
                  primary: 'hsl(var(--primary))',
                  secondary: 'hsl(var(--primary-foreground))',
                },
              },
              error: {
                iconTheme: {
                  primary: 'hsl(var(--destructive))',
                  secondary: 'hsl(var(--destructive-foreground))',
                },
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
