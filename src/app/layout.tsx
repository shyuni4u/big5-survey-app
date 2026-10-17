import { pretendard } from '@/lib/fonts/pretendard'
import './globals.css'
import { cn } from '@/lib/utils'
import { ThemeProvider } from 'next-themes'
import { Suspense } from 'react'
import Analytics from '@/components/Analytics'
import { Toaster } from 'react-hot-toast'
import ErrorBoundary from '@/components/ErrorBoundary'

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID

  return (
    <html lang="ko" suppressHydrationWarning className={cn(pretendard.variable, 'scroll-smooth font-sans')}>
      <body>
        <Suspense fallback={null}>
          <Analytics gaId={gaId} tagId={process.env.NEXT_PUBLIC_GOOGLE_TAG_ID || gaId} />
        </Suspense>
        <ThemeProvider attribute="class" forcedTheme="dark">
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
