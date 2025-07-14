import type { Metadata } from 'next'
import { Footer } from '@/components/atoms/Footer'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/atoms/Header'
import { CoupangPartners } from '@/components/atoms/CoupangPartners'
import SelectOption from './_components/SelectOption'

export const metadata: Metadata = {
  title: `성격 분석 결과 | Big5 게임 직업 추천`,
  description: `당신의 Big5 성격 분석 결과와 추천 게임 직업을 확인해보세요. 과학적 분석을 바탕으로 한 맞춤형 추천입니다.`,
  robots: 'noindex', // 개인 결과 페이지는 검색 결과에서 제외
}

export default function ResultPage() {
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
          <SelectOption />
        </Card>
        <CoupangPartners />
      </main>
      <Footer />
    </div>
  )
}
