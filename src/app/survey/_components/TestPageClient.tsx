'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { questions, gameClasses as wowClasses } from '@/lib/data'
import type { UserAnswers } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

function TestContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const userType = searchParams.get('type') as 'existing' | 'new' | null

  const [currentStep, setCurrentStep] = useState<'personality' | 'class-selection'>('personality')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({})
  const [shuffledQuestions, setShuffledQuestions] = useState(questions)
  const [selectedClass, setSelectedClass] = useState<string>('')
  const [selectedSpec, setSelectedSpec] = useState<string>('')

  const questionsPerPage = 5

  useEffect(() => {
    if (!userType || !['existing', 'new'].includes(userType)) {
      router.push('/')
      return
    }

    const shuffled = [...questions].sort(() => Math.random() - 0.5)
    setShuffledQuestions(shuffled)
  }, [userType, router])

  const handleAnswerChange = (questionIndex: number, value: number) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionIndex]: value,
    }))
  }

  const handleNext = () => {
    const questionsOnPage = shuffledQuestions.slice(currentQuestionIndex, currentQuestionIndex + questionsPerPage)

    for (let i = 0; i < questionsOnPage.length; i++) {
      const questionIndex = currentQuestionIndex + i
      if (userAnswers[questionIndex] === undefined) {
        alert('현재 페이지의 모든 질문에 답변해주세요.')
        return
      }
    }

    if (currentQuestionIndex + questionsPerPage < shuffledQuestions.length) {
      setCurrentQuestionIndex((prev) => prev + questionsPerPage)
    } else {
      if (userType === 'existing') {
        setCurrentStep('class-selection')
      } else {
        goToResults()
      }
    }
  }

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - questionsPerPage)
    }
  }

  const handleClassSelect = (className: string) => {
    setSelectedClass(className)
    setSelectedSpec('')
  }

  const handleSpecSelect = (specName: string) => {
    setSelectedSpec(specName)
  }

  const goToResults = () => {
    const testData = {
      userType: userType!,
      userAnswers,
      currentClass: selectedClass || undefined,
      currentSpec: selectedSpec || undefined,
    }
    const encodedData = encodeURIComponent(JSON.stringify(testData))
    router.push(`/result?data=${encodedData}`)
  }

  if (!userType) {
    return <div>Loading...</div>
  }

  const questionsToShow = shuffledQuestions.slice(currentQuestionIndex, currentQuestionIndex + questionsPerPage)
  const answeredCount = Object.keys(userAnswers).length
  const progress = (answeredCount / shuffledQuestions.length) * 100
  const isLastPage = currentQuestionIndex + questionsPerPage >= shuffledQuestions.length

  if (currentStep === 'class-selection') {
    const selectedClassData = wowClasses.find((cls) => cls.name === selectedClass)

    return (
      <div className="vscode-gradient min-h-screen">
        <header className="border-b border-border bg-card/80 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-4 py-6 text-center">
            <h1 className="mb-2 font-display text-2xl font-bold text-primary md:text-3xl">
              현재 플레이 중인 직업 선택
            </h1>
            <p className="text-muted-foreground">더 정확한 분석을 위해 현재 직업 정보를 알려주세요</p>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-8">
          <div className="space-y-8">
            <Card className="border-border bg-card shadow-lg">
              <CardHeader>
                <CardTitle className="text-center text-foreground">직업 선택</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
                  {wowClasses.map((wowClass) => (
                    <Button
                      key={wowClass.name}
                      variant={selectedClass === wowClass.name ? 'default' : 'outline'}
                      onClick={() => handleClassSelect(wowClass.name)}
                      className={cn(
                        'flex h-auto flex-col items-center gap-2 p-4 transition-all',
                        selectedClass === wowClass.name
                          ? 'border-primary bg-primary text-primary-foreground shadow-lg'
                          : 'border-border hover:border-primary/50 hover:bg-secondary',
                      )}
                    >
                      <img
                        src={wowClass.image || '/placeholder.svg'}
                        alt={wowClass.name}
                        className="h-12 w-12 rounded"
                        style={{ backgroundColor: wowClass.color }}
                      />
                      <span className="text-sm font-medium">{wowClass.name}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {selectedClassData && (
              <Card className="border-border bg-card shadow-lg">
                <CardHeader>
                  <CardTitle className="text-center text-foreground">{selectedClass} 전문화 선택</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {selectedClassData.specs.map((spec) => (
                      <Button
                        key={spec.name}
                        variant={selectedSpec === spec.name ? 'default' : 'outline'}
                        onClick={() => handleSpecSelect(spec.name)}
                        className={cn(
                          'flex h-auto flex-col items-start p-4 text-left transition-all',
                          selectedSpec === spec.name
                            ? 'border-primary bg-primary text-primary-foreground shadow-lg'
                            : 'border-border hover:border-primary/50 hover:bg-secondary',
                        )}
                      >
                        <div className="mb-2 flex w-full items-center gap-3">
                          <img src={spec.image || '/placeholder.svg'} alt={spec.name} className="h-8 w-8 rounded" />
                          <div className="flex-1">
                            <div className="font-medium">{spec.name}</div>
                            <div className="text-xs opacity-80">
                              {spec.role === 'tanker' && '🛡️ 탱커'}
                              {spec.role === 'dealer' && '⚔️ 딜러'}
                              {spec.role === 'healer' && '💚 힐러'}
                            </div>
                          </div>
                        </div>
                        <p className="text-left text-sm font-normal opacity-80">{spec.description}</p>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="text-center">
              <Button
                onClick={goToResults}
                disabled={!selectedClass || !selectedSpec}
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                결과 보기
              </Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="vscode-gradient min-h-screen">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 text-center">
          <h1 className="mb-2 font-display text-2xl font-bold text-primary md:text-3xl">성격 분석 테스트</h1>
          <p className="text-muted-foreground">
            {userType === 'existing' ? '기존 유저' : '신규 유저'} • 솔직하게 답변해주세요
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <Card className="mb-6 border-border bg-card shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-foreground">진행률</CardTitle>
              <span className="font-medium text-primary">
                {answeredCount} / {shuffledQuestions.length}
              </span>
            </div>
            <CardDescription className="text-muted-foreground">
              페이지 {Math.floor(currentQuestionIndex / questionsPerPage) + 1} /{' '}
              {Math.ceil(shuffledQuestions.length / questionsPerPage)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="h-2 [&>div]:bg-primary" />
          </CardContent>
        </Card>

        <Card className="animate-slide-up border-border bg-card shadow-lg">
          <CardContent className="space-y-8 p-6 md:p-8">
            {questionsToShow.map((question, index) => {
              const questionIndex = currentQuestionIndex + index
              return (
                <div key={questionIndex} className="border-b border-border pb-8 last:border-b-0">
                  <h4 className="mb-6 text-lg font-medium leading-relaxed text-foreground md:text-xl">
                    <span className="font-semibold text-primary">{questionIndex + 1}.</span> {question.text}
                  </h4>
                  <div className="grid grid-cols-5 gap-2 md:gap-3">
                    {[
                      { value: 1, label: '전혀\n아니다', color: 'red' },
                      { value: 2, label: '아니다', color: 'slate' },
                      { value: 3, label: '보통', color: 'gray' },
                      { value: 4, label: '그렇다', color: 'cyan' },
                      { value: 5, label: '매우\n그렇다', color: 'blue' },
                    ].map(({ value, label, color }) => (
                      <div key={value}>
                        <input
                          type="radio"
                          id={`q${questionIndex}v${value}`}
                          name={`q${questionIndex}`}
                          value={value}
                          className="sr-only"
                          checked={userAnswers[questionIndex] === value}
                          onChange={() => handleAnswerChange(questionIndex, value)}
                        />
                        <label
                          htmlFor={`q${questionIndex}v${value}`}
                          className={cn(
                            'block flex min-h-[60px] cursor-pointer items-center justify-center rounded border-2 p-2 text-center transition-all duration-200 hover:scale-105 md:min-h-[80px] md:p-4',
                            userAnswers[questionIndex] === value
                              ? `border-${color}-400 bg-${color}-400/20 text-${color}-400`
                              : 'border-border bg-secondary text-muted-foreground hover:border-primary/50 hover:bg-secondary/80',
                          )}
                        >
                          <span className="whitespace-pre-line text-xs font-medium leading-tight md:text-sm">
                            {label}
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <div className="mt-6 flex items-center justify-between">
          <Button onClick={handlePrev} disabled={currentQuestionIndex === 0} variant="outline">
            이전
          </Button>
          <Button onClick={handleNext} className="bg-primary text-primary-foreground hover:bg-primary/90">
            {isLastPage ? (userType === 'existing' ? '직업 선택하기' : '결과 보기') : '다음'}
          </Button>
        </div>
      </main>
    </div>
  )
}

export default function TestPageClient() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TestContent />
    </Suspense>
  )
}
