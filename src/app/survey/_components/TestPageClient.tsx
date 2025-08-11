'use client'

import { useState, useEffect, Suspense } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { X } from 'lucide-react'
import { questions, getGameClasses } from '@/lib/data'
import type { TestData, UserAnswers } from '@/lib/types'
import { cn, SEPERATE_TOKEN, zipData } from '@/lib/utils'
import { calculateScores } from '@/lib/personality-calculator'
import { CoupangPartners } from '@/components/atoms/CoupangPartners'
import { SpriteIcon } from '@/components/molecules/RecommendationSection'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import toast from 'react-hot-toast'

function TestContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const userType = searchParams.get('type') as 'existing' | 'new' | null
  const game = searchParams.get('game')
  if (!game) {
    router.push('/')
    throw new Error('게임 정보가 필요합니다.')
  }

  const gameClasses = getGameClasses(game)

  const [currentStep, setCurrentStep] = useState<'personality' | 'class-selection'>('personality')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({})
  const [shuffledQuestions, setShuffledQuestions] = useState(questions)
  const [selectedClass, setSelectedClass] = useState<string>('')
  const [selectedSpec, setSelectedSpec] = useState<string>('')
  const [selectedClassList, setSelectedClassList] = useState<
    {
      class: string
      spec: string
    }[]
  >([])

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
        toast.error('현재 페이지의 모든 질문에 답변해주세요.', {
          duration: 3000,
        })
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
    setSelectedClassList((prev) => {
      const alreadyExists = prev.some((item) => item.class === selectedClass && item.spec === specName)

      if (!alreadyExists) {
        return [...prev, { class: selectedClass, spec: specName }]
      }

      return prev
    })
    setSelectedClass('')
    setSelectedSpec('')
  }

  const handleDeleteClassSpec = (className: string, specName: string) => {
    setSelectedClassList((prev) => prev.filter((item) => !(item.class === className && item.spec === specName)))
  }

  const goToResults = () => {
    const calculatedScores = calculateScores(userAnswers, shuffledQuestions)
    const testData: TestData = {
      userType: userType!,
      personalityScores: calculatedScores,
      currentClass: selectedClassList.map((item) => [item.class, item.spec].join(SEPERATE_TOKEN)),
    }
    const hashedData = zipData(testData)
    router.replace(`/result?data=${hashedData}&game=${game}`)
  }

  if (!userType) {
    return <div>Loading...</div>
  }

  const questionsToShow = shuffledQuestions.slice(currentQuestionIndex, currentQuestionIndex + questionsPerPage)
  const answeredCount = Object.keys(userAnswers).length
  const progress = (answeredCount / shuffledQuestions.length) * 100
  const isLastPage = currentQuestionIndex + questionsPerPage >= shuffledQuestions.length

  if (currentStep === 'class-selection') {
    const selectedClassData = gameClasses.find((cls) => cls.name === selectedClass)

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

        <CoupangPartners />

        <main className="mx-auto max-w-6xl px-4 pb-8">
          <div className="space-y-8">
            <Card className="border-border bg-card shadow-lg">
              <CardHeader>
                <CardTitle className="text-center text-foreground">직업 선택</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
                  {gameClasses.map((gameClass) => (
                    <Button
                      key={gameClass.name}
                      type="button"
                      variant={selectedClass === gameClass.name ? 'default' : 'outline'}
                      onClick={() => handleClassSelect(gameClass.name)}
                      className={cn(
                        'flex h-auto flex-col items-center gap-2 p-4 transition-all',
                        selectedClass === gameClass.name
                          ? 'border-primary bg-primary text-primary-foreground shadow-lg'
                          : 'border-border hover:border-primary/50 hover:bg-secondary',
                      )}
                    >
                      {game.toLowerCase() !== 'dnf' && (
                        <Image
                          src={gameClass.image || '/placeholder.svg'}
                          width="56"
                          height="56"
                          alt={gameClass.name}
                          className="h-12 w-12 rounded"
                          style={{ backgroundColor: gameClass.color }}
                          unoptimized
                        />
                      )}
                      <span className="text-sm font-medium">{gameClass.nameKr}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-lg">
              <CardHeader>
                <CardTitle className="text-center text-foreground">전문화 선택</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {selectedClass !== '' &&
                    selectedClassData &&
                    selectedClassData.specs.map((spec) => (
                      <Button
                        key={spec.name}
                        type="button"
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
                          {game.toLowerCase() === 'dnf' ? (
                            <SpriteIcon
                              imageUrl={selectedClassData.image || '/placeholder.svg'}
                              position={spec.position || '0px 0px'}
                            />
                          ) : (
                            <Image
                              src={spec.image || '/placeholder.svg'}
                              alt={spec.name}
                              className={cn('w-8 rounded', game.toLowerCase() === 'lostark' ? 'h-9' : 'h-8')}
                              width="56"
                              height="56"
                              unoptimized
                            />
                          )}

                          <div className="flex-1">
                            <div className="font-medium">{spec.nameKr}</div>
                            <div className="text-xs opacity-80">
                              {spec.role === 'tanker' && '🛡️ 탱커'}
                              {spec.role === 'dealer' && '⚔️ 딜러'}
                              {spec.role === 'healer' && '💚 힐러'}
                              {spec.role === 'supporter' && '✨ 서포터'}
                              {spec.role === 'buffer' && '✨ 버퍼'}
                            </div>
                          </div>
                        </div>
                        <span className="whitespace-normal text-left text-sm font-normal opacity-80">
                          {spec.description}
                        </span>
                      </Button>
                    ))}
                </div>
              </CardContent>
            </Card>

            {selectedClassList.length > 0 && (
              <Card className="border-border bg-card shadow-lg">
                <CardHeader>
                  <CardTitle className="text-center text-foreground">내가 하는 직업 목록</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {selectedClassList.map((obj) => {
                      const _class = gameClasses.find((c) => c.name === obj.class)!
                      const _spec = _class.specs.find((s) => s.name === obj.spec)!

                      return (
                        <div
                          key={`${_class.name}-${_spec.name}`}
                          onClick={() => handleDeleteClassSpec(_class.name, _spec.name)}
                          className="group relative cursor-pointer rounded-lg border border-primary bg-secondary p-4 text-left shadow-lg transition-all hover:border-destructive"
                        >
                          <button
                            aria-label="선택 해제"
                            className="absolute -right-2 -top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full border bg-background text-muted-foreground opacity-0 transition-all group-hover:border-destructive group-hover:text-destructive group-hover:opacity-100"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          <div className="mb-2 flex w-full items-center gap-3">
                            {game.toLowerCase() === 'dnf' ? (
                              <SpriteIcon
                                imageUrl={_class.image || '/placeholder.svg'}
                                position={_spec.position || '0px 0px'}
                              />
                            ) : (
                              <Image
                                src={_spec.image || '/placeholder.svg'}
                                alt={_spec.name}
                                className={cn('w-8 rounded', game.toLowerCase() === 'lostark' ? 'h-9' : 'h-8')}
                                width="56"
                                height="56"
                                unoptimized
                              />
                            )}
                            <div className="flex-1">
                              <div className="font-medium text-foreground">{_spec.nameKr}</div>
                              <div className="text-xs text-muted-foreground">
                                {_spec.role === 'tanker' && '🛡️ 탱커'}
                                {_spec.role === 'dealer' && '⚔️ 딜러'}
                                {_spec.role === 'healer' && '💚 힐러'}
                                {_spec.role === 'supporter' && '✨ 서포터'}
                                {_spec.role === 'buffer' && '✨ 버퍼'}
                              </div>
                            </div>
                          </div>
                          <span className="whitespace-normal text-left text-sm font-normal text-muted-foreground">
                            {_spec.description}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="text-center">
              <Button
                type="button"
                onClick={goToResults}
                disabled={selectedClassList.length === 0}
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

      <CoupangPartners />

      <main className="mx-auto max-w-4xl px-4 pb-24">
        <Card className="animate-slide-up border-border bg-card shadow-lg">
          <CardContent className="space-y-8 p-6 md:p-8">
            {questionsToShow.map((question, index) => {
              const questionIndex = currentQuestionIndex + index
              return (
                <div key={questionIndex} className="border-b border-border pb-6 last:border-b-0">
                  <h4 className="mb-4 text-lg font-medium leading-relaxed text-foreground md:text-xl">
                    <span className="font-semibold text-primary">{questionIndex + 1}.</span> {question.text}
                  </h4>
                  <div className="grid grid-cols-5 gap-2 md:gap-3">
                    {[
                      { value: 1, label: '전혀 아니다', color: 'red' },
                      { value: 2, label: '아니다', color: 'orange' },
                      { value: 3, label: '보통', color: 'gray' },
                      { value: 4, label: '그렇다', color: 'cyan' },
                      { value: 5, label: '매우 그렇다', color: 'blue' },
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
                            'flex min-h-[50px] cursor-pointer items-center justify-center rounded border-2 p-2 text-center transition-all duration-200 hover:scale-105 md:min-h-[70px] md:p-4',
                            userAnswers[questionIndex] === value
                              ? color === 'red'
                                ? 'border-red-400 bg-red-400/20 text-red-400'
                                : color === 'orange'
                                  ? 'border-orange-400 bg-orange-400/20 text-orange-400'
                                  : color === 'gray'
                                    ? 'border-gray-400 bg-gray-400/20 text-gray-400'
                                    : color === 'cyan'
                                      ? 'border-cyan-400 bg-cyan-400/20 text-cyan-400'
                                      : 'border-blue-400 bg-blue-400/20 text-blue-400'
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
      </main>

      <div className="sticky bottom-0 w-full border-t border-border bg-card/95 p-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center gap-4">
          <div className="flex-1">
            <div className="mb-1 flex justify-between text-sm">
              <span className="font-semibold text-foreground">진행률</span>
              <span className="font-medium text-primary">
                {answeredCount} / {shuffledQuestions.length}
              </span>
            </div>
            <Progress value={progress} className="h-2 [&>div]:bg-primary" />
          </div>
          <div className="h-10 w-px bg-border" />
          <div className="flex items-center gap-2">
            <Button type="button" onClick={handlePrev} disabled={currentQuestionIndex === 0} variant="outline">
              이전
            </Button>
            <Button
              type="button"
              onClick={handleNext}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isLastPage ? (userType === 'existing' ? '직업 선택하기' : '결과 보기') : '다음'}
            </Button>
          </div>
        </div>
      </div>
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
