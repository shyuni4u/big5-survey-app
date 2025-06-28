import type { Metadata } from 'next'
import { promises as fs } from 'fs'

// import { GoogleTagManager } from '@next/third-parties/google'
import { pretendard } from '@/lib/fonts/pretendard'
import { cn } from '@/lib/utils/cn'

import './globals.css'
// import { TooltipProvider } from '@/components/ui/tooltip'
// import { Toaster as Sonner } from '@/components/ui/sonner'
// import { NavigationGuardProvider } from 'next-navigation-guard'

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
    <html suppressHydrationWarning>
      {/* {process.env.GTM_ID && <GoogleTagManager gtmId={process.env.GTM_ID} />} */}
      <body className={cn(pretendard.className, 'overflow-hidden bg-white antialiased dark:bg-gray-900')}>
        {/* <TooltipProvider delayDuration={0}> */}
        <div id="root">
          {children}
          {/* <NavigationGuardProvider>{children}</NavigationGuardProvider> */}
          {/* <Sonner /> */}
        </div>
        {/* </TooltipProvider> */}
      </body>
    </html>
  )
}
