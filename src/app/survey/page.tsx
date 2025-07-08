import type { Metadata } from 'next'
import { GAME_NAME } from '@/lib/data'
import TestPageClient from './_components/TestPageClient'

export const metadata: Metadata = {
  title: `성격 테스트 진행 중 | Big5 ${GAME_NAME} 직업 추천`,
  description: '40개의 질문을 통해 당신의 성격을 분석하고 있습니다. 정확한 결과를 위해 솔직하게 답변해주세요.',
  robots: 'noindex', // 테스트 진행 페이지는 검색 결과에서 제외
}

export default function TestPage() {
  return <TestPageClient />
}
