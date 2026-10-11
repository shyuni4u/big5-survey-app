import type { Metadata } from 'next'
import Home from '@/components/atoms/Home'

export const metadata: Metadata = {
  title: `Big5 성격 분석 | 게임 직업 추천 테스트`,
  description: `과학적으로 검증된 Big5 성격 모델을 통해 당신의 성격을 분석하고, 게임에서 가장 적합한 직업을 추천받아보세요.`,
  keywords: ['Big5', '성격 테스트', '게임', '직업 추천', '성격 분석'],
  openGraph: {
    title: `Big5 성격 분석 | 게임 직업 추천`,
    description: `나의 성향을 알아보고 새로운 게임 직업을 발견하세요!`,
    type: 'website',
  },
}

export default function HomePage() {
  return <Home />
}
