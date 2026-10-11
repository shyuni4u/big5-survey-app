import type { ImgHTMLAttributes } from 'react'
import { act, render, screen } from '@testing-library/react'
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

// 순위마다 이유 문구가 달라야 "데스크톱 단상과 모바일 목록 각각에 한 번씩" 그려졌는지 셀 수 있다.
const recommendations: Recommendation[] = [
  { label: 'Mage_Arcane', score: 91, reason: '계획적이고 꼼꼼한, 호기심 많고 새로운 것을 즐기는 성향과 잘 맞아요' },
  { label: 'Rogue_Subtlety', score: 90, reason: '차분하고 독립적인, 계획적이고 꼼꼼한 성향과 잘 맞아요' },
  { label: 'Warlock_Demonology', score: 87, reason: '활동적이고 사교적인, 새로운 것을 즐기는 성향과 잘 맞아요' },
  { label: 'Warlock_Affliction', score: 85, reason: '신중하고 배려심 깊은 성향과 잘 맞아요' },
]

const CONGRATULATION = '축하합니다! 당신의 성향에 꼭 맞는 직업을 찾았습니다'

// 카드는 0.8초 간격으로 하나씩 나타나고 세 장이 모두 나타나면(2.4초) 축하 문구가 뜬다.
const revealAllCards = () => {
  act(() => {
    jest.advanceTimersByTime(2500)
  })
}

describe('RecommendationSection', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('상위 3개의 전문화 이름, 적합도, 이유를 보여 주고 4위는 보여 주지 않는다', () => {
    render(<RecommendationSection game="WoW" recommendations={recommendations} />)
    // 데스크톱 단상과 모바일 목록이 둘 다 DOM에 있어 같은 텍스트가 두 번 나온다.
    expect(screen.getAllByText('비전').length).toBeGreaterThan(0)
    expect(screen.getAllByText('91%').length).toBeGreaterThan(0)
    for (const { reason } of recommendations.slice(0, 3)) {
      expect(screen.getAllByText(reason)).toHaveLength(2)
    }
    expect(screen.queryByText('고통')).toBeNull()
    expect(screen.queryByText('85%')).toBeNull()
    expect(screen.queryByText(recommendations[3].reason)).toBeNull()
  })

  it('추천이 없으면 아무것도 그리지 않는다', () => {
    const { container } = render(<RecommendationSection game="WoW" recommendations={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('카드가 모두 나타나면 축하 문구를 보여 준다', () => {
    render(<RecommendationSection game="WoW" recommendations={recommendations} />)
    expect(screen.queryByText(CONGRATULATION)).toBeNull()
    revealAllCards()
    expect(screen.getByText(CONGRATULATION)).toBeInTheDocument()
  })

  it('추천이 바뀌면 카드가 처음부터 다시 차례로 나타난다', () => {
    const { rerender } = render(<RecommendationSection game="WoW" recommendations={recommendations} />)
    revealAllCards()
    expect(screen.getByText(CONGRATULATION)).toBeInTheDocument()

    rerender(
      <RecommendationSection
        game="WoW"
        recommendations={[recommendations[1], recommendations[0], recommendations[2], recommendations[3]]}
      />,
    )
    expect(screen.queryByText(CONGRATULATION)).toBeNull()
    revealAllCards()
    expect(screen.getByText(CONGRATULATION)).toBeInTheDocument()
  })

  it('화면에 AI라는 단어가 없다', () => {
    render(<RecommendationSection game="WoW" recommendations={recommendations} />)
    expect(screen.queryByText(/AI/)).toBeNull()
    // 축하 문구까지 모두 나타난 뒤에도 없다.
    revealAllCards()
    expect(screen.getByText(CONGRATULATION)).toBeInTheDocument()
    expect(screen.queryByText(/AI/)).toBeNull()
  })
})
