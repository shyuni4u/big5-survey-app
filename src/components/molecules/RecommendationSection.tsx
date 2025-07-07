'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { gameClasses } from '@/lib/data'
import { cn } from '@/lib/utils'
import { Trophy, Medal, Award } from 'lucide-react'

interface Recommendation {
  label: string
  score: number
}

interface RecommendationSectionProps {
  recommendations: Recommendation[]
  isLoading: boolean
}

export default function RecommendationSection({ recommendations, isLoading }: RecommendationSectionProps) {
  const [visibleCards, setVisibleCards] = useState<number>(0)

  useEffect(() => {
    if (recommendations.length > 0 && !isLoading) {
      const timer = setInterval(() => {
        setVisibleCards((prev) => {
          if (prev < 3) {
            // 3개만 표시
            return prev + 1
          }
          clearInterval(timer)
          return prev
        })
      }, 800)

      return () => clearInterval(timer)
    }
  }, [recommendations, isLoading])

  const getClassAndSpec = (label: string) => {
    const [className, specName] = label.split('_')
    const gameClass = gameClasses.find((cls) => cls.name === className)
    const spec = gameClass?.specs.find((s) => s.name === specName)
    return { gameClass, spec }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-12 w-12 text-yellow-400" />
      case 2:
        return <Medal className="h-10 w-10 text-gray-300" />
      case 3:
        return <Award className="h-8 w-8 text-amber-600" />
      default:
        return null
    }
  }

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'border-yellow-400/50 bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 shadow-2xl shadow-yellow-400/30'
      case 2:
        return 'border-gray-300/50 bg-gradient-to-br from-gray-300/20 to-gray-500/20 shadow-xl shadow-gray-300/20'
      case 3:
        return 'border-amber-600/50 bg-gradient-to-br from-amber-600/20 to-amber-800/20 shadow-lg shadow-amber-600/20'
      default:
        return ''
    }
  }

  const getPodiumHeight = (rank: number) => {
    switch (rank) {
      case 1:
        return 'h-80' // 가장 높음
      case 2:
        return 'h-64' // 중간
      case 3:
        return 'h-48' // 가장 낮음
      default:
        return 'h-48'
    }
  }

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return { text: '🥇 GOLD', style: 'bg-yellow-400 text-yellow-900 border-yellow-500' }
      case 2:
        return { text: '🥈 SILVER', style: 'bg-gray-300 text-gray-900 border-gray-400' }
      case 3:
        return { text: '🥉 BRONZE', style: 'bg-amber-600 text-amber-100 border-amber-700' }
      default:
        return { text: '', style: '' }
    }
  }

  if (isLoading) {
    return (
      <Card className="border-border bg-card">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-foreground">AI 직업 추천 분석 중...</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-12">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-muted-foreground">당신에게 완벽한 직업을 찾고 있습니다...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (recommendations.length === 0) {
    return null
  }

  // 올림픽 단상 순서: 2위, 1위, 3위
  const podiumOrder = [
    { data: recommendations[1], rank: 2, position: 'left' },
    { data: recommendations[0], rank: 1, position: 'center' },
    { data: recommendations[2], rank: 3, position: 'right' },
  ]

  return (
    <Card className="overflow-hidden border-border bg-card">
      <CardHeader className="pb-8 text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-2xl">
          <Trophy className="h-10 w-10 text-yellow-900" />
        </div>
        <CardTitle className="text-3xl font-bold text-foreground md:text-4xl">🏆 추천 직업</CardTitle>
        <p className="text-lg text-muted-foreground">당신의 성격에 가장 적합한 WoW 직업 TOP 3</p>
      </CardHeader>

      <CardContent className="px-8 pb-12">
        {/* 올림픽 단상 */}
        <div className="mb-8 flex items-end justify-center gap-8">
          {podiumOrder.map((item) => {
            if (!item.data) return null

            const { gameClass, spec } = getClassAndSpec(item.data.label)
            if (!gameClass || !spec) return null

            const badge = getRankBadge(item.rank)
            const shouldShow = visibleCards > (item.rank === 1 ? 0 : item.rank === 2 ? 1 : 2)

            return (
              <div
                key={item.data.label}
                className={cn(
                  'flex transform flex-col items-center transition-all duration-1000',
                  shouldShow ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0',
                )}
                style={{ transitionDelay: `${item.rank === 1 ? 0 : item.rank === 2 ? 400 : 800}ms` }}
              >
                {/* 메달과 정보 */}
                <div className="mb-4 text-center">
                  <div className="mb-3 flex justify-center">{getRankIcon(item.rank)}</div>
                  <Badge className={cn('mb-2 px-4 py-2 text-sm font-bold shadow-lg', badge.style)}>{badge.text}</Badge>
                  <div className="text-2xl font-bold text-foreground">{Math.round(item.data.score * 100)}%</div>
                </div>

                {/* 단상 */}
                <Card
                  className={cn(
                    'w-48 cursor-pointer border-2 transition-all duration-500 hover:scale-105',
                    getPodiumHeight(item.rank),
                    getRankStyle(item.rank),
                  )}
                >
                  <CardContent className="flex h-full flex-col items-center justify-center p-6 text-center">
                    <Image
                      src={spec.image || '/placeholder.svg'}
                      alt={spec.name}
                      width={80}
                      height={80}
                      className="mb-4 h-20 w-20 rounded-lg shadow-lg"
                    />
                    <h3 className="mb-2 text-lg font-bold text-foreground">{gameClass.nameKr}</h3>
                    <h4 className="text-md mb-2 font-semibold text-foreground">{spec.nameKr}</h4>
                    <p className="mb-3 text-sm text-muted-foreground">
                      {spec.role === 'tanker' && '🛡️ 탱커'}
                      {spec.role === 'dealer' && '⚔️ 딜러'}
                      {spec.role === 'healer' && '💚 힐러'}
                    </p>
                    <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">{spec.description}</p>
                  </CardContent>
                </Card>
              </div>
            )
          })}
        </div>

        {/* 축하 메시지 */}
        {visibleCards >= 3 && (
          <div className="animate-slide-up text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/30 bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 px-6 py-3">
              <span className="text-2xl">🎉</span>
              <p className="font-semibold text-foreground">축하합니다! AI가 분석한 당신만의 완벽한 직업을 찾았습니다</p>
              <span className="text-2xl">🎉</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
