import type { GameSpec, PersonalityScores, Trait } from '@/lib/types'

export const TRAITS: readonly Trait[] = ['E', 'A', 'C', 'N', 'O']

export type RoleArchetype = Pick<PersonalityScores, 'A' | 'E' | 'N'>

/** 역할 적합도에 쓰는 역할 원형. C·O는 역할이 아니라 플레이 스타일 축이라 넣지 않는다. */
export const ROLE_ARCHETYPES: Record<GameSpec['role'], RoleArchetype> = {
  tanker: { A: 65, E: 80, N: 25 },
  healer: { A: 90, E: 55, N: 25 },
  supporter: { A: 85, E: 65, N: 30 },
  buffer: { A: 85, E: 60, N: 30 },
  dealer: { A: 40, E: 55, N: 50 },
}

/** 전문화의 시그니처 특성에 주는 가중치 (나머지 특성은 1) */
export const SIGNATURE_WEIGHT = 2
/** 최종 점수 = ROLE_WEIGHT * 역할 적합도 + SPEC_WEIGHT * 전문화 적합도 */
export const ROLE_WEIGHT = 0.35
export const SPEC_WEIGHT = 0.65
/** 같은 게임 안에서 두 전문화 프로필이 가져야 하는 최소 거리 (데이터 불변 조건 테스트에서 사용) */
export const MIN_PROFILE_DISTANCE = 10

/**
 * 전문화 적합도 (0~100). 시그니처 특성은 가중치 2, 나머지는 1인 가중 유클리드 거리를 100에서 뺀다.
 */
export function specFit(scores: PersonalityScores, big5: PersonalityScores, signature: Trait[]): number {
  let weightedSquares = 0
  let totalWeight = 0
  for (const trait of TRAITS) {
    const weight = signature.includes(trait) ? SIGNATURE_WEIGHT : 1
    weightedSquares += weight * (scores[trait] - big5[trait]) ** 2
    totalWeight += weight
  }
  return Math.max(0, 100 - Math.sqrt(weightedSquares / totalWeight))
}

/**
 * 역할 적합도 (0~100). A·E·N 세 특성만으로 역할 원형과의 평균 제곱근 거리를 100에서 뺀다.
 */
export function roleFit(scores: PersonalityScores, role: GameSpec['role']): number {
  const archetype = ROLE_ARCHETYPES[role]
  const meanSquare = ((scores.A - archetype.A) ** 2 + (scores.E - archetype.E) ** 2 + (scores.N - archetype.N) ** 2) / 3
  return Math.max(0, 100 - Math.sqrt(meanSquare))
}

/** 두 프로필의 5차원 유클리드 거리 (가중치 없음) */
export function profileDistance(a: PersonalityScores, b: PersonalityScores): number {
  return Math.sqrt(TRAITS.reduce((sum, trait) => sum + (a[trait] - b[trait]) ** 2, 0))
}

const REASON_PHRASES: Record<Trait, { high: string; low: string }> = {
  E: { high: '외향적이고 활동적인', low: '차분하고 독립적인' },
  A: { high: '배려심 깊고 협력적인', low: '경쟁적이고 자기 주도적인' },
  C: { high: '계획적이고 꼼꼼한', low: '즉흥적이고 자유로운' },
  N: { high: '감정이 풍부하고 열정적인', low: '담대하고 안정적인' },
  O: { high: '호기심 많고 새로운 것을 즐기는', low: '정석을 선호하고 확실한 것을 좋아하는' },
}

/**
 * 추천 이유 한 줄. 전문화의 시그니처 특성과 그 목표값의 방향(50 이상이면 높음)으로 만든다.
 * 유저 값이 아니라 전문화 프로필을 기준으로 삼아 결과가 결정적이게 한다.
 */
export function buildReason(big5: PersonalityScores, signature: Trait[]): string {
  const phrases = signature.map((trait) => (big5[trait] >= 50 ? REASON_PHRASES[trait].high : REASON_PHRASES[trait].low))
  return `${phrases.join(', ')} 성향과 잘 맞아요`
}
