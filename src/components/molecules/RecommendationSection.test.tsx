import type { ImgHTMLAttributes } from 'react'
import { render, screen } from '@testing-library/react'
import RecommendationSection from '@/components/molecules/RecommendationSection'
import type { Recommendation } from '@/lib/types'

// next/image는 jsdom에서 그대로 쓰기 번거로워 일반 img로 바꾼다. unoptimized는 DOM 속성이 아니므로 뺀다.
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    const { unoptimized, ...rest } = props
    void unoptimized
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...(rest as ImgHTMLAttributes<HTMLImageElement>)} />
  },
}))

const recommendations: Recommendation[] = [
  { label: 'Mage_Arcane', score: 91, reason: '계획적이고 꼼꼼한, 호기심 많고 새로운 것을 즐기는 성향과 잘 맞아요' },
  { label: 'Rogue_Subtlety', score: 90, reason: '계획적이고 꼼꼼한, 호기심 많고 새로운 것을 즐기는 성향과 잘 맞아요' },
  {
    label: 'Warlock_Demonology',
    score: 87,
    reason: '계획적이고 꼼꼼한, 호기심 많고 새로운 것을 즐기는 성향과 잘 맞아요',
  },
  { label: 'Warlock_Affliction', score: 85, reason: '차분하고 독립적인, 계획적이고 꼼꼼한 성향과 잘 맞아요' },
]

describe('RecommendationSection', () => {
  it('상위 3개의 전문화 이름, 적합도, 이유를 보여 주고 4위는 보여 주지 않는다', () => {
    render(<RecommendationSection game="WoW" recommendations={recommendations} />)
    // 데스크톱 단상과 모바일 목록이 둘 다 DOM에 있어 같은 텍스트가 두 번 나온다.
    expect(screen.getAllByText('비전').length).toBeGreaterThan(0)
    expect(screen.getAllByText('91%').length).toBeGreaterThan(0)
    expect(screen.getAllByText(recommendations[0].reason).length).toBeGreaterThan(0)
    expect(screen.queryByText('고통')).toBeNull()
    expect(screen.queryByText('85%')).toBeNull()
  })

  it('추천이 없으면 아무것도 그리지 않는다', () => {
    const { container } = render(<RecommendationSection game="WoW" recommendations={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('화면에 AI라는 단어가 없다', () => {
    render(<RecommendationSection game="WoW" recommendations={recommendations} />)
    expect(screen.queryByText(/AI/)).toBeNull()
  })
})
