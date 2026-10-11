'use client'

import { useEffect, useRef, useState } from 'react'

// Publisher ID from the account's generated native banner code (not a secret).
const affiliateId = '5fa8cc'
const frameId = 'AdpickAdFrame_result_banner'
const bannerUrl = `https://www.adpick.co.kr/nativeAD/ad.php?bannerType=type1&limit=1&affid=${affiliateId}&frameId=${frameId}&popup=false`

export function AdpickBanner() {
  const frameRef = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState(100)

  useEffect(() => {
    // Mirror the vendor's resize protocol without running its script in the
    // result page or accepting messages from unrelated frames.
    const resize = (event: MessageEvent) => {
      if (
        event.origin !== 'https://www.adpick.co.kr' ||
        !frameRef.current?.contentWindow ||
        event.source !== frameRef.current.contentWindow
      ) return
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
        const nextHeight = Number(data?.height)
        if (data?.id === frameId && Number.isFinite(nextHeight) && nextHeight >= 0 && nextHeight <= 500) {
          setHeight(Math.ceil(nextHeight))
        }
      } catch {
        // Ignore malformed third-party messages.
      }
    }
    window.addEventListener('message', resize)
    return () => window.removeEventListener('message', resize)
  }, [])

  return (
    <aside aria-label="광고" className="mx-auto my-6 w-full max-w-[672px] px-4">
      <p className="mb-2 text-center text-xs text-muted-foreground">
        광고 · 이 광고를 통한 참여 시 운영자에게 수수료가 지급될 수 있습니다.
      </p>
      {/* No third-party script runs in the result page.
          Never use the supplied unsafe-url policy: result URLs contain scores. */}
      <iframe
        ref={frameRef}
        id={frameId}
        title="애드픽 제휴 광고"
        src={bannerUrl}
        width="100%"
        height={height}
        className="block w-full border-0"
        scrolling="no"
        loading="lazy"
        referrerPolicy="origin"
      />
    </aside>
  )
}

