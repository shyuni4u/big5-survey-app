'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getGameClasses } from '@/lib/data'
import { cn } from '@/lib/utils'
import { Trophy, Medal, Award } from 'lucide-react'
import type { Recommendation } from '@/lib/types'

interface RecommendationSectionProps {
  game: string
  recommendations: Recommendation[]
}

export const SpriteIcon = ({
  imageUrl,
  position,
  scale = 0.17,
  spriteSize = 256,
  imageSize = 'h-8 w-8',
}: {
  imageUrl: string
  position: string
  scale?: number
  spriteSize?: number
  imageSize?: string
}) => (
  <div className={cn('relative overflow-hidden rounded', imageSize)}>
    <div
      className="absolute"
      style={{
        backgroundImage: `url(${imageUrl})`,
        backgroundPosition: position,
        backgroundRepeat: 'no-repeat',
        width: spriteSize,
        height: spriteSize,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
      }}
    />
  </div>
)

export default function RecommendationSection({ game, recommendations }: RecommendationSectionProps) {
  const [visibleCards, setVisibleCards] = useState<number>(0)

  useEffect(() => {
    // 추천이 바뀌면(다른 게임 추천 받기) 카드와 축하 문구가 처음부터 다시 차례로 나타나도록 되돌린다.
    setVisibleCards(0)
    if (recommendations.length > 0) {
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
  }, [recommendations])

  const getClassAndSpec = (label: string) => {
    const [className, specName] = label.split('_')
    const gameClasses = getGameClasses(game)
    const gameClass = gameClasses.find((cls) => cls.name === className)
    const spec = gameClass?.specs.find((s) => s.name === specName)
    return { gameClass, spec }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-8 w-8 text-yellow-400 md:h-12 md:w-12" />
      case 2:
        return <Medal className="h-7 w-7 text-gray-300 md:h-10 md:w-10" />
      case 3:
        return <Award className="h-6 w-6 text-amber-600 md:h-8 md:w-8" />
      default:
        return null
    }
  }

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'border-yellow-400/70 bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 shadow-2xl shadow-yellow-400/30'
      case 2:
        return 'border-gray-300/50 bg-gradient-to-br from-gray-300/20 to-gray-500/20 shadow-xl shadow-gray-300/20'
      case 3:
        return 'border-amber-600/50 bg-gradient-to-br from-amber-600/20 to-amber-800/20 shadow-lg shadow-amber-600/20'
      default:
        return ''
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

  const getRankScale = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          cardWidth: 'w-56', // 1위: 더 큰 카드
          cardHeight: 'min-h-96', // 1위: 더 높은 카드 (내용이 길면 늘어난다)
          imageSize: cn('w-20', game.toLowerCase() === 'lostark' ? 'h-24' : 'h-20'), // 1위: 더 큰 이미지
          titleSize: 'text-xl', // 1위: 더 큰 제목
          subtitleSize: 'text-base', // 1위: 더 큰 부제목
          scoreSize: 'text-4xl', // 1위: 더 큰 점수
          iconScale: 'scale-125', // 1위: 아이콘 확대
          badgeSize: 'px-5 py-3 text-base', // 1위: 더 큰 배지
        }
      case 2:
        return {
          cardWidth: 'w-48', // 2위: 기본 크기
          cardHeight: 'min-h-80',
          imageSize: cn('w-16', game.toLowerCase() === 'lostark' ? 'h-20' : 'h-16'),
          titleSize: 'text-lg',
          subtitleSize: 'text-sm',
          scoreSize: 'text-3xl',
          iconScale: 'scale-100',
          badgeSize: 'px-4 py-2 text-sm',
        }
      case 3:
        return {
          cardWidth: 'w-44', // 3위: 더 작은 카드
          cardHeight: 'min-h-72', // 3위: 더 낮은 카드 (내용이 길면 늘어난다)
          imageSize: cn('w-14', game.toLowerCase() === 'lostark' ? 'h-16' : 'h-14'), // 3위: 더 작은 이미지
          titleSize: 'text-base', // 3위: 더 작은 제목
          subtitleSize: 'text-sm', // 3위: 더 작은 부제목
          scoreSize: 'text-2xl', // 3위: 더 작은 점수
          iconScale: 'scale-90', // 3위: 아이콘 축소
          badgeSize: 'px-3 py-1 text-xs', // 3위: 더 작은 배지
        }
      default:
        return {
          cardWidth: 'w-48',
          cardHeight: 'min-h-80',
          imageSize: 'h-16 w-16',
          titleSize: 'text-lg',
          subtitleSize: 'text-sm',
          scoreSize: 'text-3xl',
          iconScale: 'scale-100',
          badgeSize: 'px-4 py-2 text-sm',
        }
    }
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
        <p className="text-lg text-muted-foreground">당신의 성격에 가장 적합한 {game} 직업 TOP 3</p>
      </CardHeader>

      <CardContent className="px-4 pb-12 md:px-8">
        {/* 데스크톱: 올림픽 단상 레이아웃 */}
        <div className="mb-8 hidden items-end justify-center gap-4 lg:flex lg:gap-8">
          {podiumOrder.map((item) => {
            if (!item.data) return null

            const { gameClass, spec } = getClassAndSpec(item.data.label)
            if (!gameClass || !spec) return null

            const badge = getRankBadge(item.rank)
            const shouldShow = visibleCards > (item.rank === 1 ? 0 : item.rank === 2 ? 1 : 2)

            const scale = getRankScale(item.rank)

            return (
              <div
                key={item.data.label}
                className={cn(
                  'flex transform flex-col items-center transition-all duration-1000',
                  shouldShow ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0',
                )}
                style={{ transitionDelay: `${item.rank === 1 ? 0 : item.rank === 2 ? 400 : 800}ms` }}
              >
                {/* 순위 아이콘 - 카드 외부에 배치 */}
                <div className="mb-4 flex flex-col items-center">
                  <div className={cn('mb-3 flex justify-center', scale.iconScale)}>{getRankIcon(item.rank)}</div>
                  <Badge className={cn('mb-2 font-bold shadow-lg', scale.badgeSize, badge.style)}>{badge.text}</Badge>
                </div>

                {/* 점수 표시 - 카드 외부에 배치 */}
                <div className="mb-4 text-center">
                  <div className={cn('font-bold text-foreground', scale.scoreSize)}>{item.data.score}%</div>
                  <div className="text-sm text-muted-foreground">적합도</div>
                </div>

                {/* 단상 카드 - 내용만 포함 */}
                <Card
                  className={cn(
                    'flex cursor-pointer flex-col border-2 transition-all duration-500 hover:scale-105',
                    scale.cardWidth,
                    scale.cardHeight,
                    getRankStyle(item.rank),
                  )}
                >
                  <CardContent className="flex flex-1 flex-col items-center justify-center p-4 text-center">
                    {game.toLowerCase() === 'dnf' ? (
                      <SpriteIcon
                        imageUrl={gameClass.image || '/placeholder.svg'}
                        position={spec.position || '0px 0px'}
                        scale={0.48}
                        spriteSize={512}
                        imageSize={'h-24 w-24'}
                      />
                    ) : (
                      <Image
                        src={spec.image || '/placeholder.svg'}
                        alt={spec.name}
                        width={64}
                        height={64}
                        className={cn('mb-3 rounded-lg shadow-lg', scale.imageSize)}
                        unoptimized
                      />
                    )}
                    <h3 className={cn('mb-2 font-bold text-foreground', scale.titleSize)}>{gameClass.nameKr}</h3>
                    <h4 className={cn('mb-2 font-semibold text-foreground', scale.subtitleSize)}>{spec.nameKr}</h4>
                    <p className="mb-3 text-xs text-muted-foreground">
                      {spec.role === 'tanker' && '🛡️ 탱커'}
                      {spec.role === 'dealer' && '⚔️ 딜러'}
                      {spec.role === 'healer' && '💚 힐러'}
                      {spec.role === 'supporter' && '✨ 서포터'}
                      {spec.role === 'buffer' && '✨ 버퍼'}
                    </p>
                    <p className="mb-2 text-xs font-medium text-primary">{item.data.reason}</p>
                    <p className="text-xs leading-relaxed text-muted-foreground">{spec.description}</p>
                  </CardContent>
                </Card>
              </div>
            )
          })}
        </div>

        {/* 모바일/태블릿: 세로 배치 레이아웃 */}
        <div className="mb-8 space-y-6 lg:hidden">
          {recommendations.slice(0, 3).map((item, index) => {
            const rank = index + 1
            const { gameClass, spec } = getClassAndSpec(item.label)
            if (!gameClass || !spec) return null

            const badge = getRankBadge(rank)
            const shouldShow = visibleCards > index

            return (
              <div
                key={item.label}
                className={cn(
                  'transform transition-all duration-1000',
                  shouldShow ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0',
                )}
                style={{ transitionDelay: `${index * 400}ms` }}
              >
                <Card
                  className={cn(
                    'cursor-pointer border-2 transition-all duration-300 hover:scale-[1.02]',
                    getRankStyle(rank),
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center gap-5">
                        {/* 순위 아이콘 */}
                        <div className="flex flex-col items-center">
                          <Badge className={cn('px-2 py-1 text-xs font-bold', badge.style)}>{badge.text}</Badge>
                        </div>

                        {/* 직업 이미지 */}
                        <div className="flex-shrink-0">
                          {game.toLowerCase() === 'dnf' ? (
                            <SpriteIcon
                              imageUrl={gameClass.image || '/placeholder.svg'}
                              position={spec.position || '0px 0px'}
                              scale={0.33}
                              spriteSize={512}
                              imageSize={'h-16 w-16'}
                            />
                          ) : (
                            <Image
                              src={spec.image || '/placeholder.svg'}
                              alt={spec.name}
                              width={56}
                              height={56}
                              className="h-14 w-14 rounded-lg shadow-lg"
                              unoptimized
                            />
                          )}
                        </div>
                      </div>

                      {/* 직업 정보 */}
                      <div className="min-w-0 flex-1 gap-4">
                        <div className="flex items-start justify-between">
                          <h3 className="truncate text-lg font-bold text-foreground">{gameClass.nameKr}</h3>
                          <div className="text-right">
                            <div className="text-xl font-bold text-foreground">{item.score}%</div>
                            <div className="text-xs text-muted-foreground">적합도</div>
                          </div>
                        </div>
                        <h4 className="mb-1 text-sm font-semibold text-foreground">{spec.nameKr}</h4>
                        <p className="mb-2 text-xs text-muted-foreground">
                          {spec.role === 'tanker' && '🛡️ 탱커'}
                          {spec.role === 'dealer' && '⚔️ 딜러'}
                          {spec.role === 'healer' && '💚 힐러'}
                          {spec.role === 'supporter' && '✨ 서포터'}
                          {spec.role === 'buffer' && '✨ 버퍼'}
                        </p>
                        <p className="mb-2 text-xs font-medium text-primary">{item.reason}</p>
                        <p className="text-xs leading-relaxed text-muted-foreground">{spec.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )
          })}
        </div>

        {/* 축하 메시지 */}
        {visibleCards >= 3 && (
          <div className="animate-slide-up text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/30 bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 px-4 py-3 md:px-6">
              <span className="text-xl md:text-2xl">🎉</span>
              <p className="text-sm font-semibold text-foreground md:text-base">
                축하합니다! 당신의 성향에 꼭 맞는 직업을 찾았습니다
              </p>
              <span className="text-xl md:text-2xl">🎉</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
