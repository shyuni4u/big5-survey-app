'use client'

import { useEffect, useRef, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Chart, registerables } from 'chart.js'
import Link from 'next/link'
import { questions, traitInfo, getRecommendedClasses, type GameRecommendation } from '@/lib/data'
import { saveTestResult } from '@/lib/supabase/client'
import type { UserAnswers, PersonalityScores, TestData } from '@/lib/types'
import ResultCard from '@/components/molecules/ResultCard'
import AboutSection from '@/components/molecules/AboutSection'
import GameRecommendationCard from '@/components/molecules/GameRecommendationCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

Chart.register(...registerables)

function ResultContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  const [testData, setTestData] = useState<TestData | null>(null)
  const [scores, setScores] = useState<PersonalityScores | null>(null)
  const [gameRecommendations, setGameRecommendations] = useState<GameRecommendation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    // const dataParam = searchParams.get('data')
    // http://localhost:3000/result?data=test
    const dataParam =
      '%7B%22userType%22%3A%22existing%22%2C%22userAnswers%22%3A%7B%220%22%3A5%2C%221%22%3A4%2C%222%22%3A3%2C%223%22%3A2%2C%224%22%3A1%2C%225%22%3A5%2C%226%22%3A4%2C%227%22%3A3%2C%228%22%3A2%2C%229%22%3A1%2C%2210%22%3A5%2C%2211%22%3A4%2C%2212%22%3A3%2C%2213%22%3A2%2C%2214%22%3A1%2C%2215%22%3A5%2C%2216%22%3A4%2C%2217%22%3A3%2C%2218%22%3A2%2C%2219%22%3A1%2C%2220%22%3A5%2C%2221%22%3A5%2C%2222%22%3A4%2C%2223%22%3A3%2C%2224%22%3A3%2C%2225%22%3A5%2C%2226%22%3A4%2C%2227%22%3A3%2C%2228%22%3A3%2C%2229%22%3A3%2C%2230%22%3A5%2C%2231%22%3A3%2C%2232%22%3A4%2C%2233%22%3A4%2C%2234%22%3A4%2C%2235%22%3A5%2C%2236%22%3A4%2C%2237%22%3A4%2C%2238%22%3A3%2C%2239%22%3A2%7D%2C%22currentClass%22%3A%22%EA%B8%B0%EC%9B%90%EC%82%AC%22%2C%22currentSpec%22%3A%22%EB%B3%B4%EC%A1%B4%22%7D'
    if (!dataParam) {
      router.push('/')
      return
    }

    try {
      const parsedData: TestData = JSON.parse(decodeURIComponent(dataParam))
      setTestData(parsedData)

      const calculatedScores = calculateScores(parsedData.userAnswers)
      setScores(calculatedScores)

      if (parsedData.userType === 'new') {
        const recommendations = getRecommendedClasses(calculatedScores, parsedData.userAnswers)
        setGameRecommendations(recommendations)
      }

      setIsLoading(false)
    } catch (error) {
      console.error('Failed to parse test data:', error)
      router.push('/')
    }
  }, [searchParams, router])

  const calculateScores = (userAnswers: UserAnswers): PersonalityScores => {
    const scores = { E: 0, A: 0, C: 0, N: 0, O: 0 }
    const maxScorePerTrait = { E: 0, A: 0, C: 0, N: 0, O: 0 }

    questions.forEach((q, index) => {
      let score = userAnswers[index] || 3
      if (q.reverse) {
        score = 6 - score
      }
      scores[q.trait] += score
      maxScorePerTrait[q.trait] += 5
    })

    const percentageScores: PersonalityScores = { E: 0, A: 0, C: 0, N: 0, O: 0 }
    for (const trait in scores) {
      const minScore = maxScorePerTrait[trait as keyof typeof maxScorePerTrait] / 5
      const maxScore = maxScorePerTrait[trait as keyof typeof maxScorePerTrait]
      const normalizedScore = ((scores[trait as keyof typeof scores] - minScore) / (maxScore - minScore)) * 100
      percentageScores[trait as keyof PersonalityScores] = Math.round(normalizedScore)
    }

    return percentageScores
  }

  const handleSaveResults = async () => {
    if (!testData || !scores) return

    setIsSaving(true)
    try {
      await saveTestResult({
        userType: testData.userType,
        personalityScores: scores,
        userAnswers: testData.userAnswers,
        currentClass: testData.currentClass,
        currentSpec: testData.currentSpec,
        recommendedJobs: gameRecommendations.map((rec) => ({
          class: rec.class,
          talent: rec.talent,
          score: rec.score,
          matchReason: rec.matchReason,
        })),
      })

      alert('결과가 성공적으로 저장되었습니다!')
    } catch (error) {
      console.error('Failed to save results:', error)
      alert('결과 저장에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    if (chartRef.current && scores) {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }

      const ctx = chartRef.current.getContext('2d')
      if (ctx) {
        const labels = Object.keys(scores).map((trait) => traitInfo[trait as keyof typeof traitInfo].name)
        const data = Object.values(scores)

        chartInstance.current = new Chart(ctx, {
          type: 'radar',
          data: {
            labels: labels,
            datasets: [
              {
                label: '성격 프로필',
                data: data,
                backgroundColor: 'rgba(0, 122, 204, 0.1)',
                borderColor: 'hsl(var(--primary))',
                pointBackgroundColor: 'hsl(var(--primary))',
                pointBorderColor: 'hsl(var(--foreground))',
                pointHoverBackgroundColor: 'hsl(var(--foreground))',
                pointHoverBorderColor: 'hsl(var(--primary))',
                borderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7,
              },
            ],
          },
          options: {
            maintainAspectRatio: false,
            scales: {
              r: {
                angleLines: { color: 'rgba(135, 135, 135, 0.3)' },
                grid: { color: 'rgba(135, 135, 135, 0.3)' },
                pointLabels: {
                  font: { size: 14, weight: 600 },
                  color: 'hsl(var(--foreground))',
                },
                ticks: {
                  backdropColor: 'rgba(37, 37, 38, 0.8)',
                  color: 'hsl(var(--muted-foreground))',
                  stepSize: 25,
                  font: { size: 11 },
                },
                suggestedMin: 0,
                suggestedMax: 100,
              },
            },
            plugins: {
              legend: {
                display: false,
              },
            },
          },
        })
      }
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [scores])

  if (isLoading || !testData || !scores) {
    return (
      <div className="vscode-gradient flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">결과를 분석하고 있습니다...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="vscode-gradient min-h-screen">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 text-center">
          <h1 className="mb-2 font-display text-2xl font-bold text-primary md:text-3xl">성격 분석 결과</h1>
          <p className="text-muted-foreground">
            {testData.userType === 'existing' ? '기존 유저' : '신규 유저'} • 당신의 Big5 성격 특성 프로필입니다
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8">
        <Card className="animate-slide-up border-border bg-card text-center shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-foreground md:text-3xl">성격 분석 결과</CardTitle>
            <CardDescription className="text-muted-foreground">당신의 Big5 성격 특성 프로필입니다</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative mx-auto h-80 max-w-lg md:h-96">
              <canvas ref={chartRef}></canvas>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {Object.entries(scores).map(([trait, score]) => (
            <ResultCard key={trait} trait={trait as keyof typeof traitInfo} score={score} />
          ))}
        </div>

        {testData.userType === 'existing' && testData.currentClass && testData.currentSpec && (
          <Card className="border-border bg-card shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-foreground">현재 플레이 중인 직업</CardTitle>
              <CardDescription className="text-muted-foreground">제공해주신 현재 직업 정보입니다</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="rounded-lg border border-border bg-secondary p-6 text-center">
                <div className="mb-2 text-2xl">🎮</div>
                <h4 className="text-lg font-semibold text-foreground">{testData.currentClass}</h4>
                <p className="font-medium text-primary">{testData.currentSpec}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  이 정보는 더 정확한 추천을 위해 AI 학습에 활용됩니다
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {testData.userType === 'new' && gameRecommendations.length > 0 && (
          <Card className="border-border bg-card shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-foreground">추천 게임 직업</CardTitle>
              <CardDescription className="text-muted-foreground">
                성격 분석을 바탕으로 추천하는 WoW 직업입니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {gameRecommendations.map((recommendation, index) => (
                  <GameRecommendationCard key={index} recommendation={recommendation} rank={index + 1} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <AboutSection />

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            onClick={handleSaveResults}
            disabled={isSaving}
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isSaving ? '저장 중...' : '결과 저장하기'}
          </Button>
          <Button asChild size="lg" variant="outline" className="border-border bg-transparent hover:bg-secondary">
            <Link href="/">새로운 테스트 시작하기</Link>
          </Button>
        </div>
      </main>

      <footer className="mt-16 border-t border-border bg-card/50">
        <div className="mx-auto max-w-7xl px-4 py-6 text-center">
          <p className="text-sm text-muted-foreground">
            Big5 성격 모델을 기반으로 한 과학적 분석 • World of Warcraft 직업 추천
          </p>
        </div>
      </footer>
    </div>
  )
}

export default function ResultPageClient() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResultContent />
    </Suspense>
  )
}
