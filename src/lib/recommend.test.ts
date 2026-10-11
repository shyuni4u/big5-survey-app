import { buildReason, profileDistance, roleFit, specFit, ROLE_ARCHETYPES } from '@/lib/recommend'
import type { PersonalityScores } from '@/lib/types'

const scores = (E: number, A: number, C: number, N: number, O: number): PersonalityScores => ({ E, A, C, N, O })

describe('specFit', () => {
  it('프로필과 같은 입력이면 100이다', () => {
    const profile = scores(60, 90, 80, 20, 50)
    expect(specFit(profile, profile, ['A', 'C'])).toBe(100)
  })

  it('시그니처 특성의 차이가 비시그니처 특성의 차이보다 적합도를 더 낮춘다', () => {
    const profile = scores(50, 50, 50, 50, 50)
    const offOnSignature = specFit(scores(50, 80, 50, 50, 50), profile, ['A'])
    const offOnOther = specFit(scores(50, 50, 80, 50, 50), profile, ['A'])
    expect(offOnSignature).toBeLessThan(offOnOther)
  })

  it('가중치 2인 특성 하나만 30 차이 나면 100 - sqrt(2*900/6)이다', () => {
    const profile = scores(50, 50, 50, 50, 50)
    expect(specFit(scores(50, 80, 50, 50, 50), profile, ['A'])).toBeCloseTo(100 - Math.sqrt(300), 5)
  })

  it('결과는 0 아래로 내려가지 않는다', () => {
    expect(specFit(scores(0, 0, 0, 0, 0), scores(100, 100, 100, 100, 100), ['E', 'O'])).toBe(0)
  })
})

describe('roleFit', () => {
  it('중립 입력(모두 50)은 dealer가 가장 높다', () => {
    const neutral = scores(50, 50, 50, 50, 50)
    const roles = Object.keys(ROLE_ARCHETYPES) as (keyof typeof ROLE_ARCHETYPES)[]
    const best = roles.reduce((a, b) => (roleFit(neutral, b) > roleFit(neutral, a) ? b : a))
    expect(best).toBe('dealer')
  })

  it('역할 원형과 같은 A·E·N이면 100이고 다른 역할보다 높다', () => {
    const healerLike = scores(55, 90, 70, 25, 60)
    expect(roleFit(healerLike, 'healer')).toBe(100)
    expect(roleFit(healerLike, 'dealer')).toBeLessThan(roleFit(healerLike, 'healer'))
  })

  it('C와 O는 역할 적합도에 영향을 주지 않는다', () => {
    expect(roleFit(scores(70, 60, 0, 30, 0), 'tanker')).toBe(roleFit(scores(70, 60, 100, 30, 100), 'tanker'))
  })
})

describe('profileDistance', () => {
  it('같은 프로필은 0, 한 특성만 10 차이면 10이다', () => {
    const a = scores(50, 50, 50, 50, 50)
    expect(profileDistance(a, a)).toBe(0)
    expect(profileDistance(a, scores(50, 50, 60, 50, 50))).toBe(10)
  })
})

describe('buildReason', () => {
  it('시그니처 두 개를 높음/낮음 구절로 잇는다', () => {
    expect(buildReason(scores(25, 30, 95, 55, 85), ['C', 'O'])).toBe(
      '계획적이고 꼼꼼한, 호기심 많고 새로운 것을 즐기는 성향과 잘 맞아요',
    )
    expect(buildReason(scores(15, 25, 80, 60, 70), ['E', 'C'])).toBe(
      '차분하고 독립적인, 계획적이고 꼼꼼한 성향과 잘 맞아요',
    )
  })

  it('시그니처가 하나면 구절 하나만 쓴다', () => {
    expect(buildReason(scores(70, 40, 45, 20, 80), ['N'])).toBe('담대하고 안정적인 성향과 잘 맞아요')
  })

  it('50은 높음으로 본다', () => {
    expect(buildReason(scores(50, 50, 50, 50, 50), ['A'])).toBe('배려심 깊고 협력적인 성향과 잘 맞아요')
  })
})
