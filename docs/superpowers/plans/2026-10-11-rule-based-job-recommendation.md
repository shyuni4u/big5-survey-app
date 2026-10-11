# 규칙 기반 직업 추천 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 브라우저 ONNX 추론을 제거하고, 전문화별 Big5 목표 프로필과 역할 원형을 이용한 규칙 기반 점수로 게임별 직업 추천을 계산해 적합도와 한 줄 이유를 보여 준다.

**Architecture:** `src/lib/data.ts`의 각 전문화에 `big5`(목표 성향)와 `signature`(가중치 2배 특성)를 필수 필드로 추가한다. 새 모듈 `src/lib/recommend.ts`가 역할 적합도(A·E·N, 역할 원형과의 거리)와 전문화 적합도(5개 특성 가중 거리)를 35:65로 섞어 0~100 정수 점수를 내고 정렬된 목록을 돌려준다. 결과 화면은 이 동기 함수를 호출해 상위 3개를 그린다.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript 5.9, Jest 30 + next/jest (SWC, jsdom) + Testing Library, Prettier 3 (semi 없음, 작은따옴표, printWidth 120), Node 22.

**Spec:** `docs/superpowers/specs/2026-10-11-rule-based-job-recommendation-design.md`

## Global Constraints

- 라벨 형식은 기존과 같이 `${class.name}_${spec.name}` (예: `Mage_Arcane`, `Gunner (F)_Launcher`).
- 특성 순서는 항상 E, A, C, N, O. `PersonalityScores`는 0~100 정수.
- 역할 원형(A/E/N): tanker 65/80/25, healer 90/55/25, supporter 85/65/30, buffer 85/60/30, dealer 40/55/50.
- 상수: `SIGNATURE_WEIGHT = 2`, `ROLE_WEIGHT = 0.35`, `SPEC_WEIGHT = 0.65`, `MIN_PROFILE_DISTANCE = 10`.
- 역할별 A·E·N 허용 범위: tanker A 55~80 E 65~90 N 15~35, healer A 80~95 E 45~75 N 15~35, supporter/buffer A 75~95 E 50~80 N 20~45, dealer A 15~90 E 15~90 N 20~85.
- 추천 이유 문구 표(특성: 높음 / 낮음): E "외향적이고 활동적인" / "차분하고 독립적인", A "배려심 깊고 협력적인" / "경쟁적이고 자기 주도적인", C "계획적이고 꼼꼼한" / "즉흥적이고 자유로운", N "감정이 풍부하고 열정적인" / "담대하고 안정적인", O "호기심 많고 새로운 것을 즐기는" / "정석을 선호하고 확실한 것을 좋아하는". 50 이상이면 높음.
- 화면 문구에서 "AI"라는 단어를 쓰지 않는다. 추천 섹션 축하 문구는 "축하합니다! 당신의 성향에 꼭 맞는 직업을 찾았습니다".
- 코드 스타일은 저장소 Prettier 설정을 따른다. 커밋 메시지는 한국어, 마지막 줄에 `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
- 이 워크트리에는 `node_modules`가 없다. 첫 작업에서 `npm ci`를 먼저 실행한다.
- `next build`는 Supabase 환경 변수 없이는 API 라우트에서 실패할 수 있으므로 검증은 `npx tsc --noEmit`, `npm run lint`, `npm test`로 한다.

---

### Task 1: 추천 계산 함수와 단위 테스트

**Files:**
- Modify: `src/lib/types.ts`
- Create: `src/lib/recommend.ts`
- Create: `src/lib/recommend.test.ts`

**Interfaces:**
- Consumes: `PersonalityScores`, `GameSpec['role']` (기존 `src/lib/types.ts`)
- Produces:
  - `type Trait = 'E' | 'A' | 'C' | 'N' | 'O'`, `type Recommendation = { label: string; score: number; reason: string }` (types.ts)
  - `TRAITS: readonly Trait[]`, `ROLE_ARCHETYPES`, `SIGNATURE_WEIGHT`, `ROLE_WEIGHT`, `SPEC_WEIGHT`, `MIN_PROFILE_DISTANCE`
  - `specFit(scores: PersonalityScores, big5: PersonalityScores, signature: Trait[]): number`
  - `roleFit(scores: PersonalityScores, role: GameSpec['role']): number`
  - `profileDistance(a: PersonalityScores, b: PersonalityScores): number`
  - `buildReason(big5: PersonalityScores, signature: Trait[]): string`

- [ ] **Step 1: 의존성 설치와 기준선 확인**

Run:
```bash
npm ci
npx tsc --noEmit && npm run lint && npm test
```
Expected: 세 명령 모두 성공 (기존 테스트 통과). 실패하면 원인을 기록하고 멈춘다. 이후 작업은 이 기준선 위에서 진행한다.

- [ ] **Step 2: 타입 추가**

`src/lib/types.ts` 맨 위에 `Trait`를 추가하고 `Question.trait`가 이를 쓰게 바꾼다. 파일 끝에 `Recommendation`을 추가한다.

```ts
export type Trait = 'E' | 'A' | 'C' | 'N' | 'O'

export type Question = {
  text: string
  trait: Trait
  reverse: boolean
  weight: number
}
```

파일 끝:

```ts
export type Recommendation = {
  label: string
  score: number
  reason: string
}
```

- [ ] **Step 3: 실패하는 단위 테스트 작성**

`src/lib/recommend.test.ts`:

```ts
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
    expect(buildReason(scores(15, 25, 80, 60, 70), ['E', 'C'])).toBe('차분하고 독립적인, 계획적이고 꼼꼼한 성향과 잘 맞아요')
  })

  it('시그니처가 하나면 구절 하나만 쓴다', () => {
    expect(buildReason(scores(70, 40, 45, 20, 80), ['N'])).toBe('담대하고 안정적인 성향과 잘 맞아요')
  })

  it('50은 높음으로 본다', () => {
    expect(buildReason(scores(50, 50, 50, 50, 50), ['A'])).toBe('배려심 깊고 협력적인 성향과 잘 맞아요')
  })
})
```

- [ ] **Step 4: 테스트가 실패하는지 확인**

Run: `npx jest src/lib/recommend.test.ts`
Expected: FAIL. `Cannot find module '@/lib/recommend'`.

- [ ] **Step 5: recommend.ts 구현**

`src/lib/recommend.ts`:

```ts
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
  const meanSquare =
    ((scores.A - archetype.A) ** 2 + (scores.E - archetype.E) ** 2 + (scores.N - archetype.N) ** 2) / 3
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
```

- [ ] **Step 6: 테스트 통과 확인**

Run: `npx prettier --write src/lib/recommend.ts src/lib/recommend.test.ts src/lib/types.ts && npx jest src/lib/recommend.test.ts && npx tsc --noEmit && npm run lint`
Expected: 테스트 11개 PASS, tsc와 lint 오류 없음.

- [ ] **Step 7: 커밋**

```bash
git add src/lib/types.ts src/lib/recommend.ts src/lib/recommend.test.ts
git commit -F - <<'EOF'
규칙 기반 추천 계산 함수 추가 (specFit, roleFit, buildReason)

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
EOF
```

---

### Task 2: 전문화 프로필 데이터 주입과 불변 조건 테스트

**Files:**
- Modify: `src/lib/types.ts` (`GameSpec`)
- Modify: `src/lib/data.ts` (136개 전문화에 `big5`, `signature` 추가. 임시 스크립트로 주입)
- Modify: `src/lib/recommend.test.ts` (불변 조건 블록 추가)
- 임시 생성 후 삭제: `add-profiles.tmp.js` (저장소 루트, 커밋하지 않음)

**Interfaces:**
- Consumes: `profileDistance`, `MIN_PROFILE_DISTANCE`, `TRAITS` (Task 1), `getGameClasses` (기존 data.ts)
- Produces: `GameSpec.big5: PersonalityScores`, `GameSpec.signature: Trait[]` (필수 필드). 이후 모든 작업이 `spec.big5`, `spec.signature`를 읽는다.

- [ ] **Step 1: 실패하는 불변 조건 테스트 추가**

`src/lib/recommend.test.ts` 맨 위 import를 다음으로 바꾸고, 파일 끝에 블록을 추가한다.

```ts
import { buildReason, profileDistance, roleFit, specFit, MIN_PROFILE_DISTANCE, ROLE_ARCHETYPES, TRAITS } from '@/lib/recommend'
import { getGameClasses } from '@/lib/data'
import type { GameSpec, PersonalityScores } from '@/lib/types'
```

파일 끝:

```ts
const GAMES = ['wow', 'lostark', 'dnf'] as const

/** 설계 문서 4.3의 역할별 A·E·N 허용 범위 */
const ROLE_TRAIT_RANGES: Record<GameSpec['role'], { A: [number, number]; E: [number, number]; N: [number, number] }> = {
  tanker: { A: [55, 80], E: [65, 90], N: [15, 35] },
  healer: { A: [80, 95], E: [45, 75], N: [15, 35] },
  supporter: { A: [75, 95], E: [50, 80], N: [20, 45] },
  buffer: { A: [75, 95], E: [50, 80], N: [20, 45] },
  dealer: { A: [15, 90], E: [15, 90], N: [20, 85] },
}

const specsOf = (game: string) =>
  getGameClasses(game).flatMap((gameClass) =>
    gameClass.specs.map((spec) => ({ label: `${gameClass.name}_${spec.name}`, spec })),
  )

describe.each(GAMES)('%s 프로필 데이터 불변 조건', (game) => {
  const specs = specsOf(game)

  it('전문화가 하나 이상 있다', () => {
    expect(specs.length).toBeGreaterThan(0)
  })

  it('모든 전문화에 0~100 정수 big5와 1~2개의 서로 다른 시그니처가 있다', () => {
    const violations: string[] = []
    for (const { label, spec } of specs) {
      for (const trait of TRAITS) {
        const value = spec.big5[trait]
        if (!Number.isInteger(value) || value < 0 || value > 100) violations.push(`${label}.${trait}=${value}`)
      }
      const unique = new Set(spec.signature).size
      if (spec.signature.length < 1 || spec.signature.length > 2 || unique !== spec.signature.length) {
        violations.push(`${label}.signature=[${spec.signature.join(',')}]`)
      }
    }
    expect(violations).toEqual([])
  })

  it('A·E·N이 역할별 허용 범위 안에 있다', () => {
    const violations: string[] = []
    for (const { label, spec } of specs) {
      const ranges = ROLE_TRAIT_RANGES[spec.role]
      for (const trait of ['A', 'E', 'N'] as const) {
        const [lo, hi] = ranges[trait]
        const value = spec.big5[trait]
        if (value < lo || value > hi) violations.push(`${label} (${spec.role}) ${trait}=${value} not in ${lo}~${hi}`)
      }
    }
    expect(violations).toEqual([])
  })

  it(`프로필이 같은 쌍이 없고 가장 가까운 쌍도 거리 ${MIN_PROFILE_DISTANCE} 이상이다`, () => {
    const tooClose: string[] = []
    for (let i = 0; i < specs.length; i++) {
      for (let j = i + 1; j < specs.length; j++) {
        const distance = profileDistance(specs[i].spec.big5, specs[j].spec.big5)
        if (distance < MIN_PROFILE_DISTANCE) tooClose.push(`${specs[i].label} ~ ${specs[j].label} = ${distance.toFixed(1)}`)
      }
    }
    expect(tooClose).toEqual([])
  })
})

it('던파 남/여 동명 전직 9쌍은 서로 다른 프로필을 가진다', () => {
  const specs = specsOf('dnf')
  const names = ['Nen Master', 'Striker', 'Brawler', 'Grappler', 'Ranger', 'Launcher', 'Mechanic', 'Spitfire', 'Crusader']
  const tooClose: string[] = []
  for (const name of names) {
    const pair = specs.filter((s) => s.spec.name === name)
    expect(pair).toHaveLength(2)
    const distance = profileDistance(pair[0].spec.big5, pair[1].spec.big5)
    if (distance < MIN_PROFILE_DISTANCE) tooClose.push(`${name}: ${distance.toFixed(1)}`)
  }
  expect(tooClose).toEqual([])
})
```

- [ ] **Step 2: 테스트가 실패하는지 확인**

Run: `npx jest src/lib/recommend.test.ts`
Expected: 불변 조건 테스트들이 FAIL (`spec.big5`가 undefined). Task 1의 테스트는 계속 PASS.

- [ ] **Step 3: GameSpec 타입에 필수 필드 추가**

`src/lib/types.ts`의 `GameSpec`:

```ts
export type GameSpec = {
  name: string
  nameKr: string
  role: 'tanker' | 'dealer' | 'healer' | 'supporter' | 'buffer'
  position?: string
  image?: string
  description: string
  /** 이 전문화에 가장 잘 맞는 성향의 목표값 (0~100). 설계 문서 4.3 */
  big5: PersonalityScores
  /** 이 전문화를 정의하는 특성 1~2개. 적합도 계산에서 가중치 2배 */
  signature: Trait[]
}
```

- [ ] **Step 4: 프로필 주입 스크립트 작성 (임시 파일)**

저장소 루트에 `add-profiles.tmp.js`를 만든다. 이 스크립트는 `src/lib/data.ts`의 모든 `        role: '...',` 줄(들여쓰기 8칸) 바로 뒤에 `big5`와 `signature` 줄을 넣는다. 들여쓰기 규칙은 현재 data.ts(Prettier 포맷)에 맞춘 것이다: 직업 `name`은 4칸, 전문화 `name`/`role`은 8칸.

```js
// 임시 스크립트. src/lib/data.ts의 각 전문화에 big5/signature 필드를 삽입한다. 실행 후 삭제할 것.
const fs = require('fs')
const path = require('path')

// 순서: E, A, C, N, O, signature. 설계 문서 4.3의 축 기준으로 작성.
const P = (E, A, C, N, O, signature) => ({ E, A, C, N, O, signature })

const PROFILES = {
  wow: {
    // 탱커
    'Death Knight_Blood': P(75, 55, 80, 30, 55, ['E', 'C']), // 혈기: 자가 회복, 책임감 있는 리더
    'Demon Hunter_Vengeance': P(85, 65, 65, 25, 75, ['E', 'O']), // 복수: 기동성 있고 공격적인 탱커
    'Druid_Guardian': P(70, 75, 65, 20, 40, ['A', 'N']), // 수호: 단순하고 든든한 곰
    'Monk_Brewmaster': P(70, 65, 75, 30, 85, ['O', 'C']), // 양조: 시간차 피해, 유연하고 독특
    'Paladin_Protection': P(80, 80, 90, 20, 40, ['A', 'C']), // 보호: 질서, 보호, 정석
    'Warrior_Protection': P(90, 65, 85, 15, 35, ['E', 'N']), // 방어: 최전선 리더, 클래식
    // 힐러
    'Druid_Restoration': P(55, 85, 80, 25, 70, ['A', 'C']), // 회복: 지속 치유, 계획적
    'Evoker_Preservation': P(60, 85, 70, 30, 85, ['A', 'O']), // 보존: 유연하고 새로운 힐러
    'Monk_Mistweaver': P(70, 80, 65, 25, 75, ['E', 'O']), // 운무: 근접 힐, 기동성
    'Paladin_Holy': P(70, 90, 85, 20, 40, ['A', 'C']), // 신성(기사): 전방 보호형 정석 힐러
    'Priest_Discipline': P(45, 80, 90, 30, 80, ['C', 'O']), // 수양: 피해로 치유, 복잡하고 지적
    'Priest_Holy': P(50, 95, 75, 20, 50, ['A', 'N']), // 신성(사제): 순수 치유, 침착
    'Shaman_Restoration': P(60, 85, 70, 25, 60, ['A', 'E']), // 복원: 유틸리티, 적응형
    // 딜러
    'Death Knight_Frost': P(55, 40, 70, 50, 40, ['C', 'O']), // 냉기: 룬 관리, 꾸준한 근접
    'Death Knight_Unholy': P(25, 30, 70, 55, 70, ['E', 'O']), // 부정: 하수인과 질병, 솔로
    'Demon Hunter_Havoc': P(80, 35, 50, 35, 75, ['E', 'O']), // 파멸: 빠르고 화려한 기동
    'Druid_Balance': P(40, 55, 70, 45, 85, ['O', 'C']), // 조화: 주기 관리, 자연 마법
    'Druid_Feral': P(35, 35, 80, 40, 55, ['C', 'E']), // 야성: 은신과 출혈, 정교함
    'Evoker_Augmentation': P(55, 75, 80, 35, 90, ['A', 'O']), // 증강: 팀을 강화하는 딜러
    'Evoker_Devastation': P(55, 50, 70, 45, 80, ['O', 'E']), // 황폐: 강화 주문, 폭발적 캐스터
    'Hunter_Beast Mastery': P(25, 55, 45, 45, 45, ['E', 'C']), // 야수 조련: 펫과 솔로, 단순
    'Hunter_Marksmanship': P(25, 35, 85, 55, 50, ['C', 'N']), // 사격: 정밀, 인내
    'Hunter_Survival': P(60, 45, 55, 40, 85, ['O', 'E']), // 생존: 덫과 폭탄, 변칙 근접
    'Mage_Arcane': P(25, 30, 95, 55, 85, ['C', 'O']), // 비전: 복잡한 로테이션, 지적 도전
    'Mage_Fire': P(65, 35, 55, 25, 70, ['N', 'E']), // 화염: 치명타 도박, 폭딜
    'Mage_Frost': P(35, 50, 75, 65, 50, ['N', 'C']), // 냉기(법사): 제어, 안정, 예측 가능
    'Monk_Windwalker': P(70, 45, 80, 40, 60, ['C', 'E']), // 풍운: 콤보, 숙련 요구, 민첩
    'Paladin_Retribution': P(60, 60, 60, 40, 35, ['A', 'O']), // 징벌: 정석, 팀 유틸
    'Priest_Shadow': P(20, 30, 60, 75, 75, ['N', 'E']), // 암흑: 지속 피해, 내향적이고 감정적
    'Rogue_Assassination': P(15, 20, 85, 50, 55, ['E', 'A']), // 암살: 독과 출혈, 고독한 인내
    'Rogue_Outlaw': P(70, 40, 45, 20, 80, ['N', 'O']), // 무법: 무작위 주사위, 도박
    'Rogue_Subtlety': P(20, 25, 90, 45, 80, ['C', 'O']), // 잠행: 은신, 복잡한 그림자 플레이
    'Shaman_Elemental': P(50, 45, 65, 50, 70, ['O', 'C']), // 정기: 원소 캐스터, 폭발
    'Shaman_Enhancement': P(65, 55, 70, 40, 70, ['E', 'A']), // 고양: 근접+주문, 바쁜 유틸
    'Warlock_Affliction': P(15, 25, 80, 60, 70, ['E', 'C']), // 고통: 지속 피해, 솔로 인내
    'Warlock_Demonology': P(25, 30, 80, 45, 90, ['C', 'O']), // 악마: 군단 지휘, 전략
    'Warlock_Destruction': P(45, 30, 65, 35, 55, ['N', 'A']), // 파괴: 한방 화염, 직선적
    'Warrior_Arms': P(50, 35, 80, 40, 35, ['C', 'O']), // 무기: 느리고 강한 한방, 전술적 정석
    'Warrior_Fury': P(85, 35, 35, 30, 45, ['E', 'C']), // 분노: 광란, 즉흥, 돌진
  },
  lostark: {
    // 탱커
    'Warrior (Male)_Warlord': P(85, 70, 85, 20, 45, ['E', 'A']), // 워로드: 선봉장 리더
    // 서포터
    'Mage (Female)_Bard': P(60, 90, 75, 30, 80, ['A', 'O']), // 바드: 음악, 침착한 지원
    'Specialist (Female)_Artist': P(55, 85, 70, 35, 95, ['O', 'A']), // 도화가: 창작, 부드러운 지원
    'Warrior (Male)_Holy Knight': P(70, 90, 85, 25, 40, ['A', 'C']), // 홀리나이트: 굳건한 전방 지원
    'Warrior (Female)_Valkyrie': P(75, 80, 75, 30, 65, ['E', 'A']), // 발키리: 역동적인 신규 서포터
    // 딜러
    'Assassin (Female)_Blade': P(85, 30, 55, 35, 70, ['E', 'O']), // 블레이드: 빠르고 현란한 연계
    'Assassin (Female)_Reaper': P(40, 25, 80, 40, 65, ['E', 'C']), // 리퍼: 은신 백어택, 정교한 타이밍
    'Assassin (Female)_Shadowhunter': P(70, 30, 45, 45, 60, ['O', 'C']), // 데모닉: 변신 폭딜, 직관적
    'Assassin (Female)_Souleater': P(35, 30, 70, 60, 85, ['O', 'N']), // 소울이터: 낫과 어둠, 비정형
    'Hunter (Female)_Gunslinger': P(80, 40, 70, 35, 80, ['E', 'C']), // 건슬링어: 무기 교체, 높은 조작
    'Hunter (Male)_Artillerist': P(30, 45, 85, 55, 40, ['C', 'E']), // 블래스터: 중화기 포격, 계획적
    'Hunter (Male)_Deadeye': P(75, 35, 55, 30, 65, ['N', 'E']), // 데빌헌터: 근거리 샷건, 대담
    'Hunter (Male)_Machinist': P(50, 45, 75, 45, 90, ['O', 'C']), // 스카우터: 드론과 변신, 기술 전략
    'Hunter (Male)_Sharpshooter': P(35, 50, 80, 45, 55, ['C', 'E']), // 호크아이: 원거리 정밀 사격
    'Mage (Female)_Summoner': P(25, 50, 90, 50, 70, ['C', 'E']), // 서머너: 소환수 관리, 전략적 인내
    'Mage (Female)_Arcanist': P(65, 45, 55, 25, 90, ['N', 'O']), // 아르카나: 카드 무작위, 변칙
    'Mage (Female)_Sorceress': P(40, 55, 85, 60, 55, ['N', 'C']), // 소서리스: 캐스팅, 안정적 위치 선정
    'Martial Artist (Female)_Battle Master': P(85, 45, 65, 40, 55, ['E', 'C']), // 배틀마스터: 기동 근접
    'Martial Artist (Female)_Glaivier': P(65, 45, 80, 40, 70, ['C', 'O']), // 창술사: 자세 전환, 기술적
    'Martial Artist (Female)_Infighter': P(70, 50, 75, 30, 40, ['N', 'O']), // 인파이터: 묵직하고 꾸준함
    'Martial Artist (Female)_Soulfist': P(50, 50, 80, 55, 85, ['O', 'C']), // 기공사: 기 관리, 비정형 폭딜
    'Martial Artist (Male)_Breaker': P(75, 35, 45, 35, 35, ['C', 'O']), // 브레이커: 단순하고 강력
    'Martial Artist (Male)_Striker': P(90, 40, 70, 30, 60, ['E', 'N']), // 스트라이커: 빠른 연계, 열혈
    'Specialist (Female)_Aeromancer': P(55, 60, 70, 45, 90, ['O', 'A']), // 기상술사: 날씨, 우아한 변칙
    'Specialist (Female)_Wildsoul': P(65, 55, 55, 40, 85, ['O', 'E']), // 환수사: 환수 변신, 장난기
    'Warrior (Female)_Slayer': P(90, 30, 40, 25, 55, ['E', 'N']), // 슬레이어: 광전사, 돌진
    'Warrior (Male)_Berserker': P(80, 25, 35, 45, 30, ['O', 'C']), // 버서커: 묵직한 정석 강타
    'Warrior (Male)_Destroyer': P(45, 40, 75, 45, 35, ['C', 'O']), // 디스트로이어: 느리고 무거운 해머
  },
  dnf: {
    // 버퍼
    'Archer_Muse': P(80, 80, 70, 30, 80, ['E', 'O']), // 뮤즈: 리듬, 아이돌, 에너지
    'Gunner (F)_Paramedic': P(55, 90, 85, 35, 55, ['A', 'C']), // 패러메딕: 치유와 보호, 체계적
    'Mage (F)_Enchantress': P(50, 80, 75, 45, 90, ['O', 'A']), // 인챈트리스: 인형, 독특한 전략 버퍼
    'Priest (F)_Crusader': P(55, 95, 85, 25, 40, ['A', 'N']), // 크루세이더(여): 영창, 고요하고 질서 있음
    'Priest (M)_Crusader': P(70, 85, 90, 25, 35, ['A', 'C']), // 크루세이더(남): 든든한 파티의 중심
    // 딜러
    'Agent_Hitman': P(70, 60, 65, 30, 75, ['E', 'A']), // 히트맨: 스타일리시, 오로라 팀 시너지
    'Agent_Secret Agent': P(35, 30, 90, 35, 45, ['C', 'N']), // 요원: 정밀 사격, 냉철한 암살
    'Agent_Specialist': P(50, 45, 75, 45, 85, ['O', 'C']), // 스페셜리스트: 코어 에너지, 기술 전략
    'Agent_Troubleshooter': P(85, 30, 35, 65, 55, ['E', 'C']), // 트러블 슈터: 폭탄과 샷건, 시끄러움
    'Archer_Chimera': P(65, 50, 45, 60, 90, ['O', 'N']), // 키메라: 변형 화살, 다재다능
    'Archer_Hunter': P(40, 60, 80, 40, 45, ['C', 'A']), // 헌터: 팔케, 침착한 명사수
    'Archer_Traveler': P(85, 55, 40, 40, 90, ['O', 'E']), // 트래블러: 자유로운 여행가
    'Archer_Vigilante': P(75, 35, 60, 55, 70, ['E', 'O']), // 비질란테: 요수화 근접, 사나움
    'Fighter (F)_Brawler': P(70, 15, 35, 70, 85, ['A', 'O']), // 스트리트파이터(여): 독과 상태이상, 비열
    'Fighter (F)_Grappler': P(75, 40, 70, 45, 35, ['E', 'O']), // 그래플러(여): 유술 잡기, 정석 근접
    'Fighter (F)_Nen Master': P(60, 70, 75, 35, 55, ['A', 'C']), // 넨마스터(여): 넨 개화, 균형과 우아함
    'Fighter (F)_Striker': P(85, 40, 75, 40, 50, ['E', 'C']), // 스트라이커(여): 빠른 콤보, 정밀
    'Fighter (M)_Brawler': P(80, 15, 30, 60, 75, ['A', 'C']), // 스트리트파이터(남): 벽돌과 바늘, 혼돈
    'Fighter (M)_Grappler': P(85, 30, 65, 35, 30, ['E', 'O']), // 그래플러(남): 힘으로 제압, 호령
    'Fighter (M)_Nen Master': P(55, 80, 80, 30, 50, ['A', 'C']), // 넨마스터(남): 넨 보호막, 지원 성격
    'Fighter (M)_Striker': P(80, 45, 80, 30, 35, ['C', 'N']), // 스트라이커(남): 묵직한 정통 격투
    'Gunner (F)_Launcher': P(30, 50, 75, 50, 30, ['E', 'O']), // 런처(여): 중화기 포격, 위치 선정
    'Gunner (F)_Mechanic': P(35, 50, 90, 45, 80, ['C', 'O']), // 메카닉(여): G시리즈 지휘관
    'Gunner (F)_Ranger': P(85, 40, 65, 35, 70, ['E', 'N']), // 레인저(여): 건블레이드 체술, 화려함
    'Gunner (F)_Spitfire': P(70, 50, 75, 40, 80, ['O', 'C']), // 스핏파이어(여): 공중전, 속성탄 전술
    'Gunner (M)_Blitz': P(90, 35, 45, 50, 60, ['E', 'C']), // 어썰트: 돌진 화력, 저돌적
    'Gunner (M)_Launcher': P(20, 40, 80, 45, 25, ['E', 'C']), // 런처(남): 중화기, 과묵한 포격수
    'Gunner (M)_Mechanic': P(30, 40, 85, 55, 90, ['O', 'C']), // 메카닉(남): 로봇 설치, 발명가
    'Gunner (M)_Ranger': P(80, 35, 75, 30, 65, ['E', 'C']), // 레인저(남): 리볼버 건슬링어, 높은 조작
    'Gunner (M)_Spitfire': P(50, 55, 85, 40, 75, ['C', 'O']), // 스핏파이어(남): 유탄과 속성탄, 침착한 전술가
    'Knight_Chaos': P(45, 35, 70, 65, 80, ['N', 'O']), // 카오스: 악마 소환 하이브리드, 어두움
    'Knight_Dragon Knight': P(80, 60, 55, 25, 85, ['E', 'O']), // 드래곤나이트: 드래곤 파트너, 대담한 공중전
    'Knight_Elven Knight': P(65, 70, 85, 30, 45, ['C', 'A']), // 엘븐나이트: 체인러시와 방패, 규율
    'Knight_Paladin': P(50, 90, 70, 30, 35, ['A', 'N']), // 팔라딘: 빛과 지원, 안정
    'Lancer_Dragoon': P(65, 45, 70, 45, 65, ['O', 'E']), // 드래고니안 랜서: 마수 사냥, 공중 창술
    'Lancer_Impaler': P(35, 30, 65, 70, 70, ['N', 'E']), // 다크 랜서: 어둠의 투창, 제어, 음울
    'Lancer_Skirmisher': P(90, 30, 75, 25, 60, ['E', 'N']), // 듀얼리스트: 신기루, 빠른 대인전
    'Lancer_Vanguard': P(75, 25, 40, 70, 45, ['N', 'C']), // 뱅가드: 저돌적 광역 제압
    'Mage (F)_Battle Mage': P(75, 50, 70, 45, 70, ['E', 'O']), // 배틀메이지: 체이서 콤보, 근접 마법
    'Mage (F)_Elementalist': P(25, 60, 90, 55, 70, ['C', 'E']), // 엘레멘탈마스터: 긴 캐스팅, 자원 관리
    'Mage (F)_Summoner': P(20, 50, 85, 50, 80, ['C', 'E']), // 소환사: 다중 소환 관리, 전략적 인내
    'Mage (F)_Witch': P(60, 50, 30, 55, 95, ['O', 'C']), // 마도학자: 설치물, 예측불허 괴짜
    'Mage (M)_Blood Mage': P(55, 30, 45, 85, 70, ['N', 'C']), // 블러드 메이지: 혈기 희생, 고위험 고수익
    'Mage (M)_Dimension Walker': P(25, 30, 85, 65, 95, ['O', 'N']), // 디멘션워커: 차원 계약, 이질적 복잡성
    'Mage (M)_Elemental Bomber': P(45, 35, 70, 45, 50, ['C', 'E']), // 엘레멘탈 바머: 원소 폭격, 직선적 파괴
    'Mage (M)_Glacial Master': P(60, 45, 75, 30, 55, ['N', 'C']), // 빙결사: 얼음 제어, 냉정한 근접 마법
    'Mage (M)_Swift Master': P(90, 50, 45, 35, 80, ['E', 'O']), // 스위프트 마스터: 바람과 속도, 자유
    'Priest (F)_Inquisitor': P(70, 15, 70, 65, 35, ['A', 'N']), // 이단심판관: 성화 심판, 가차 없음
    'Priest (F)_Mistress': P(70, 45, 45, 60, 75, ['E', 'N']), // 미스트리스: 변신과 돌진, 대담한 유틸
    'Priest (F)_Shaman': P(40, 70, 75, 40, 65, ['A', 'E']), // 무녀: 부적과 신룡, 고요한 원거리
    'Priest (M)_Avenger': P(60, 20, 40, 85, 65, ['N', 'A']), // 어벤저: 악마화, 파괴적이고 격정적
    'Priest (M)_Exorcist': P(55, 55, 75, 40, 50, ['C', 'A']), // 퇴마사: 거병과 주술, 균형 잡힌 하이브리드
    'Priest (M)_Monk': P(85, 55, 85, 35, 45, ['E', 'C']), // 인파이터(남사제): 빠른 연타, 신의 주먹
    'Side Story_Creator': P(30, 50, 65, 45, 95, ['O', 'E']), // 크리에이터: 마우스 창조, 상상력, 혼자만의 리듬
    'Side Story_Dark Knight': P(55, 35, 90, 55, 85, ['C', 'O']), // 다크나이트: 콤보 확장, 시공간 복잡성
    'Slayer (F)_Dark Templar': P(30, 25, 85, 50, 70, ['E', 'C']), // 다크템플러: 암살 홀딩, 그림자 제어
    'Slayer (F)_Demon Slayer': P(65, 30, 50, 75, 55, ['N', 'C']), // 데몬슬레이어: 마검 한방, 사나움
    'Slayer (F)_Spectre': P(90, 30, 60, 45, 75, ['E', 'O']), // 블레이드: 빠른 연계, 반응 속도
    'Slayer (F)_Sword Master': P(60, 55, 85, 30, 85, ['O', 'C']), // 소드마스터: 원소 검술, 세련된 다재다능
    'Slayer (F)_Vagabond': P(85, 45, 50, 25, 70, ['E', 'C']), // 베가본드: 이도류 화려함, 자유분방
    'Slayer (M)_Asura': P(35, 65, 80, 30, 60, ['N', 'C']), // 아수라: 파동 광역, 안정적 제어
    'Slayer (M)_Berserker': P(80, 20, 30, 75, 40, ['N', 'C']), // 버서커: 혈기 광란, 단순 저돌
    'Slayer (M)_Blade Master': P(70, 45, 80, 35, 60, ['C', 'E']), // 웨펀마스터: 숙련된 검술, 균형 콤보
    'Slayer (M)_Ghostblade': P(65, 40, 65, 55, 85, ['O', 'N']), // 검귀: 원귀 협력, 빠른 연계
    'Slayer (M)_Soul Bender': P(25, 35, 80, 60, 75, ['C', 'E']), // 소울브링어: 설치형 디버프, 음울한 전략
    'Thief_Kunoichi': P(80, 35, 70, 40, 85, ['O', 'E']), // 쿠노이치: 인법과 화염, 민첩한 변칙
    'Thief_Necromancer': P(20, 25, 85, 70, 80, ['N', 'E']), // 사령술사: 사령 군단 지휘, 고독
    'Thief_Rogue': P(80, 30, 65, 35, 55, ['E', 'N']), // 로그: 히트엔드, 빠른 쌍검 콤보
    'Thief_Shadow Dancer': P(25, 15, 85, 45, 60, ['A', 'E']), // 섀도우댄서: 백어택 암살, 냉혹
  },
}

const file = path.join(__dirname, 'src', 'lib', 'data.ts')
const source = fs.readFileSync(file, 'utf8')
const eol = source.includes('\r\n') ? '\r\n' : '\n'
const lines = source.split(eol)

const used = new Set()
const output = []
let game = null
let className = null
let specName = null
for (const line of lines) {
  output.push(line)
  let m
  if ((m = line.match(/^export const (\w+)Classes/))) game = m[1]
  else if ((m = line.match(/^    name: '(.+)',$/))) className = m[1]
  else if ((m = line.match(/^        name: '(.+)',$/))) specName = m[1]
  else if (/^        role: '/.test(line)) {
    const label = `${className}_${specName}`
    const p = PROFILES[game] && PROFILES[game][label]
    if (!p) throw new Error(`프로필 없음: ${game} ${label}`)
    if (used.has(`${game}|${label}`)) throw new Error(`중복 전문화: ${game} ${label}`)
    used.add(`${game}|${label}`)
    output.push(`        big5: { E: ${p.E}, A: ${p.A}, C: ${p.C}, N: ${p.N}, O: ${p.O} },`)
    output.push(`        signature: [${p.signature.map((t) => `'${t}'`).join(', ')}],`)
  }
}

for (const g of Object.keys(PROFILES)) {
  for (const label of Object.keys(PROFILES[g])) {
    if (!used.has(`${g}|${label}`)) throw new Error(`data.ts에 없는 라벨: ${g} ${label}`)
  }
}

fs.writeFileSync(file, output.join(eol))
console.log(`삽입 완료: ${used.size}개 전문화`)
```

- [ ] **Step 5: 스크립트 실행, 포맷, 삭제**

Run:
```bash
node add-profiles.tmp.js && npx prettier --write src/lib/data.ts && rm add-profiles.tmp.js
grep -c "^        big5: " src/lib/data.ts
```
Expected: `삽입 완료: 136개 전문화`, grep 결과 `136`. `git status`에 `add-profiles.tmp.js`가 남아 있지 않아야 한다.

- [ ] **Step 6: 타입 검사와 테스트 통과 확인**

Run: `npx tsc --noEmit && npx jest src/lib/recommend.test.ts && npm run lint`
Expected: tsc 오류 없음 (136개 전문화 모두 필드가 있어야 통과). 불변 조건 테스트 13개 PASS (게임별 4개 × 3 + 던파 남/여 1개). 거리 테스트가 실패하면 `tooClose` 목록에 나온 쌍의 값을 벌려 고친다. 참고로 이 표는 작성 시점에 가장 가까운 쌍이 와우 14.1, 로아 13.2, 던파 12.2로 검증됐다.

- [ ] **Step 7: 커밋**

```bash
git add src/lib/types.ts src/lib/data.ts src/lib/recommend.test.ts
git commit -F - <<'EOF'
전문화별 Big5 목표 프로필과 시그니처 특성 추가 (136개)

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
EOF
```

---

### Task 3: recommend() 함수와 골든 성향 테스트

**Files:**
- Modify: `src/lib/recommend.ts`
- Modify: `src/lib/recommend.test.ts`

**Interfaces:**
- Consumes: `specFit`, `roleFit`, `buildReason` (Task 1), `spec.big5`/`spec.signature` (Task 2), `getGameClasses`
- Produces: `recommend(game: string, scores: PersonalityScores): Recommendation[]` (점수 내림차순, 동점은 라벨 코드포인트 순, 알 수 없는 게임은 `[]`)

- [ ] **Step 1: 실패하는 테스트 추가**

`src/lib/recommend.test.ts`의 import에 `recommend`를 추가한다.

```ts
import {
  buildReason,
  profileDistance,
  recommend,
  roleFit,
  specFit,
  MIN_PROFILE_DISTANCE,
  ROLE_ARCHETYPES,
  TRAITS,
} from '@/lib/recommend'
```

파일 끝에 추가:

```ts
describe('recommend', () => {
  const neutral = scores(50, 50, 50, 50, 50)

  it('게임의 모든 전문화를 점수 내림차순으로 돌려준다', () => {
    const result = recommend('wow', neutral)
    expect(result).toHaveLength(39)
    const values = result.map((r) => r.score)
    expect(values).toEqual([...values].sort((a, b) => b - a))
    expect(new Set(result.map((r) => r.label)).size).toBe(39)
  })

  it('점수는 0~100 정수이고 reason이 비어 있지 않다', () => {
    for (const r of recommend('dnf', neutral)) {
      expect(Number.isInteger(r.score)).toBe(true)
      expect(r.score).toBeGreaterThanOrEqual(0)
      expect(r.score).toBeLessThanOrEqual(100)
      expect(r.reason).toMatch(/성향과 잘 맞아요$/)
    }
  })

  it('동점이면 라벨 코드포인트 순으로 고정한다', () => {
    const result = recommend('dnf', neutral)
    for (let i = 1; i < result.length; i++) {
      if (result[i].score === result[i - 1].score) expect(result[i - 1].label < result[i].label).toBe(true)
    }
  })

  it('게임 키 대소문자를 구분하지 않는다', () => {
    expect(recommend('LostArk', neutral)).toEqual(recommend('lostark', neutral))
  })

  it('알 수 없는 게임은 빈 배열을 돌려준다', () => {
    expect(recommend('unknown', neutral)).toEqual([])
  })
})

/** 골든 성향 테스트. 설계 문서 8.3. 입력 순서는 E, A, C, N, O. */
const roleOf = (game: string, label: string) => specsOf(game).find((s) => s.label === label)!.spec.role
const specNameOf = (label: string) => label.split('_')[1]
const top3 = (game: string, s: PersonalityScores) =>
  recommend(game, s)
    .slice(0, 3)
    .map((r) => ({ label: r.label, spec: specNameOf(r.label), role: roleOf(game, r.label) }))
const countIn = (items: { spec: string }[], names: string[]) => items.filter((i) => names.includes(i.spec)).length

describe('골든 성향 테스트: 와우', () => {
  it('힐러형은 상위 3개가 모두 힐러다', () => {
    expect(top3('wow', scores(60, 90, 80, 20, 50)).every((r) => r.role === 'healer')).toBe(true)
  })
  it('탱커형은 1위가 탱커이고 상위 3개 중 2개 이상이 탱커다', () => {
    const r = top3('wow', scores(85, 65, 85, 20, 50))
    expect(r[0].role).toBe('tanker')
    expect(r.filter((x) => x.role === 'tanker').length).toBeGreaterThanOrEqual(2)
  })
  it('복잡 내향 딜러는 비전/악마/고통/잠행 중 하나가 1위다', () => {
    const r = top3('wow', scores(20, 30, 95, 50, 85))
    expect(['Mage_Arcane', 'Warlock_Demonology', 'Warlock_Affliction', 'Rogue_Subtlety']).toContain(r[0].label)
  })
  it('도박 외향 딜러는 무법/화염/분노/파멸 중 2개 이상이 상위 3개에 든다', () => {
    const r = top3('wow', scores(85, 35, 40, 20, 70))
    expect(r.filter((x) => ['Rogue_Outlaw', 'Mage_Fire', 'Warrior_Fury', 'Demon Hunter_Havoc'].includes(x.label)).length)
      .toBeGreaterThanOrEqual(2)
  })
  it('솔로 펫 플레이어는 야수/고통/부정 중 하나가 1위다', () => {
    const r = top3('wow', scores(20, 50, 45, 45, 45))
    expect(['Hunter_Beast Mastery', 'Warlock_Affliction', 'Death Knight_Unholy']).toContain(r[0].label)
  })
  it('팀형 서포트 딜러는 상위 3개에 증강 기원사가 있다', () => {
    expect(top3('wow', scores(55, 70, 75, 40, 85)).some((x) => x.label === 'Evoker_Augmentation')).toBe(true)
  })
})

describe('골든 성향 테스트: 로스트아크', () => {
  it('서포터형은 상위 3개가 모두 서포터다', () => {
    expect(top3('lostark', scores(65, 90, 75, 30, 60)).every((r) => r.role === 'supporter')).toBe(true)
  })
  it('리더 탱커형은 워로드가 1위다', () => {
    expect(top3('lostark', scores(90, 70, 90, 20, 40))[0].label).toBe('Warrior (Male)_Warlord')
  })
  it('고속 외향 딜러는 상위 3개가 모두 딜러이고 그중 2개 이상이 고속 계열이다', () => {
    const r = top3('lostark', scores(90, 35, 45, 30, 75))
    expect(r.every((x) => x.role === 'dealer')).toBe(true)
    expect(countIn(r, ['Blade', 'Reaper', 'Deadeye', 'Gunslinger', 'Slayer', 'Striker', 'Battle Master', 'Glaivier'])).toBeGreaterThanOrEqual(2)
  })
  it('계획 파괴자는 블래스터/서머너/소서리스/호크아이 중 하나가 1위다', () => {
    expect(['Artillerist', 'Summoner', 'Sorceress', 'Sharpshooter']).toContain(top3('lostark', scores(35, 45, 90, 55, 50))[0].spec)
  })
  it('변칙 전략가는 기공사/스카우터/아르카나/기상술사/환수사/소울이터 중 2개 이상이 상위 3개에 든다', () => {
    const r = top3('lostark', scores(55, 50, 60, 45, 95))
    expect(countIn(r, ['Soulfist', 'Machinist', 'Arcanist', 'Aeromancer', 'Wildsoul', 'Souleater'])).toBeGreaterThanOrEqual(2)
  })
})

describe('골든 성향 테스트: 던파', () => {
  it('버퍼형은 1위가 버퍼이고 상위 3개 중 2개 이상이 버퍼다', () => {
    const r = top3('dnf', scores(60, 90, 80, 30, 50))
    expect(r[0].role).toBe('buffer')
    expect(r.filter((x) => x.role === 'buffer').length).toBeGreaterThanOrEqual(2)
  })
  it('묵직한 한방은 버서커/데몬슬레이어/뱅가드/어벤저/이단심판관 중 2개 이상이 상위 3개에 든다', () => {
    const r = top3('dnf', scores(75, 30, 45, 70, 35))
    expect(countIn(r, ['Berserker', 'Demon Slayer', 'Vanguard', 'Avenger', 'Inquisitor'])).toBeGreaterThanOrEqual(2)
  })
  it('설치 지휘 전략가는 소울브링어/메카닉/소환사/엘레멘탈마스터/사령술사/디멘션워커 중 2개 이상이 상위 3개에 든다', () => {
    const r = top3('dnf', scores(30, 45, 90, 50, 80))
    expect(countIn(r, ['Soul Bender', 'Mechanic', 'Summoner', 'Elementalist', 'Necromancer', 'Dimension Walker'])).toBeGreaterThanOrEqual(2)
  })
  it('변칙 괴짜는 마도학자/키메라/스트리트파이터/트래블러/크리에이터 중 2개 이상이 상위 3개에 든다', () => {
    const r = top3('dnf', scores(70, 35, 40, 55, 90))
    expect(countIn(r, ['Witch', 'Chimera', 'Brawler', 'Traveler', 'Creator'])).toBeGreaterThanOrEqual(2)
  })
  it('정석 원거리는 런처/요원/헌터/엘레멘탈 바머 중 2개 이상이 상위 3개에 든다', () => {
    const r = top3('dnf', scores(35, 50, 75, 40, 30))
    expect(countIn(r, ['Launcher', 'Secret Agent', 'Hunter', 'Elemental Bomber'])).toBeGreaterThanOrEqual(2)
  })
})
```

- [ ] **Step 2: 테스트가 실패하는지 확인**

Run: `npx jest src/lib/recommend.test.ts`
Expected: FAIL. `recommend`를 export하지 않아 컴파일 또는 호출 단계에서 실패.

- [ ] **Step 3: recommend() 구현**

`src/lib/recommend.ts`의 import를 바꾸고 파일 끝에 함수를 추가한다.

```ts
import { getGameClasses } from '@/lib/data'
import type { GameSpec, PersonalityScores, Recommendation, Trait } from '@/lib/types'
```

파일 끝:

```ts
function compareLabel(a: string, b: string): number {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

/**
 * 게임의 모든 전문화에 점수를 매겨 내림차순으로 돌려준다. 화면은 상위 3개를 쓴다.
 * 점수 = round(ROLE_WEIGHT * 역할 적합도 + SPEC_WEIGHT * 전문화 적합도). 동점은 라벨 코드포인트 순.
 */
export function recommend(game: string, scores: PersonalityScores): Recommendation[] {
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
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npx prettier --write src/lib/recommend.ts src/lib/recommend.test.ts && npx jest src/lib/recommend.test.ts && npx tsc --noEmit && npm run lint`
Expected: 전부 PASS. 골든 테스트가 실패하면 프로필 값이나 상수를 조정하되, 역할 조건(힐러형은 전부 힐러, 버퍼형은 1위 버퍼)과 기대 집합은 바꾸지 않는다. 작성 시점 검증값: 힐러형 1~3위 Paladin_Holy 95, Priest_Holy 95, Shaman_Restoration 94. 버퍼형 1~3위 Paramedic 96, Crusader(F) 95, Crusader(M) 93.

- [ ] **Step 5: 커밋**

```bash
git add src/lib/recommend.ts src/lib/recommend.test.ts
git commit -F - <<'EOF'
recommend() 추가: 역할 적합도와 전문화 적합도를 섞은 규칙 기반 추천

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
EOF
```

---

### Task 4: 결과 화면을 규칙 기반 추천으로 교체

**Files:**
- Modify: `src/app/result/_components/ResultPageClient.tsx`
- Modify: `src/components/molecules/RecommendationSection.tsx`
- Modify: `src/components/atoms/Home.tsx:150`
- Create: `src/components/molecules/RecommendationSection.test.tsx`

**Interfaces:**
- Consumes: `recommend` (Task 3), `Recommendation` (Task 1)
- Produces: `RecommendationSection` props가 `{ game: string; recommendations: Recommendation[] }`로 바뀐다.

- [ ] **Step 1: 실패하는 컴포넌트 테스트 작성**

`src/components/molecules/RecommendationSection.test.tsx`:

```tsx
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
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...(rest as ImgHTMLAttributes<HTMLImageElement>)} />
  },
}))

const recommendations: Recommendation[] = [
  { label: 'Mage_Arcane', score: 91, reason: '계획적이고 꼼꼼한, 호기심 많고 새로운 것을 즐기는 성향과 잘 맞아요' },
  { label: 'Rogue_Subtlety', score: 90, reason: '계획적이고 꼼꼼한, 호기심 많고 새로운 것을 즐기는 성향과 잘 맞아요' },
  { label: 'Warlock_Demonology', score: 87, reason: '계획적이고 꼼꼼한, 호기심 많고 새로운 것을 즐기는 성향과 잘 맞아요' },
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
```

- [ ] **Step 2: 테스트가 실패하는지 확인**

Run: `npx jest src/components/molecules/RecommendationSection.test.tsx`
Expected: FAIL. 현재 컴포넌트는 `isLoading`이 없으면 로딩 분기를 타지 않더라도 `Math.round(score * 100)`을 써서 `91%`가 아니라 `9100%`를 그리고, `reason`도 없다.

- [ ] **Step 3: RecommendationSection.tsx 수정**

아래 치환을 순서대로 적용한다 (각각 정확히 한 곳).

(a) import와 props:

```tsx
import { Trophy, Medal, Award, AlertTriangle } from 'lucide-react'

interface Recommendation {
  label: string
  score: number
}

interface RecommendationSectionProps {
  game: string
  recommendations: Recommendation[]
  isLoading: boolean
  error?: string
}
```
→
```tsx
import { Trophy, Medal, Award } from 'lucide-react'
import type { Recommendation } from '@/lib/types'

interface RecommendationSectionProps {
  game: string
  recommendations: Recommendation[]
}
```

(b) 컴포넌트 시그니처:

```tsx
export default function RecommendationSection({ game, recommendations, isLoading, error }: RecommendationSectionProps) {
```
→
```tsx
export default function RecommendationSection({ game, recommendations }: RecommendationSectionProps) {
```

(c) 카드 등장 효과:

```tsx
    if (recommendations.length > 0 && !isLoading) {
```
→
```tsx
    if (recommendations.length > 0) {
```
그리고 같은 useEffect의 의존성 `[recommendations, isLoading]`을 `[recommendations]`로 바꾼다.

(d) `if (error) { ... }` 블록(「AI 추천 오류」 카드)과 `if (isLoading) { ... }` 블록(「AI 직업 추천 분석 중...」 카드)을 통째로 삭제한다. `if (recommendations.length === 0) { return null }`은 남긴다.

(e) 데스크톱 단상의 점수와 설명:

```tsx
                  <div className={cn('font-bold text-foreground', scale.scoreSize)}>
                    {Math.round(item.data.score * 100)}%
                  </div>
```
→
```tsx
                  <div className={cn('font-bold text-foreground', scale.scoreSize)}>{item.data.score}%</div>
```

```tsx
                    <p className="text-xs leading-relaxed text-muted-foreground">{spec.description}</p>
                  </CardContent>
                </Card>
              </div>
            )
          })}
        </div>

        {/* 모바일/태블릿: 세로 배치 레이아웃 */}
```
→
```tsx
                    <p className="mb-2 text-xs font-medium text-primary">{item.data.reason}</p>
                    <p className="text-xs leading-relaxed text-muted-foreground">{spec.description}</p>
                  </CardContent>
                </Card>
              </div>
            )
          })}
        </div>

        {/* 모바일/태블릿: 세로 배치 레이아웃 */}
```

(f) 모바일 목록의 점수와 설명:

```tsx
                            <div className="text-xl font-bold text-foreground">{Math.round(item.score * 100)}%</div>
```
→
```tsx
                            <div className="text-xl font-bold text-foreground">{item.score}%</div>
```

```tsx
                        <p className="text-xs leading-relaxed text-muted-foreground">{spec.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )
          })}
        </div>

        {/* 축하 메시지 */}
```
→
```tsx
                        <p className="mb-2 text-xs font-medium text-primary">{item.reason}</p>
                        <p className="text-xs leading-relaxed text-muted-foreground">{spec.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )
          })}
        </div>

        {/* 축하 메시지 */}
```

(g) 축하 문구:

```tsx
                축하합니다! AI가 분석한 당신만의 완벽한 직업을 찾았습니다
```
→
```tsx
                축하합니다! 당신의 성향에 꼭 맞는 직업을 찾았습니다
```

- [ ] **Step 4: ResultPageClient.tsx 수정**

(a) import:

```tsx
import { predict } from '@/lib/onnx'
import type { TestData, PersonalityScores } from '@/lib/types'
```
→
```tsx
import { recommend } from '@/lib/recommend'
import type { TestData, Recommendation } from '@/lib/types'
```

(b) 상태:

```tsx
  const [recommendations, setRecommendations] = useState<
    {
      label: string
      score: number
    }[]
  >([])
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false)
  const [recommendationError, setRecommendationError] = useState<string>('')
```
→
```tsx
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
```

(c) `const fetchRecommendations = async (personalityScores: PersonalityScores) => { ... }` 함수 전체(`setIsLoadingRecommendations(true)`부터 `finally` 블록 끝까지)를 삭제한다.

(d) 추천 호출:

```tsx
      setIsLoading(false)

      // Fetch AI recommendations
      fetchRecommendations(parsedData.personalityScores)
```
→
```tsx
      setRecommendations(recommend(game, parsedData.personalityScores))
      setIsLoading(false)
```

(e) JSX:

```tsx
        {/* AI 추천 결과 섹션 */}
        <RecommendationSection
          game={game}
          recommendations={recommendations}
          isLoading={isLoadingRecommendations}
          error={recommendationError}
        />
```
→
```tsx
        {/* 성향 기반 추천 결과 섹션 */}
        <RecommendationSection game={game} recommendations={recommendations} />
```

- [ ] **Step 5: Home.tsx 문구 수정**

`src/components/atoms/Home.tsx` 150행 근처의 `AI가 당신의 성격을 분석해서` 를 `성격 성향을 분석해서` 로 바꾼다 (그 줄의 나머지 문장은 그대로).

- [ ] **Step 6: 검증**

Run: `npx prettier --write "src/app/result/_components/ResultPageClient.tsx" "src/components/molecules/RecommendationSection.tsx" "src/components/molecules/RecommendationSection.test.tsx" "src/components/atoms/Home.tsx" && npm test && npx tsc --noEmit && npm run lint`
Expected: 전부 PASS. 남아 있는 "AI" 문구 확인: `grep -rn "AI" src --include=*.tsx` 결과가 비어 있어야 한다. lint가 테스트 파일의 `<img>`에 `jsx-a11y/alt-text`를 지적하면 그 줄의 disable 주석에 `, jsx-a11y/alt-text`를 덧붙인다.

- [ ] **Step 7: 커밋**

```bash
git add src/app/result/_components/ResultPageClient.tsx src/components/molecules/RecommendationSection.tsx src/components/molecules/RecommendationSection.test.tsx src/components/atoms/Home.tsx
git commit -F - <<'EOF'
결과 화면을 규칙 기반 추천으로 교체하고 적합도·추천 이유 표시

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
EOF
```

---

### Task 5: ONNX 브라우저 추론 제거와 README 갱신

**Files:**
- Delete: `src/lib/onnx.ts`, `src/lib/onnx.test.ts`, `public/models/wow/`, `public/models/lostark/`, `public/models/dnf/`
- Modify: `package.json`, `package-lock.json` (`onnxruntime-web` 제거)
- Modify: `README.md`
- 유지: `src/scripts/ml/**`, `src/scripts/models/**`, `src/scripts/model.pth`, `src/scripts/dummy.js`

**Interfaces:**
- Consumes: Task 4가 끝나 `@/lib/onnx`를 import하는 곳이 없어야 한다.
- Produces: 없음.

- [ ] **Step 1: 참조가 남아 있지 않은지 확인**

Run: `grep -rn "lib/onnx\|onnxruntime" src --include=*.ts --include=*.tsx`
Expected: `src/lib/onnx.ts`와 `src/lib/onnx.test.ts` 자신만 나온다.

- [ ] **Step 2: 파일과 의존성 삭제**

```bash
git rm -q src/lib/onnx.ts src/lib/onnx.test.ts
git rm -r -q public/models
npm uninstall onnxruntime-web
```
Expected: `package.json`의 dependencies에서 `onnxruntime-web`이 사라지고 lock 파일이 갱신된다.

- [ ] **Step 3: README 갱신**

아래 치환을 적용한다.

(a) 3행 소개 문장의 `Next.js와 Python을 결합하여, 과학적인 성격 분석과 AI 기반 직업 추천 기능을 제공합니다.` → `Big5 성향과 전문화별 플레이 스타일 프로필을 비교하는 규칙 기반 점수로 직업을 추천합니다.`

(b) 주요 기능의 "AI 기반 직업 추천" 항목 전체:

```markdown
- **AI 기반 직업 추천**:
  - PyTorch로 학습된 모델을 **ONNX (Open Neural Network Exchange)** 형식으로 변환하여 웹 환경에서 빠르고 효율적인 추론을 수행합니다.
  - 분석된 성격 프로필을 바탕으로 사용자에게 가장 적합한 **상위 3개의 WoW 직업 및 전문화**를 추천합니다.
```
→
```markdown
- **성향 기반 직업 추천**:
  - 전문화마다 목표 Big5 프로필과 시그니처 특성(가중치 2배)을 `src/lib/data.ts`에 정의합니다.
  - 역할(탱커/힐러/서포터/버퍼/딜러) 적합도와 전문화 적합도를 35:65로 섞어 0~100 적합도를 내고, **상위 3개 직업·전문화**와 한 줄 추천 이유를 보여 줍니다. 계산은 `src/lib/recommend.ts`에 있으며 브라우저에서 동기적으로 실행됩니다.
```

(c) 데이터 저장 항목의 `이를 모델 학습 데이터로 활용합니다.` → `이를 프로필 보정과 향후 모델 학습에 활용합니다.`

(d) 기술 스택 표의 행 `| **AI/ML**         | Python, PyTorch, ONNX, scikit-learn, pandas, TensorBoard                |` → `| **학습 스크립트(향후)** | Python, PyTorch, scikit-learn, pandas, TensorBoard                      |`

(e) 프로젝트 구조의 `│ ├── onnx.ts \# ONNX 모델 추론 로직  ` → `│ ├── recommend.ts \# 규칙 기반 직업 추천 점수 계산  `

(f) "🧠 모델 및 학습" 절 전체를 다음으로 바꾼다.

```markdown
## **🧠 추천 방식**

- **데이터**: `src/lib/data.ts`의 각 전문화에 `big5`(E/A/C/N/O 목표값 0~100)와 `signature`(가중치 2배 특성 1~2개)가 있습니다. 같은 게임 안에서 프로필이 같은 전문화가 없도록 테스트(`src/lib/recommend.test.ts`)가 거리 10 이상을 강제합니다.
- **점수**: 역할 적합도(A·E·N으로 역할 원형과의 거리)와 전문화 적합도(시그니처 가중 거리)를 35:65로 섞습니다. 상수는 `src/lib/recommend.ts` 상단에 있습니다.
- **검증**: 게임별 성향 유형(힐러형, 탱커형, 도박 외향 딜러 등)에 대한 골든 테스트가 상위 3개의 역할과 전문화를 고정합니다.
- **학습 스크립트**: `src/scripts/ml/`의 PyTorch 학습·ONNX 변환 스크립트와 체크포인트는 실제 설문 데이터가 충분히 쌓였을 때 재학습하기 위해 남겨 둔 것으로, 현재 앱은 사용하지 않습니다.
```

- [ ] **Step 4: 검증**

Run: `npm test && npx tsc --noEmit && npm run lint && git status --short`
Expected: 전부 PASS. `git status`에 삭제된 파일들, `package.json`, `package-lock.json`, `README.md`만 보인다.

- [ ] **Step 5: 커밋**

`git rm`으로 삭제는 이미 스테이징돼 있다.

```bash
git add package.json package-lock.json README.md
git commit -F - <<'EOF'
브라우저 ONNX 추론 경로 제거 (onnx.ts, public/models, onnxruntime-web)

학습 스크립트와 체크포인트는 실데이터 재학습용으로 유지한다.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
EOF
```

---

### Task 6: 실데이터 기반 프로필 보정 리포트 스크립트

**Files:**
- Create: `src/scripts/profile-calibration.js`
- Create: `src/scripts/profile-calibration.test.js`
- Modify: `README.md` (사용법 한 절 추가)

**Interfaces:**
- Consumes: `src/lib/data.ts`의 `big5`/`signature` 줄 형식(Task 2가 만든 Prettier 포맷: `        big5: { E: 55, A: 85, C: 80, N: 25, O: 70 },` 와 `        signature: ['A', 'C'],`)
- Produces: `parseProfiles(source)`, `summarize(rows)`, `buildReport(profiles, summary, { minN, near })`. CLI: `node src/scripts/profile-calibration.js <survey_results.json> [--min-n 5] [--near 15]`

목적: Supabase `survey_results`를 JSON으로 내보낸 파일을 읽어, (1) 실데이터 평균이 현재 프로필과 10 이상 다른 전문화, (2) 현재 프로필에서 서로 가까운 쌍과 실데이터에서 그 둘이 실제로 갈리는 특성을 출력한다. 사람이 이 리포트를 보고 `data.ts` 값을 고친다.

- [ ] **Step 1: 실패하는 테스트 작성**

`src/scripts/profile-calibration.test.js`:

```js
const fs = require('fs')
const path = require('path')
const { parseProfiles, summarize, buildReport } = require('./profile-calibration')

const dataTs = fs.readFileSync(path.join(__dirname, '..', 'lib', 'data.ts'), 'utf8')

describe('parseProfiles', () => {
  it('data.ts에서 세 게임의 프로필을 모두 읽는다', () => {
    const profiles = parseProfiles(dataTs)
    expect(Object.keys(profiles.wow)).toHaveLength(39)
    expect(Object.keys(profiles.lostark)).toHaveLength(28)
    expect(Object.keys(profiles.dnf)).toHaveLength(69)
    expect(profiles.wow['Mage_Arcane']).toEqual({ role: 'dealer', E: 25, A: 30, C: 95, N: 55, O: 85, signature: ['C', 'O'] })
  })
})

describe('summarize', () => {
  it('완전히 같은 행은 한 번만 세고, 문자열 answers도 읽으며, 평균을 낸다', () => {
    const rows = [
      { app: 'WoW', class: 'Mage', specialization: 'Arcane', answers: { E: 20, A: 30, C: 90, N: 50, O: 80 } },
      { app: 'WoW', class: 'Mage', specialization: 'Arcane', answers: { E: 20, A: 30, C: 90, N: 50, O: 80 } },
      { app: 'WoW', class: 'Mage', specialization: 'Arcane', answers: JSON.stringify({ E: 40, A: 30, C: 90, N: 50, O: 80 }) },
      { app: 'DNF', class: 'Thief', specialization: 'Rogue', answers: null },
    ]
    const summary = summarize(rows)
    expect(summary.wow['Mage_Arcane'].n).toBe(2)
    expect(summary.wow['Mage_Arcane'].mean.E).toBe(30)
    expect(summary.dnf).toBeUndefined()
  })
})

describe('buildReport', () => {
  const profiles = {
    wow: {
      'Mage_Arcane': { role: 'dealer', E: 25, A: 30, C: 95, N: 55, O: 85, signature: ['C', 'O'] },
      'Rogue_Subtlety': { role: 'dealer', E: 20, A: 25, C: 90, N: 45, O: 80, signature: ['C', 'O'] },
    },
    lostark: {},
    dnf: {},
  }

  it('실데이터가 프로필과 10 이상 다른 전문화를 알려 준다', () => {
    const summary = { wow: { 'Mage_Arcane': { n: 5, mean: { E: 45, A: 30, C: 95, N: 55, O: 85 } } } }
    const text = buildReport(profiles, summary, { minN: 5, near: 15 }).join('\n')
    expect(text).toContain('Mage_Arcane (n=5)')
    expect(text).toContain('E +20')
  })

  it('표본이 minN보다 적으면 차이를 보고하지 않는다', () => {
    const summary = { wow: { 'Mage_Arcane': { n: 2, mean: { E: 45, A: 30, C: 95, N: 55, O: 85 } } } }
    const text = buildReport(profiles, summary, { minN: 5, near: 15 }).join('\n')
    expect(text).not.toContain('Mage_Arcane (n=2)')
  })

  it('가까운 쌍에 실데이터에서 가장 크게 갈리는 특성을 붙인다', () => {
    const summary = {
      wow: {
        'Mage_Arcane': { n: 5, mean: { E: 20, A: 30, C: 95, N: 70, O: 85 } },
        'Rogue_Subtlety': { n: 5, mean: { E: 20, A: 30, C: 95, N: 30, O: 85 } },
      },
    }
    const text = buildReport(profiles, summary, { minN: 5, near: 15 }).join('\n')
    expect(text).toContain('가까운 쌍 d=14.1: Mage_Arcane ~ Rogue_Subtlety')
    expect(text).toContain('가장 크게 갈리는 특성: N (Mage_Arcane 70 vs Rogue_Subtlety 30)')
  })

  it('실데이터가 없는 가까운 쌍은 데이터 부족으로 표시한다', () => {
    const text = buildReport(profiles, {}, { minN: 5, near: 15 }).join('\n')
    expect(text).toContain('Mage_Arcane ~ Rogue_Subtlety')
    expect(text).toContain('실데이터 부족')
  })
})
```

- [ ] **Step 2: 테스트가 실패하는지 확인**

Run: `npx jest src/scripts/profile-calibration.test.js`
Expected: FAIL. `Cannot find module './profile-calibration'`.

- [ ] **Step 3: 스크립트 구현**

`src/scripts/profile-calibration.js`:

```js
#!/usr/bin/env node
/**
 * 실제 설문 응답(survey_results)과 src/lib/data.ts의 전문화 프로필을 비교해
 * 구분이 잘 안 되는 전문화 쌍을 실데이터 방향으로 벌릴 수 있도록 리포트를 출력합니다.
 *
 * 사용법:
 *   node src/scripts/profile-calibration.js <survey_results.json> [--min-n 5] [--near 15]
 *
 * survey_results.json: Supabase SQL Editor에서 아래 쿼리를 실행하고 결과를 JSON으로 내보낸 파일
 *   select app, class, specialization, answers from survey_results;
 *
 * 출력:
 *   1) 표본이 min-n 이상인 전문화 중 실데이터 평균이 프로필과 10 이상 다른 특성
 *   2) 현재 프로필에서 거리가 near 미만인 쌍과, 실데이터에서 그 둘이 가장 크게 갈리는 특성
 */
const fs = require('fs')
const path = require('path')

const TRAITS = ['E', 'A', 'C', 'N', 'O']
const GAMES = ['wow', 'lostark', 'dnf']

/** data.ts 소스에서 게임별 전문화 프로필을 읽는다. Prettier 포맷의 들여쓰기(직업 4칸, 전문화 8칸)에 의존한다. */
function parseProfiles(source) {
  const profiles = { wow: {}, lostark: {}, dnf: {} }
  let game = null
  let className = null
  let label = null
  for (const rawLine of source.split('\n')) {
    const line = rawLine.replace(/\r$/, '')
    let m
    if ((m = line.match(/^export const (\w+)Classes/))) {
      game = m[1]
    } else if ((m = line.match(/^    name: '(.+)',$/))) {
      className = m[1]
    } else if ((m = line.match(/^        name: '(.+)',$/))) {
      label = `${className}_${m[1]}`
      profiles[game][label] = {}
    } else if ((m = line.match(/^        role: '(.+)',$/))) {
      profiles[game][label].role = m[1]
    } else if ((m = line.match(/^        big5: \{ E: (\d+), A: (\d+), C: (\d+), N: (\d+), O: (\d+) \},$/))) {
      TRAITS.forEach((trait, i) => {
        profiles[game][label][trait] = Number(m[i + 1])
      })
    } else if ((m = line.match(/^        signature: \[(.+)\],$/))) {
      profiles[game][label].signature = m[1].split(',').map((s) => s.trim().replace(/'/g, ''))
    }
  }
  return profiles
}

/** 응답 행을 게임/전문화별 n과 평균으로 요약한다. 완전히 같은 행(결과 페이지 새로고침 중복)은 한 번만 센다. */
function summarize(rows) {
  const summary = {}
  const seen = new Set()
  for (const row of rows) {
    let answers = row.answers
    if (typeof answers === 'string') {
      try {
        answers = JSON.parse(answers)
      } catch {
        continue
      }
    }
    if (!answers || TRAITS.some((trait) => typeof answers[trait] !== 'number')) continue
    const game = String(row.app).toLowerCase()
    const label = `${row.class}_${row.specialization}`
    const key = `${game}|${label}|${TRAITS.map((trait) => answers[trait]).join(',')}`
    if (seen.has(key)) continue
    seen.add(key)
    if (!summary[game]) summary[game] = {}
    if (!summary[game][label]) summary[game][label] = { n: 0, sum: Object.fromEntries(TRAITS.map((t) => [t, 0])) }
    const bucket = summary[game][label]
    bucket.n += 1
    TRAITS.forEach((trait) => {
      bucket.sum[trait] += answers[trait]
    })
  }
  for (const game of Object.keys(summary)) {
    for (const label of Object.keys(summary[game])) {
      const bucket = summary[game][label]
      bucket.mean = Object.fromEntries(TRAITS.map((trait) => [trait, bucket.sum[trait] / bucket.n]))
    }
  }
  return summary
}

const distance = (a, b) => Math.sqrt(TRAITS.reduce((sum, trait) => sum + (a[trait] - b[trait]) ** 2, 0))

/** 리포트 줄 배열을 만든다. */
function buildReport(profiles, summary, { minN = 5, near = 15 } = {}) {
  const lines = []
  for (const game of GAMES) {
    const stats = summary[game] || {}
    const labels = Object.keys(profiles[game])
    const total = Object.values(stats).reduce((sum, bucket) => sum + bucket.n, 0)
    lines.push(`=== ${game}: 응답 ${total}건, 전문화 ${Object.keys(stats).length}/${labels.length}개에 데이터 있음 ===`)

    for (const label of labels) {
      const bucket = stats[label]
      if (!bucket || bucket.n < minN) continue
      const diffs = TRAITS.map((trait) => ({ trait, diff: Math.round(bucket.mean[trait] - profiles[game][label][trait]) })).filter(
        (d) => Math.abs(d.diff) >= 10,
      )
      if (diffs.length > 0) {
        const text = diffs.map((d) => `${d.trait} ${d.diff > 0 ? '+' : ''}${d.diff}`).join(', ')
        lines.push(`  ${label} (n=${bucket.n}) 실데이터가 프로필과 10 이상 다름: ${text}`)
      }
    }

    for (let i = 0; i < labels.length; i++) {
      for (let j = i + 1; j < labels.length; j++) {
        const a = labels[i]
        const b = labels[j]
        const d = distance(profiles[game][a], profiles[game][b])
        if (d >= near) continue
        let hint = '실데이터 부족'
        const sa = stats[a]
        const sb = stats[b]
        if (sa && sb && sa.n >= minN && sb.n >= minN) {
          const best = TRAITS.map((trait) => ({ trait, gap: sa.mean[trait] - sb.mean[trait] })).sort(
            (x, y) => Math.abs(y.gap) - Math.abs(x.gap),
          )[0]
          hint = `실데이터에서 가장 크게 갈리는 특성: ${best.trait} (${a} ${sa.mean[best.trait].toFixed(0)} vs ${b} ${sb.mean[best.trait].toFixed(0)})`
        }
        lines.push(`  가까운 쌍 d=${d.toFixed(1)}: ${a} ~ ${b} | ${hint}`)
      }
    }
  }
  return lines
}

function main() {
  const [input, ...flags] = process.argv.slice(2)
  if (!input) {
    console.error('사용법: node src/scripts/profile-calibration.js <survey_results.json> [--min-n 5] [--near 15]')
    process.exit(1)
  }
  const option = (name, fallback) => {
    const i = flags.indexOf(name)
    return i >= 0 ? Number(flags[i + 1]) : fallback
  }
  const rows = JSON.parse(fs.readFileSync(input, 'utf8'))
  const source = fs.readFileSync(path.join(__dirname, '..', 'lib', 'data.ts'), 'utf8')
  const lines = buildReport(parseProfiles(source), summarize(rows), { minN: option('--min-n', 5), near: option('--near', 15) })
  console.log(lines.join('\n'))
}

module.exports = { parseProfiles, summarize, buildReport }

if (require.main === module) main()
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npx prettier --write src/scripts/profile-calibration.js src/scripts/profile-calibration.test.js && npx jest src/scripts/profile-calibration.test.js && npm run lint`
Expected: 테스트 6개 PASS. lint가 `require` 사용을 지적하면(`@typescript-eslint/no-require-imports`) 두 파일 맨 위에 `/* eslint-disable @typescript-eslint/no-require-imports */`를 추가한다.

- [ ] **Step 5: README에 사용법 추가**

"🧠 추천 방식" 절 끝에 항목을 추가한다.

```markdown
- **실데이터 보정**: Supabase SQL Editor에서 `select app, class, specialization, answers from survey_results;` 결과를 JSON으로 내보낸 뒤 `node src/scripts/profile-calibration.js survey_results.json` 을 실행하면, 실데이터 평균이 프로필과 크게 다른 전문화와 서로 가까운 전문화 쌍(실데이터에서 갈리는 특성 포함)을 출력합니다. 이 리포트를 보고 `src/lib/data.ts`의 `big5`를 조정하고 테스트로 확인합니다.
```

- [ ] **Step 6: 전체 검증과 커밋**

Run: `npm test && npx tsc --noEmit && npm run lint`
Expected: 전부 PASS.

```bash
git add src/scripts/profile-calibration.js src/scripts/profile-calibration.test.js README.md
git commit -F - <<'EOF'
실데이터 기반 프로필 보정 리포트 스크립트 추가

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
EOF
```

---

## 마무리 확인

- [ ] `npm test`, `npx tsc --noEmit`, `npm run lint` 모두 통과
- [ ] `grep -rn "onnx" src --include=*.ts --include=*.tsx` 결과 없음 (`src/scripts/ml`의 Python은 제외)
- [ ] `grep -rn "AI" src --include=*.tsx` 결과 없음
- [ ] `git status` 깨끗함, 임시 파일 `add-profiles.tmp.js` 없음
