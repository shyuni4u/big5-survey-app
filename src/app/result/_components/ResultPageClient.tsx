'use client'

import { useEffect, useRef, useState, Suspense, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Chart, registerables } from 'chart.js'
import Link from 'next/link'
import { games, traitInfo } from '@/lib/data'
import { recommend } from '@/lib/recommend'
import type { TestData, PersonalityScores, Recommendation } from '@/lib/types'
import { SEPERATE_TOKEN, zipData, unzipData, hashString } from '@/lib/utils'
import { AdpickBanner } from '@/components/atoms/AdpickBanner'
import { Footer } from '@/components/atoms/Footer'
import ResultCard from '@/components/molecules/ResultCard'
import AboutSection from '@/components/molecules/AboutSection'
import RecommendationSection from '@/components/molecules/RecommendationSection'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Share2 } from 'lucide-react'
import ShareResult from '@/components/molecules/ShareResult'
import { Header } from '@/components/atoms/Header'
import toast from 'react-hot-toast'
import { shareUrl } from '@/lib/sharing'
import { track } from '@/lib/analytics'

Chart.register(...registerables)

function ResultContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)
  const game = searchParams.get('game') || ''

  const savedResults = useRef(new Set<string>())
  const [invalid, setInvalid] = useState(false)
  const [testData, setTestData] = useState<TestData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  // 추천은 동기 순수 함수라 상태가 아니라 파생값으로 둔다. game과 testData가 같은 렌더에서 짝을 이루고,
  // 설문 원점수는 recommend 안에서 모집단 기준으로 정규화된다. 계산이 실패해도 페이지 나머지는 그대로 보여 준다.
  const recommendations = useMemo<Recommendation[]>(() => {
    if (!testData) return []
    try {
      return recommend(game, testData.personalityScores)
    } catch (error) {
      console.error('Failed to compute recommendations:', error)
      return []
    }
  }, [game, testData])

  useEffect(() => {
    const dataParam = searchParams.get('data')
    // Example dataParam values:
    // dealer: /result?data=eJyrViotTi0KqSxIVbJSykstV9JRKkgtKs7PS8zJLKkMTs4vSi1WsqpWclWyMjHRUXIEUmY6Ss5KVmaGOkp-SlZG5jpK_kCeQa2OUnJpUVFqXolzTmIxUE90bC0AWlkcIA&game=LostArk
    // healer: /result?data=eJwNyzEKgDAMBdC7_DlLRVCzibjqoJs4lJJBkCppixTx7nZ98F6kILrmW8Dw8oBwi4bL2_OIeXGXSgC_GMFVS-jBnSEM4LYhTGBTcAbX5iO4pCo-DqcN5Wz79wNbwBwp&game=LostArk

    if (!dataParam || !games.some((g) => g.id === game)) {
      setInvalid(true)
      return
    }
    setInvalid(false)

    try {
      const parsedData: TestData = unzipData(dataParam)
      if (
        !parsedData ||
        !parsedData.personalityScores ||
        !['E', 'A', 'C', 'N', 'O'].every(
          (k) =>
            Number.isFinite(parsedData.personalityScores[k as keyof PersonalityScores]) &&
            parsedData.personalityScores[k as keyof PersonalityScores] >= 0 &&
            parsedData.personalityScores[k as keyof PersonalityScores] <= 100,
        )
      )
        throw new Error('Invalid scores')
      parsedData.personalityScores = Object.fromEntries(
        ['E', 'A', 'C', 'N', 'O'].map((k) => [k, parsedData.personalityScores[k as keyof PersonalityScores]]),
      ) as PersonalityScores
      setTestData(parsedData)

      // 같은 결과(data 파라미터)는 브라우저 세션당 한 번만 저장한다.
      // savedResults 는 한 마운트 안에서의 effect 재실행을, sessionStorage 는 새로고침·재방문을 막는다.
      // 저장에 실패하면 둘 다 지워 다음 시도(새로고침)에서 다시 보낼 수 있게 한다.
      const saveKey = `saved:${game}:${hashString(dataParam)}`
      const readSavedFlag = () => {
        try {
          return sessionStorage.getItem(saveKey) === '1'
        } catch {
          return false
        }
      }
      const writeSavedFlag = (saved: boolean) => {
        try {
          if (saved) sessionStorage.setItem(saveKey, '1')
          else sessionStorage.removeItem(saveKey)
        } catch {
          // sessionStorage 를 쓸 수 없는 환경(프라이빗 모드 등)에서는 savedResults 만으로 가드한다.
        }
      }

      const saveResult = async () => {
        if (!Array.isArray(parsedData.currentClass) || parsedData.currentClass.length === 0) {
          console.warn('클래스 정보가 없습니다. 결과를 저장하지 않습니다.')
          return
        }
        try {
          await Promise.all(
            parsedData.currentClass.map(async (currentClass) => {
              const [_class, _spec] = currentClass.split(SEPERATE_TOKEN)
              const response = await fetch('/api/survey-result', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  app: game,
                  answers: parsedData.personalityScores,
                  class: _class,
                  specialization: _spec,
                }),
              })
              if (!response.ok) throw new Error(`Save failed (${response.status}): ${_class} ${_spec}`)
            }),
          )
          toast.success('선택한 직업 정보를 저장했어요.')
        } catch (error) {
          savedResults.current.delete(saveKey)
          writeSavedFlag(false)
          console.error('Failed to save results:', error)
          toast.error('결과 저장 중 오류가 발생했습니다.')
        }
      }

      if (parsedData.userType === 'existing' && !savedResults.current.has(saveKey) && !readSavedFlag()) {
        savedResults.current.add(saveKey)
        writeSavedFlag(true) // 요청을 보내기 전에 먼저 표시해 동시 실행을 막는다.
        void saveResult()
      }

      setIsLoading(false)
    } catch (error) {
      console.error('Failed to parse test data:', error)
      toast.error('테스트 데이터를 불러오는 데 실패했습니다.')
      setInvalid(true)
    }
  }, [searchParams, router, game])

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
                backgroundColor: 'rgba(110, 231, 183, 0.12)',
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

  const withResultData = useMemo(
    () => (testData ? zipData({ userType: 'new', personalityScores: testData.personalityScores }) : ''),
    [testData],
  )

  const handleShare = async () => {
    if (!testData) return
    const url = shareUrl(
      window.location.origin,
      game,
      typeof navigator.share === 'function' ? 'native' : 'copy_link',
      testData.personalityScores,
    )

    const shareData = {
      title: 'Big5 성격 분석 결과',
      text: `나의 성격 분석 결과와 ${game} 직업 추천을 확인해보세요!`,
      url,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
        track('share', { game, method: 'native', content_type: 'personality_result' })
      } else {
        await navigator.clipboard.writeText(
          shareUrl(window.location.origin, game, 'copy_link', testData.personalityScores),
        )
        track('share', { game, method: 'copy_link', content_type: 'personality_result' })
        toast.success('링크가 클립보드에 복사되었습니다!')
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return
      console.error('공유 실패:', error)
      try {
        await navigator.clipboard.writeText(
          shareUrl(window.location.origin, game, 'copy_link', testData.personalityScores),
        )
        track('share', { game, method: 'copy_link', content_type: 'personality_result' })
        toast.success('링크가 클립보드에 복사되었습니다!')
      } catch (clipboardError) {
        console.error('공유 실패:', clipboardError)
        toast.error('공유하는 데 실패했습니다.')
      }
    }
  }

  if (invalid)
    return (
      <main className="mx-auto max-w-xl px-5 py-24 text-center">
        <h1 className="text-2xl font-bold">결과 링크를 확인해주세요</h1>
        <p className="my-6 text-muted-foreground">링크가 잘렸거나 올바른 결과 데이터가 아니에요.</p>
        <Button asChild>
          <Link href="/">새로운 테스트 시작하기</Link>
        </Button>
      </main>
    )
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
      <Header />
      <header className="border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 text-center">
              <h1 className="mb-2 font-display text-2xl font-bold text-primary md:text-3xl">성격 분석 결과</h1>
              <p className="text-muted-foreground">한 번의 테스트로 발견하는 나의 플레이 스타일</p>
            </div>
            <Button variant="ghost" onClick={handleShare} className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              공유
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-10 px-4 py-8">
        {searchParams.get('ref') === 'share' && (
          <section className="rounded-2xl border border-primary/40 bg-primary/10 p-5 sm:flex sm:items-center sm:justify-between sm:gap-4">
            <div>
              <p className="font-semibold">친구의 결과, 나와는 얼마나 다를까요?</p>
              <p className="mt-1 text-sm text-muted-foreground">내 성향에 어울리는 직업도 찾아보세요.</p>
            </div>
            <Button asChild className="mt-4 h-12 w-full shrink-0 sm:mt-0 sm:w-auto">
              <Link href={`/survey?type=new&game=${game}`} onClick={() => track('share_test_start', { game })}>
                나도 테스트하기
              </Link>
            </Button>
          </section>
        )}
        {/* 성향 기반 추천 결과 섹션 */}
        <RecommendationSection game={game} recommendations={recommendations} />

        <ShareResult game={game} scores={testData.personalityScores} recommendation={recommendations[0]?.label} />
        <section className="rounded-2xl border bg-card p-6">
          <p className="eyebrow">MY PERSONALITY</p>
          <h2 className="mt-3 text-2xl font-bold">내 성향의 눈에 띄는 특징</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {Object.entries(testData.personalityScores)
              .sort((a, b) => Math.abs(b[1] - 50) - Math.abs(a[1] - 50))
              .slice(0, 2)
              .map(([trait, score]) => (
                <span key={trait} className="rounded-full bg-secondary px-4 py-2 text-sm">
                  {traitInfo[trait].name} · {score > 60 ? '높은 편' : score < 40 ? '낮은 편' : '중간 범위'}
                </span>
              ))}
          </div>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            중간값에서 차이가 큰 성향부터 보여드려요. 점수는 응답을 100점 척도로 환산한 값이며, 다른 사람과 비교한
            백분위가 아닙니다. 높고 낮음에 좋고 나쁨은 없어요.
          </p>
        </section>

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

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          {games
            .filter((g) => g.id !== game)
            .map((game) => (
              <Button
                key={game.id}
                asChild
                size="lg"
                variant="outline"
                className="border-border bg-transparent hover:bg-secondary"
              >
                <Link href={`/result?data=${withResultData}&game=${game.id}`}>{game.name} 직업 추천 받기</Link>
              </Button>
            ))}
        </div>
      </main>

      <AdpickBanner />
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
