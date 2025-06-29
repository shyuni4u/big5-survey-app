import type { Metadata } from 'next'
import { promises as fs } from 'fs'
import { pretendard } from '@/lib/fonts/pretendard'
import './globals.css'
import { cn } from '@/lib/utils'
import { ThemeProvider } from 'next-themes'

export async function generateMetadata(): Promise<Metadata> {
  const publicMetadata = JSON.parse(
    await fs.readFile(process.cwd() + '/public/metadata.json', { encoding: 'utf-8' }),
  ) as Metadata
  const metadataBase = publicMetadata.openGraph?.url ? new URL(publicMetadata.openGraph.url) : undefined

  return {
    ...publicMetadata,
    metadataBase,
  }
}

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
