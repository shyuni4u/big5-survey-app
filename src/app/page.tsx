import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Big5 성격 분석 | WoW 직업 추천 테스트',
  description:
    '과학적으로 검증된 Big5 성격 모델을 통해 당신의 성격을 분석하고, World of Warcraft에서 가장 적합한 직업을 추천받아보세요.',
  keywords: ['Big5', '성격 테스트', 'WoW', 'World of Warcraft', '직업 추천', '성격 분석'],
  openGraph: {
    title: 'Big5 성격 분석 | WoW 직업 추천',
    description: '당신의 성격에 맞는 완벽한 WoW 직업을 찾아보세요!',
    type: 'website',
  },
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="text-center">
            <h1 className="mb-2 font-display text-3xl font-bold text-primary md:text-4xl">Big5 성격 분석</h1>
            <p className="text-foreground">당신에게 맞는 게임 직업을 찾아보세요</p>
          </div>
        </div>
      </header>

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
              과학적으로 검증된 Big5 성격 모델을 통해 당신의 성격을 분석하고, 그에 맞는 World of Warcraft 직업을
              추천해드립니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="bg-secondary transition-colors hover:border-primary/50">
                <CardHeader className="text-center">
                  <div className="mb-3 text-2xl text-blue-400">📊</div>
                  <CardTitle className="text-base text-foreground">과학적 분석</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-sm text-muted-foreground">Big5 모델 기반의 정확한 성격 분석</p>
                </CardContent>
              </Card>
              <Card className="bg-secondary transition-colors hover:border-primary/50">
                <CardHeader className="text-center">
                  <div className="mb-3 text-2xl text-blue-400">🎮</div>
                  <CardTitle className="text-base text-foreground">게임 직업 추천</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-sm text-muted-foreground">성격에 맞는 WoW 직업과 특성 추천</p>
                </CardContent>
              </Card>
              <Card className="bg-secondary transition-colors hover:border-primary/50">
                <CardHeader className="text-center">
                  <div className="mb-3 text-2xl text-green-400">⚡</div>
                  <CardTitle className="text-base text-foreground">빠른 테스트</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-sm text-muted-foreground">5-10분 내에 완료 가능한 간편한 테스트</p>
                </CardContent>
              </Card>
            </div>

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

            <div className="space-y-6">
              <h3 className="text-center text-xl font-semibold text-foreground">어떤 유형의 사용자이신가요?</h3>
              <div className="grid gap-6 md:grid-cols-2">
                <Link href="/survey?type=existing" className="block">
                  <Card className="h-full transform cursor-pointer bg-secondary transition-all duration-200 hover:scale-105 hover:border-primary/50">
                    <CardHeader className="text-center">
                      <div className="mb-3 text-4xl">🎮</div>
                      <CardTitle className="text-foreground">기존 WoW 유저</CardTitle>
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

                <Link href="/survey?type=new" className="block">
                  <Card className="h-full transform cursor-pointer bg-secondary transition-all duration-200 hover:scale-105 hover:border-green-400/50">
                    <CardHeader className="text-center">
                      <div className="mb-3 text-4xl">✨</div>
                      <CardTitle className="text-foreground">신규 유저</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-center">
                      <p className="text-sm text-muted-foreground">
                        WoW를 처음 시작하시거나 새로운 직업을 찾고 계신가요? AI가 당신의 성격을 분석해서 가장 적합한
                        직업을 추천해드립니다.
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

      {/* Footer */}
      <footer className="mt-16 border-t bg-card/50">
        <div className="mx-auto max-w-7xl px-4 py-6 text-center">
          <p className="text-sm text-muted-foreground">
            Big5 성격 모델을 기반으로 한 과학적 분석 • World of Warcraft 직업 추천
          </p>
        </div>
      </footer>
    </div>
  )
}
