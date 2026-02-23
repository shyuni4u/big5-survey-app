'use client'

import { useEffect, useRef } from 'react'

interface KakaoAdFitProps {
  width: number
  height: number
}

export function KakaoAdFit({ width, height }: KakaoAdFitProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sizeRef = useRef({ width, height })

  useEffect(() => {
    const container = containerRef.current
    if (!container || container.childElementCount > 0) return

    const { width, height } = sizeRef.current

    const ins = document.createElement('ins')
    ins.className = 'kakao_ad_area'
    ins.style.display = 'none'
    ins.setAttribute('data-ad-unit', process.env.NEXT_PUBLIC_KAKAO_AD_UNIT!)
    ins.setAttribute('data-ad-width', String(width))
    ins.setAttribute('data-ad-height', String(height))
    container.appendChild(ins)

    const script = document.createElement('script')
    script.async = true
    script.type = 'text/javascript'
    script.src = 'https://t1.daumcdn.net/kas/static/ba.min.js'
    container.appendChild(script)
  }, [])

  return (
    <div className="flex justify-center my-4">
      <div ref={containerRef} />
    </div>
  )
}
