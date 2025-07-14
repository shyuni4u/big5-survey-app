'use client'

import { useState } from 'react' // useState 훅 추가
import { useRouter } from 'next/navigation' // useRouter 훅 추가
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import clsx from 'clsx' // 조건부 클래스 적용을 위한 clsx 라이브러리 추가 (설치 필요: npm install clsx)

export default function HomePage() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null) // 선택된 게임 상태
  const [selectedUserType, setSelectedUserType] = useState<string | null>(null) // 선택된 유저 유형 상태
  const router = useRouter() // useRouter 훅 초기화

  // 게임 선택 핸들러
  const handleGameSelect = (game: string) => {
    setSelectedGame(game)
  }

  // 유저 유형 선택 핸들러
  const handleUserTypeSelect = (type: string) => {
    setSelectedUserType(type)
  }

  // 테스트 시작 버튼 클릭 핸들러
  const handleStartTest = () => {
    if (selectedGame && selectedUserType) {
      // 선택된 게임과 유저 유형을 쿼리 파라미터로 전달하여 페이지 이동
      router.push(`/survey?game=${selectedGame}&type=${selectedUserType}`)
    }
  }

  // 버튼 활성화 여부
  const isButtonEnabled = selectedGame !== null && selectedUserType !== null

  return (
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
          {['로스트아크', '던파', '와우'].map((game) => (
            <Button
              key={game}
              variant="outline"
              className={clsx(
                'min-w-[120px] transform transition-all duration-200',
                selectedGame === game
                  ? 'scale-105 border-primary bg-primary text-primary-foreground shadow-md'
                  : 'border-gray-300 hover:scale-105 hover:border-primary/50',
              )}
              onClick={() => handleGameSelect(game)}
            >
              {game}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-center text-xl font-semibold text-foreground">어떤 유형의 사용자이신가요?</h3>
        <div className="grid gap-6 md:grid-cols-2">
          {/* 기존 유저 카드 */}
          <div
            className={clsx(
              'block transform cursor-pointer transition-all duration-200',
              selectedUserType === 'existing'
                ? 'scale-105 border-primary shadow-lg'
                : 'hover:scale-105 hover:border-primary/50',
            )}
            onClick={() => handleUserTypeSelect('existing')}
          >
            <Card className="h-full bg-secondary">
              <CardHeader className="text-center">
                <div className="mb-3 text-4xl">🎮</div>
                <CardTitle className="text-foreground">기존 유저</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-center">
                <p className="text-sm text-muted-foreground">
                  현재 플레이 중인 직업이 있으신가요? 성격 분석과 함께 현재 직업 정보를 제공해주시면 더 정확한 분석을
                  받을 수 있습니다.
                </p>
                <Button
                  className={clsx(
                    'w-full',
                    selectedUserType === 'existing'
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'cursor-not-allowed bg-gray-400 text-white',
                  )}
                  disabled={!isButtonEnabled} // 전체 활성화 조건에 따라 비활성화
                  onClick={handleStartTest} // 버튼 클릭 시 페이지 이동
                >
                  테스트 시작하기
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* 신규 유저 카드 */}
          <div
            className={clsx(
              'block transform cursor-pointer transition-all duration-200',
              selectedUserType === 'new'
                ? 'scale-105 border-green-400 shadow-lg'
                : 'hover:scale-105 hover:border-green-400/50',
            )}
            onClick={() => handleUserTypeSelect('new')}
          >
            <Card className="h-full bg-secondary">
              <CardHeader className="text-center">
                <div className="mb-3 text-4xl">✨</div>
                <CardTitle className="text-foreground">신규 유저</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-center">
                <p className="text-sm text-muted-foreground">
                  처음 시작하시거나 새로운 직업을 찾고 계신가요? AI가 당신의 성격을 분석해서 가장 적합한 직업을
                  추천해드립니다.
                </p>
                <Button
                  className={clsx(
                    'w-full',
                    selectedUserType === 'new'
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'cursor-not-allowed bg-gray-400 text-white',
                  )}
                  disabled={!isButtonEnabled} // 전체 활성화 조건에 따라 비활성화
                  onClick={handleStartTest} // 버튼 클릭 시 페이지 이동
                >
                  테스트 시작하기
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </CardContent>
  )
}
