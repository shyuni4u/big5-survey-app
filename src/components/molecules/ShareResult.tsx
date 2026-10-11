'use client'
import { useState } from 'react'
import { Download, Share2, Link2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { games, getGameClasses, traitInfo } from '@/lib/data'
import { zipData } from '@/lib/utils'
import type { PersonalityScores } from '@/lib/types'
import toast from 'react-hot-toast'

export default function ShareResult({
  game,
  scores,
  recommendation,
}: {
  game: string
  scores: PersonalityScores
  recommendation?: string
}) {
  const [saving, setSaving] = useState(false)
  const cls = getGameClasses(game).find((c) => c.specs.some((s) => `${c.name}_${s.name}` === recommendation))
  const spec = cls?.specs.find((s) => `${cls.name}_${s.name}` === recommendation)
  const gameName = games.find((g) => g.id === game)?.name || game
  const title = spec ? `${gameName} 속 나의 추천 직업은 ${spec.nameKr}!` : '나의 게임 성향 프로필'
  const url = () =>
    `${window.location.origin}/result?data=${zipData({ userType: 'new', personalityScores: scores })}&game=${encodeURIComponent(game)}`
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url())
      toast.success('결과 링크를 복사했어요.')
    } catch {
      toast.error('링크를 복사하지 못했어요. 브라우저의 공유 기능을 이용해주세요.')
    }
  }
  const share = async () => {
    if (!navigator.share) {
      await copy()
      return
    }
    try {
      await navigator.share({ title, text: `${title} 너는 어떤 직업이 나올까?`, url: url() })
    } catch (e) {
      if (!(e instanceof Error && e.name === 'AbortError')) await copy()
    }
  }
  const save = async () => {
    setSaving(true)
    try {
      await document.fonts.ready
      const canvas = document.createElement('canvas')
      canvas.width = 1080
      canvas.height = 1350
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('canvas')
      ctx.fillStyle = '#090e1d'
      ctx.fillRect(0, 0, 1080, 1350)
      const gradient = ctx.createLinearGradient(0, 0, 1080, 750)
      gradient.addColorStop(0, '#173d3d')
      gradient.addColorStop(1, '#10182a')
      ctx.fillStyle = gradient
      ctx.fillRect(40, 40, 1000, 1270)
      const font = getComputedStyle(document.body).fontFamily
      const text = (value: string, x: number, y: number, size: number, color = '#f1f5f9') => {
        ctx.font = `600 ${size}px ${font}`
        ctx.fillStyle = color
        ctx.fillText(value, x, y, 920)
      }
      text('PLAY / PERSONA', 80, 120, 28, '#70e8c5')
      text(gameName + ' 속 나의 다음 모험', 80, 235, 32)
      text(spec?.nameKr || '나의 성향 프로필', 80, 350, 74)
      text(cls?.nameKr || '다섯 가지 성격으로 알아본 나', 80, 415, 30, '#b6c2d4')
      text('MY PERSONALITY', 80, 540, 22, '#70e8c5')
      Object.entries(scores).forEach(([key, score], i) => {
        const y = 610 + i * 100
        text(traitInfo[key].name, 80, y, 28)
        text(`${score} / 100`, 820, y, 25)
        ctx.fillStyle = '#263449'
        ctx.fillRect(80, y + 20, 920, 10)
        ctx.fillStyle = '#70e8c5'
        ctx.fillRect(80, y + 20, (920 * score) / 100, 10)
      })
      text('친구는 어떤 직업일까?', 80, 1180, 36)
      text('Big5 성향 탐색 · 게임 추천은 재미로 참고해주세요', 80, 1240, 23, '#b6c2d4')
      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('encode'))), 'image/png'),
      )
      const objectUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = objectUrl
      a.download = `play-persona-${game}.png`
      a.click()
      setTimeout(() => URL.revokeObjectURL(objectUrl), 10000)
      toast.success('결과 카드를 저장했어요. 링크도 함께 보내보세요!')
    } catch {
      toast.error('카드를 저장하지 못했어요. 링크 공유를 이용해주세요.')
    } finally {
      setSaving(false)
    }
  }
  return (
    <section className="rounded-2xl border border-primary/30 bg-primary/5 p-6 md:p-8" aria-labelledby="share-heading">
      <p className="eyebrow">BETTER WITH FRIENDS</p>
      <h2 id="share-heading" className="mt-3 text-2xl font-bold">
        같이 모험할 친구는 어떤 직업일까?
      </h2>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        결과를 보내고 서로의 플레이 스타일을 이야기해보세요.
        <br />
        공유 링크에는 성격 점수가 포함되며, 입력한 현재 직업은 포함되지 않아요.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button className="h-12 rounded-xl" onClick={share}>
          <Share2 /> 친구에게 결과 공유
        </Button>
        <Button className="h-12 rounded-xl" variant="outline" onClick={save} disabled={saving}>
          <Download /> {saving ? '카드 만드는 중…' : '결과 카드 저장'}
        </Button>
        <Button className="h-12 rounded-xl" variant="ghost" onClick={copy}>
          <Link2 /> 링크 복사
        </Button>
      </div>
    </section>
  )
}
