'use client'
import { useEffect, useRef } from 'react'
import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { captureShareSource, track } from '@/lib/analytics'
import { safeAnalyticsUrl } from '@/lib/sharing'

export default function Analytics({ gaId }: { gaId?: string }) {
  const path = usePathname()
  const search = useSearchParams().toString()
  const previous = useRef('')
  const valid = !!gaId && /^G-[A-Z0-9]+$/.test(gaId)
  useEffect(() => {
    if (!valid || !gaId) return
    if (!window.personaGaId) {
      window.dataLayer = window.dataLayer || []
      window.gtag = function () {
        // gtag uses an Arguments object in its command queue.
        // eslint-disable-next-line prefer-rest-params
        window.dataLayer!.push(arguments)
      }
      window.personaGaId = gaId
      window.gtag('js', new Date())
      window.gtag('config', gaId, {
        send_page_view: false,
        page_location: safeAnalyticsUrl(window.location.href),
        page_referrer: document.referrer ? safeAnalyticsUrl(document.referrer) : '',
      })
    }
    const key = path + '?' + search
    if (previous.current === key) return
    previous.current = key
    const source = captureShareSource(search)
    track('page_view', { page_title: document.title })
    if (source) track('share_landing', { method: source, landing_page: path })
  }, [gaId, valid, path, search])
  return valid ? (
    <Script id="persona-ga" src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
  ) : null
}
