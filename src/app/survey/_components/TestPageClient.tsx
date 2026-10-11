'use client'

import { useState, useEffect, Suspense } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { X } from 'lucide-react'
import { questions, getGameClasses, games } from '@/lib/data'
import type { TestData, UserAnswers } from '@/lib/types'
import { cn, SEPERATE_TOKEN, zipData } from '@/lib/utils'
import { calculateScores } from '@/lib/personality-calculator'
import Link from 'next/link'
import { SpriteIcon } from '@/components/molecules/RecommendationSection'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import toast from 'react-hot-toast'
import { track } from '@/lib/analytics'

function TestContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const userType = searchParams.get('type') as 'existing' | 'new' | null
  const game = searchParams.get('game') || ''

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

  const [completed, setCompleted] = useState(false)
  const [ready, setReady] = useState(false)
  const [missing, setMissing] = useState<number | null>(null)
  const [storageAvailable, setStorageAvailable] = useState(true)
  const storageKey = 'persona-survey-v1-' + game + '-' + userType
  const questionsPerPage = 5

  useEffect(() => {
    if (!games.some((g) => g.id === game) || !userType || !['existing', 'new'].includes(userType)) {
      router.push('/')
      return
    }

    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        const saved = JSON.parse(raw)
        if (
          saved.signature === JSON.stringify(questions) &&
          Array.isArray(saved.order) &&
          saved.order.length === questions.length &&
          new Set(saved.order).size === questions.length &&
          saved.order.every((i: number) => Number.isInteger(i) && i >= 0 && i < questions.length) &&
          saved.answers &&
          Object.entries(saved.answers).every(
            ([k, v]) =>
              Number.isInteger(Number(k)) &&
              Number(k) >= 0 &&
              Number(k) < questions.length &&
              Number.isInteger(v) &&
              Number(v) >= 1 &&
              Number(v) <= 5,
          ) &&
          Number.isInteger(saved.page) &&
          saved.page >= 0 &&
          saved.page < questions.length &&
          saved.page % 5 === 0
        ) {
          setShuffledQuestions(saved.order.map((i: number) => questions[i]))
          setUserAnswers(saved.answers)
          setCompleted(saved.completed === true)
          setCurrentQuestionIndex(saved.page)
          toast.success('이전에 답한 문항을 불러왔어요.')
          setReady(true)
          return
        }
      }
    } catch {
      setStorageAvailable(false)
    }
    const shuffled = [...questions]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    setShuffledQuestions(shuffled)
    setReady(true)
  }, [userType, router, game, storageKey])

  useEffect(() => {
    if (!ready) return
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          completed,
          signature: JSON.stringify(questions),
          order: shuffledQuestions.map((q) => questions.indexOf(q)),
          answers: userAnswers,
          page: currentQuestionIndex,
        }),
      )
    } catch {
      setStorageAvailable(false)
    }
  }, [ready, storageKey, shuffledQuestions, userAnswers, currentQuestionIndex, completed])

  useEffect(() => {
    if (ready) document.getElementById('survey-heading')?.focus()
  }, [currentQuestionIndex, currentStep, ready])

  const handleAnswerChange = (questionIndex: number, value: number) => {
    if (Object.keys(userAnswers).length === 0) track('survey_start', { game })
    setMissing(null)
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
        setMissing(questionIndex)
        document.getElementById(`q${questionIndex}v1`)?.focus()
        document.getElementById(`question-${questionIndex}`)?.scrollIntoView({
          block: 'center',
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        })
        return
      }
    }

    if (currentQuestionIndex + questionsPerPage < shuffledQuestions.length) {
      setCurrentQuestionIndex((prev) => prev + questionsPerPage)
    } else {
      if (!completed) {
        track('survey_complete', { game, question_count: questions.length })
        setCompleted(true)
      }
      setCurrentStep('class-selection')
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
      userType: selectedClassList.length ? 'existing' : 'new',
      personalityScores: calculatedScores,
      currentClass: selectedClassList.map((item) => [item.class, item.spec].join(SEPERATE_TOKEN)),
    }
    try {
      localStorage.removeItem(storageKey)
    } catch {
      /* Storage may be unavailable. */
    }
    const hashedData = zipData(testData)
    router.replace(`/result?data=${hashedData}&game=${game}`)
  }

  if (!userType || !ready) {
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
            <h1
              id="survey-heading"
              tabIndex={-1}
              className="mb-2 font-display text-2xl font-bold text-primary outline-none md:text-3xl"
            >
              마지막으로, 지금 플레이하는 직업이 있나요?
            </h1>
            <p className="text-muted-foreground">
              선택 사항이에요. 입력한 성격 점수와 직업은 추천 모델 개선을 위해 저장됩니다.
            </p>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-8">
          <div className="mb-6 flex flex-wrap justify-center gap-3">
            <Button variant="outline" onClick={() => setCurrentStep('personality')}>
              답변 돌아보기
            </Button>
            <Button onClick={goToResults}>
              {selectedClassList.length ? '선택한 직업과 함께 결과 보기' : '건너뛰고 결과 보기'}
            </Button>
          </div>
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
                size="lg"
                className="h-12 bg-primary text-primary-foreground hover:bg-primary/90"
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
            {games.find((g) => g.id === game)?.name} · 정답은 없어요. 평소의 나를 떠올려보세요.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 pb-32 pt-6">
        <div className="mb-5 flex items-center justify-between text-xs text-muted-foreground">
          <Link href="/" className="underline underline-offset-4">
            게임 선택으로
          </Link>
          <span>{storageAvailable ? '이 기기에 자동 저장 중' : '이 브라우저에서는 자동 저장이 어려워요'}</span>
        </div>
        <p className="mb-4 text-sm text-primary">
          {Math.floor(currentQuestionIndex / 5) + 1} / 8 페이지 ·{' '}
          {currentQuestionIndex >= 30 ? '거의 다 왔어요!' : '나를 알아가는 중'}
        </p>
        <Card className="animate-slide-up border-border bg-card shadow-lg">
          <CardContent className="space-y-8 p-6 md:p-8">
            {questionsToShow.map((question, index) => {
              const questionIndex = currentQuestionIndex + index
              return (
                <fieldset
                  id={`question-${questionIndex}`}
                  key={questionIndex}
                  aria-describedby={missing === questionIndex ? `error-${questionIndex}` : undefined}
                  className={cn(
                    'min-w-0 border-b border-border pb-6 last:border-b-0',
                    missing === questionIndex && 'rounded-lg ring-2 ring-primary ring-offset-4 ring-offset-card',
                  )}
                >
                  <legend className="mb-4 text-lg font-medium leading-relaxed text-foreground md:text-xl">
                    <span className="font-semibold text-primary">{questionIndex + 1}.</span> {question.text}
                  </legend>
                  <div className="grid grid-cols-5 gap-2 md:gap-3">
                    {[
                      { value: 1, label: '전혀 아니다' },
                      { value: 2, label: '아니다' },
                      { value: 3, label: '보통' },
                      { value: 4, label: '그렇다' },
                      { value: 5, label: '매우 그렇다' },
                    ].map(({ value, label }) => (
                      <div key={value}>
                        <input
                          type="radio"
                          id={`q${questionIndex}v${value}`}
                          name={`q${questionIndex}`}
                          value={value}
                          className="peer sr-only"
                          checked={userAnswers[questionIndex] === value}
                          onChange={() => handleAnswerChange(questionIndex, value)}
                        />
                        <label
                          htmlFor={`q${questionIndex}v${value}`}
                          className={cn(
                            'flex min-h-[64px] cursor-pointer items-center justify-center rounded border-2 p-1 text-center transition-all duration-200 hover:scale-105 peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-card md:min-h-[70px] md:p-4',
                            userAnswers[questionIndex] === value
                              ? 'border-primary bg-primary/15 text-primary'
                              : 'border-border bg-secondary text-muted-foreground hover:border-primary/50 hover:bg-secondary/80',
                          )}
                        >
                          <span className="whitespace-normal break-keep text-xs font-medium leading-tight md:text-sm">
                            {label}
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                  {missing === questionIndex && (
                    <p id={`error-${questionIndex}`} role="alert" className="mt-3 text-sm text-primary">
                      이 문항에 답변을 선택해주세요.
                    </p>
                  )}
                </fieldset>
              )
            })}
          </CardContent>
        </Card>
      </main>

      <div className="fixed bottom-0 z-20 w-full border-t border-border bg-card/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-sm">
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
            <Button
              className="h-12"
              type="button"
              onClick={handlePrev}
              disabled={currentQuestionIndex === 0}
              variant="outline"
            >
              이전
            </Button>
            <Button
              type="button"
              onClick={handleNext}
              className="h-12 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isLastPage ? '답변 완료' : '다음'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function TestRoute() {
  const params = useSearchParams()
  return <TestContent key={params.toString()} />
}

export default function TestPageClient() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TestRoute />
    </Suspense>
  )
}
