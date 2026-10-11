import { getGameClasses } from '@/lib/data'
import type { GameSpec, PersonalityScores, Recommendation, Trait } from '@/lib/types'

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

/**
 * 응답자 모집단 기준. 2026-10-11 Supabase survey_results 내보내기에서 완전 중복 행을 제거한 응답자 2,310명의
 * 특성별 평균과 표준편차. 설문 원점수는 이 기준으로 정규화한 뒤(평균 50, 표준편차 1 = 25점) 프로필과 비교한다.
 * 데이터가 더 쌓이면 src/scripts/profile-calibration.js가 출력하는 모집단 통계로 갱신한다. 설계 문서 5.0
 */
export const POPULATION_BASELINE: { mean: PersonalityScores; sd: PersonalityScores } = {
  mean: { E: 39, A: 53, C: 56, N: 49, O: 55 },
  sd: { E: 21, A: 15, C: 18, N: 20, O: 16 },
}
/** 정규화 척도에서 표준편차 1에 해당하는 점수 */
export const SD_SCALE = 25

/**
 * 설문 원점수를 응답자 모집단 기준으로 정규화한다. 모집단 평균이 50, 평균 + 1표준편차가 75가 되고 0~100으로 자른다.
 * 입력 객체는 바꾸지 않는다.
 */
export function normalizeScores(raw: PersonalityScores): PersonalityScores {
  const normalized: PersonalityScores = { ...raw }
  for (const trait of TRAITS) {
    const z = (raw[trait] - POPULATION_BASELINE.mean[trait]) / POPULATION_BASELINE.sd[trait]
    normalized[trait] = Math.min(100, Math.max(0, 50 + SD_SCALE * z))
  }
  return normalized
}

function compareLabel(a: string, b: string): number {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

/**
 * 정규화된 점수로 게임의 모든 전문화에 점수를 매겨 내림차순으로 돌려준다. 화면은 상위 3개를 쓴다.
 * 점수 = round(ROLE_WEIGHT * 역할 적합도 + SPEC_WEIGHT * 전문화 적합도). 동점은 라벨 코드포인트 순.
 */
export function rankSpecs(game: string, scores: PersonalityScores): Recommendation[] {
  return getGameClasses(game)
    .flatMap((gameClass) =>
      gameClass.specs.map((spec) => ({
        label: `${gameClass.name}_${spec.name}`,
        score: Math.round(
          ROLE_WEIGHT * roleFit(scores, spec.role) + SPEC_WEIGHT * specFit(scores, spec.big5, spec.signature),
        ),
        reason: buildReason(spec.big5, spec.signature),
      })),
    )
    .sort((a, b) => b.score - a.score || compareLabel(a.label, b.label))
}

/** 설문 원점수를 받아 정규화한 뒤 순위를 매긴다. 결과 화면은 이 함수를 호출한다. */
export function recommend(game: string, raw: PersonalityScores): Recommendation[] {
  return rankSpecs(game, normalizeScores(raw))
}
