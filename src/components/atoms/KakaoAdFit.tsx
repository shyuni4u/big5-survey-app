'use client'

import { useEffect, useRef } from 'react'

interface KakaoAdFitProps {
  width: number
  height: number
}

export function KakaoAdFit({ width, height }: KakaoAdFitProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const container = containerRef.current
    if (!container) return

    const ins = document.createElement('ins')
    ins.className = 'kakao_ad_area'
    ins.style.display = 'none'
    ins.setAttribute('data-ad-unit', 'DAN-MeIbICppOyhqMX2E')
    ins.setAttribute('data-ad-width', String(width))
    ins.setAttribute('data-ad-height', String(height))
    container.appendChild(ins)

    const script = document.createElement('script')
    script.async = true
    script.type = 'text/javascript'
    script.src = '//t1.daumcdn.net/kas/static/ba.min.js'
    container.appendChild(script)
  }, [width, height])

  return (
    <div className="flex justify-center my-4">
      <div ref={containerRef} />
    </div>
  )
}
