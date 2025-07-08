'use client'

import { useEffect, useRef, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Chart, registerables } from 'chart.js'
import Link from 'next/link'
import { GAME_NAME, traitInfo } from '@/lib/data'
import { predict } from '@/lib/onnx'
import type { TestData, PersonalityScores } from '@/lib/types'
import ResultCard from '@/components/molecules/ResultCard'
import AboutSection from '@/components/molecules/AboutSection'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SEPERATE_TOKEN, zipData, unzipData } from '@/lib/utils'
import RecommendationSection from '@/components/molecules/RecommendationSection'
import { Share2 } from 'lucide-react'
import { Footer } from '@/components/atoms/Footer'

Chart.register(...registerables)

function ResultContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  const [testData, setTestData] = useState<TestData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [recommendations, setRecommendations] = useState<
    {
      label: string
      score: number
    }[]
  >([])
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false)
  const [recommendationError, setRecommendationError] = useState<string>('')

  useEffect(() => {
    const dataParam = searchParams.get('data') // /result?data=eJyrViotTi0KqSxIVbJSykstV9JRKkgtKs7PS8zJLKkMTs4vSi1WsqpWclWyMjHRUXIEUmY6Ss5KVmaGOkp-SlZG5jpK_kCeQa2OUnJpUVFqXolzTmIxUE90bC0AWlkcIA

    if (!dataParam) {
      router.push('/')
      return
    }

    try {
      const parsedData: TestData = unzipData(dataParam)
      setTestData(parsedData)

      const saveResult = async () => {
        try {
          if (Array.isArray(parsedData.currentClass) && parsedData.currentClass.length > 0) {
            parsedData.currentClass.forEach(async (currentClass) => {
              const _class = currentClass.split(SEPERATE_TOKEN)[0]!
              const _spec = currentClass.split(SEPERATE_TOKEN)[1]!

              await fetch('/api/survey-result', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  app: 'wow',
                  answers: parsedData.personalityScores,
                  class: _class,
                  specialization: _spec,
                }),
              })

              console.info('결과가 성공적으로 저장되었습니다!', _class, _spec)
            })
          } else {
            console.warn('클래스 정보가 없습니다. 결과를 저장하지 않습니다.')
          }
        } catch (error) {
          console.error('Failed to save results:', error)
        }
      }

      if (parsedData.userType === 'existing') saveResult()

      setIsLoading(false)

      // Fetch AI recommendations
      fetchRecommendations(parsedData.personalityScores)
    } catch (error) {
      console.error('Failed to parse test data:', error)
      router.push('/')
    }
  }, [searchParams, router])

  useEffect(() => {
    const scores = testData?.personalityScores

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
                borderColor: 'hsl(210 40% 98%)',
                pointBackgroundColor: 'hsl(210 40% 98%)',
                pointBorderColor: 'hsl(210 40% 98%)',
                pointHoverBackgroundColor: 'hsl(210 40% 98%)',
                pointHoverBorderColor: 'hsl(210 40% 98%)',
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
                  color: 'hsl(210 40% 98%)',
                },
                ticks: {
                  backdropColor: 'rgba(37, 37, 38, 0.8)',
                  color: 'hsl(215 20.2% 65.1%)',
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
  }, [testData?.personalityScores])

  const fetchRecommendations = async (personalityScores: PersonalityScores) => {
    setIsLoadingRecommendations(true)
    setRecommendationError('')
    try {
      const data = await predict(personalityScores)
      setRecommendations(data.top_5_recommendations || [])
    } catch (error) {
      console.error('Failed to get recommendations locally:', error)
      setRecommendationError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.')
    } finally {
      setIsLoadingRecommendations(false)
    }
  }

  const handleShare = async () => {
    const dataParam = searchParams.get('data')! // http://localhost:3000/result?data=eJyrViotTi0KqSxIVbJSykstV9JRKkgtKs7PS8zJLKkMTs4vSi1WsqpWclWyMjPQUXKEUM5KVqbGOkp-QMpIR8lfycrYsFZHKbm0qCg1r8Q5J7EYqCc6thYAWRMcFw
    const parsedData: TestData = unzipData(dataParam)
    const url = `${window.location.origin}/result?data=${zipData({
      ...parsedData,
      userType: 'new',
    })}`

    const shareData = {
      title: 'Big5 성격 분석 결과',
      text: `나의 성격 분석 결과와 ${GAME_NAME} 직업 추천을 확인해보세요!`,
      url,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(url)
        alert('링크가 클립보드에 복사되었습니다!')
      }
    } catch (error) {
      console.error('공유 실패:', error)
      try {
        await navigator.clipboard.writeText(url)
        alert('링크가 클립보드에 복사되었습니다!')
      } catch (clipboardError) {
        console.error('공유 실패:', clipboardError)
      }
    }
  }

  if (isLoading || !testData) {
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
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 text-center">
              <h1 className="mb-2 font-display text-2xl font-bold text-primary md:text-3xl">성격 분석 결과</h1>
              <p className="text-muted-foreground">
                {testData.userType === 'existing' ? '기존 유저' : '신규 유저'} • 당신의 Big5 성격 특성 프로필입니다
              </p>
            </div>
            <Button variant="ghost" onClick={handleShare} className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              공유
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8">
        {/* AI 추천 결과 섹션 */}
        <RecommendationSection
          recommendations={recommendations}
          isLoading={isLoadingRecommendations}
          error={recommendationError}
        />
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
          {Object.entries(testData.personalityScores).map(([trait, score]) => (
            <ResultCard key={trait} trait={trait as keyof typeof traitInfo} score={score} />
          ))}
        </div>

        <AboutSection />

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild size="lg" variant="outline" className="border-border bg-transparent hover:bg-secondary">
            <Link href="/">새로운 테스트 시작하기</Link>
          </Button>
          <Button onClick={handleShare} size="lg" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            결과 공유하기
          </Button>
        </div>
      </main>

      <Footer />
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
