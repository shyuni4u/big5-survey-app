'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { games } from '@/lib/data'
import type { Game } from '@/lib/types'
import type { Metadata } from 'next'
import { Footer } from '@/components/atoms/Footer'
import { Header } from '@/components/atoms/Header'
import { CoupangPartners } from '@/components/atoms/CoupangPartners'

export const metadata: Metadata = {
  title: `성격 분석 결과 | Big5 게임 직업 추천`,
  description: `당신의 Big5 성격 분석 결과와 추천 게임 직업을 확인해보세요. 과학적 분석을 바탕으로 한 맞춤형 추천입니다.`,
  robots: 'noindex', // 개인 결과 페이지는 검색 결과에서 제외
}

export default function Home() {
  const [selectedGame, setSelectedGame] = useState<Game>(games[1]) // 선택된 게임 상태

  // 게임 선택 핸들러
  const handleGameSelect = (game: Game) => {
    setSelectedGame(game)
  }
  return (
    <div className="min-h-screen">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-8">
        <Card className="animate-slide-up bg-card shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary shadow-lg">
              <svg className="h-10 w-10 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <CardTitle className="text-2xl text-foreground md:text-3xl">성격 분석 테스트</CardTitle>
            <CardDescription className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground">
              과학적으로 검증된 Big5 성격 모델을 통해 당신의 성격을 분석하고, 그에 맞는 게임 직업을 추천해드립니다.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            <div className="space-y-4 text-center">
              <p className="text-muted-foreground">
                <strong className="text-primary">40개의 질문</strong>을 통해 5가지 성격 차원을 분석합니다
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {['외향성', '친화성', '성실성', '신경증', '개방성'].map((trait) => (
                  <Badge key={trait} variant="secondary" className="border-primary/20 bg-primary/10 text-primary">
                    {trait}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Game Selection */}
            <div className="space-y-6">
              <h3 className="text-center text-xl font-semibold text-foreground">어떤 게임을 플레이하시나요?</h3>
              <div className="flex flex-wrap justify-center gap-4">
                {games.map((game, index) => (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -8 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Card
                      className={cn(
                        'group relative flex h-36 w-28 cursor-pointer items-center overflow-hidden rounded-lg border align-middle transition-all duration-300',
                        selectedGame?.id === game.id
                          ? 'border-primary bg-primary/5 shadow-lg shadow-primary/20'
                          : 'border-border bg-card hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10',
                      )}
                      onClick={() => handleGameSelect(game)}
                    >
                      <div className="flex min-h-16 w-16 items-center justify-center">
                        <Image
                          src={game.image || '/placeholder.svg'}
                          alt={game.name}
                          width={64}
                          height={64}
                          className="rounded-xl object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>
                      <h3 className="text-center text-sm font-medium text-foreground transition-colors duration-200 group-hover:text-primary">
                        {game.name}
                      </h3>

                      {/* Hover gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                      {/* Selection indicator */}
                      {selectedGame?.id === game.id && (
                        <motion.div
                          layoutId="selection-indicator"
                          className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5"
                          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-center text-xl font-semibold text-foreground">어떤 유형의 사용자이신가요?</h3>
              <div className="grid gap-6 md:grid-cols-2">
                <Link href={`/survey?type=existing&game=${selectedGame.id}`} className="block">
                  <Card className="h-full transform cursor-pointer bg-secondary transition-all duration-200 hover:scale-105 hover:border-primary/50">
                    <CardHeader className="text-center">
                      <div className="mb-3 text-4xl">🎮</div>
                      <CardTitle className="text-foreground">기존 유저</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-center">
                      <p className="text-sm text-muted-foreground">
                        현재 플레이 중인 직업이 있으신가요? 성격 분석과 함께 현재 직업 정보를 제공해주시면 더 정확한
                        분석을 받을 수 있습니다.
                      </p>
                      <Button className="pointer-events-none bg-primary text-primary-foreground hover:bg-primary/90">
                        테스트 시작하기
                      </Button>
                    </CardContent>
                  </Card>
                </Link>

                <Link href={`/survey?type=new&game=${selectedGame.id}`} className="block">
                  <Card className="h-full transform cursor-pointer bg-secondary transition-all duration-200 hover:scale-105 hover:border-green-400/50">
                    <CardHeader className="text-center">
                      <div className="mb-3 text-4xl">✨</div>
                      <CardTitle className="text-foreground">신규 유저</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-center">
                      <p className="text-sm text-muted-foreground">
                        처음 시작하시거나 새로운 직업을 찾고 계신가요? AI가 당신의 성격을 분석해서 가장 적합한 직업을
                        추천해드립니다.
                      </p>
                      <Button className="pointer-events-none bg-green-600 text-white hover:bg-green-700">
                        테스트 시작하기
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      <CoupangPartners />
      <Footer />
    </div>
  )
}
