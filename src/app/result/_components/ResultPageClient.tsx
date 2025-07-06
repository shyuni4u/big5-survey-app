'use client'

import { useEffect, useRef, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Chart, registerables } from 'chart.js'
import Link from 'next/link'
import { traitInfo } from '@/lib/data'
import type { TestData } from '@/lib/types'
import ResultCard from '@/components/molecules/ResultCard'
import AboutSection from '@/components/molecules/AboutSection'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SEPERATE_TOKEN } from '@/lib/utils'

Chart.register(...registerables)

function ResultContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  const [testData, setTestData] = useState<TestData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // const dataParam = searchParams.get('data') // dummy: http://localhost:3000/result?data=%7B%22userType%22%3A%22existing%22%2C%22personalityScores%22%3A%7B%22E%22%3A50%2C%22A%22%3A63%2C%22C%22%3A56%2C%22N%22%3A38%2C%22O%22%3A53%7D%2C%22currentClass%22%3A%5B%22%EC%82%AC%EC%A0%9C%C2%A0%EC%8B%A0%EC%84%B1%22%2C%22%EC%A3%BC%EC%88%A0%EC%82%AC%C2%A0%EB%B3%B5%EC%9B%90%22%2C%22%EC%84%B1%EA%B8%B0%EC%82%AC%C2%A0%EC%8B%A0%EC%84%B1%22%2C%22%EC%88%98%EB%8F%84%EC%82%AC%C2%A0%EC%9A%B4%EB%AC%B4%22%5D%7D
    const dataParam =
      '%7B%22userType%22%3A%22existing%22%2C%22personalityScores%22%3A%7B%22E%22%3A50%2C%22A%22%3A63%2C%22C%22%3A56%2C%22N%22%3A38%2C%22O%22%3A53%7D%2C%22currentClass%22%3A%5B%22%EC%82%AC%EC%A0%9C%C2%A0%EC%8B%A0%EC%84%B1%22%2C%22%EC%A3%BC%EC%88%A0%EC%82%AC%C2%A0%EB%B3%B5%EC%9B%90%22%2C%22%EC%84%B1%EA%B8%B0%EC%82%AC%C2%A0%EC%8B%A0%EC%84%B1%22%2C%22%EC%88%98%EB%8F%84%EC%82%AC%C2%A0%EC%9A%B4%EB%AC%B4%22%5D%7D'

    if (!dataParam) {
      router.push('/')
      return
    }

    try {
      const parsedData: TestData = JSON.parse(decodeURIComponent(dataParam))
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
          {Object.entries(testData.personalityScores).map(([trait, score]) => (
            <ResultCard key={trait} trait={trait as keyof typeof traitInfo} score={score} />
          ))}
        </div>

        <AboutSection />

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
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
