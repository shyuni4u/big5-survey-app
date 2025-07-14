import type { Metadata } from 'next'
import ResultPageClient from './_components/ResultPageClient'

export const metadata: Metadata = {
  title: `성격 분석 결과 | Big5 게임 직업 추천`,
  description: `당신의 Big5 성격 분석 결과와 추천 게임 직업을 확인해보세요. 과학적 분석을 바탕으로 한 맞춤형 추천입니다.`,
  robots: 'noindex', // 개인 결과 페이지는 검색 결과에서 제외
}

export default function ResultPage() {
  return <ResultPageClient />
}
