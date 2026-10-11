import { safeAnalyticsUrl } from './sharing'

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
    personaGaId?: string
  }
}
const attributionKey = 'persona-share-attribution'
export function captureShareSource(search: string) {
  const params = new URLSearchParams(search)
  if (params.get('ref') !== 'share') return null
  const content = params.get('utm_content')
  const method = ['native', 'copy_link', 'card_qr'].includes(content || '') ? content! : 'shared_link'
  try {
    sessionStorage.setItem(attributionKey, JSON.stringify({ method, at: Date.now() }))
  } catch {
    /* Optional attribution storage. */
  }
  return method
}
export function shareSource() {
  try {
    const data = JSON.parse(sessionStorage.getItem(attributionKey) || 'null')
    if (data && Date.now() - data.at < 30 * 60 * 1000) return data.method as string
  } catch {
    /* Optional storage. */
  }
  return 'direct'
}
export function track(name: string, params: Record<string, string | number> = {}) {
  if (typeof window === 'undefined' || !window.personaGaId) return
  window.gtag?.('event', name, {
    ...params,
    acquisition_source: shareSource(),
    page_location: safeAnalyticsUrl(window.location.href),
    page_referrer: document.referrer ? safeAnalyticsUrl(document.referrer) : '',
  })
}
