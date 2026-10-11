import {
  buildReason,
  normalizeScores,
  profileDistance,
  rankSpecs,
  recommend,
  roleFit,
  specFit,
  MIN_PROFILE_DISTANCE,
  POPULATION_BASELINE,
  ROLE_ARCHETYPES,
  TRAITS,
} from '@/lib/recommend'
import { getGameClasses } from '@/lib/data'
import type { GameSpec, PersonalityScores } from '@/lib/types'

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
        if (distance < MIN_PROFILE_DISTANCE)
          tooClose.push(`${specs[i].label} ~ ${specs[j].label} = ${distance.toFixed(1)}`)
      }
    }
    expect(tooClose).toEqual([])
  })
})

it('던파 남/여 동명 전직 9쌍은 서로 다른 프로필을 가진다', () => {
  const specs = specsOf('dnf')
  const names = [
    'Nen Master',
    'Striker',
    'Brawler',
    'Grappler',
    'Ranger',
    'Launcher',
    'Mechanic',
    'Spitfire',
    'Crusader',
  ]
  const tooClose: string[] = []
  for (const name of names) {
    const pair = specs.filter((s) => s.spec.name === name)
    expect(pair).toHaveLength(2)
    const distance = profileDistance(pair[0].spec.big5, pair[1].spec.big5)
    if (distance < MIN_PROFILE_DISTANCE) tooClose.push(`${name}: ${distance.toFixed(1)}`)
  }
  expect(tooClose).toEqual([])
})

describe('normalizeScores', () => {
  it('모집단 평균 입력은 모든 특성이 50이다', () => {
    const normalized = normalizeScores(POPULATION_BASELINE.mean)
    for (const trait of TRAITS) expect(normalized[trait]).toBe(50)
  })

  it('평균 + 1표준편차 입력은 모든 특성이 75이다', () => {
    const plusOne = scores(39 + 21, 53 + 15, 56 + 18, 49 + 20, 55 + 16)
    const normalized = normalizeScores(plusOne)
    for (const trait of TRAITS) expect(normalized[trait]).toBeCloseTo(75, 5)
  })

  it('0~100 밖은 잘린다', () => {
    const high = normalizeScores(scores(100, 100, 100, 100, 100))
    for (const trait of TRAITS) expect(high[trait]).toBe(100)
    const low = normalizeScores(scores(0, 0, 0, 0, 0))
    for (const trait of ['A', 'C', 'N', 'O'] as const) expect(low[trait]).toBe(0)
    // E는 평균 39, 표준편차 21이라 0점이 50 - 25*39/21 ≈ 3.6으로 남는다
    expect(low.E).toBeCloseTo(50 - (25 * 39) / 21, 5)
  })

  it('입력 객체를 바꾸지 않는다', () => {
    const raw = scores(60, 60, 60, 60, 60)
    normalizeScores(raw)
    expect(raw).toEqual(scores(60, 60, 60, 60, 60))
  })
})

describe('recommend', () => {
  const neutral = scores(50, 50, 50, 50, 50)

  it('정규화한 뒤 rankSpecs를 호출한 결과와 같다', () => {
    const raw = scores(60, 90, 80, 20, 50)
    expect(recommend('wow', raw)).toEqual(rankSpecs('wow', normalizeScores(raw)))
  })

  it('원점수 힐러형(E60 A90 C80 N20 O50)은 상위 3개가 모두 힐러다', () => {
    const top3 = recommend('wow', scores(60, 90, 80, 20, 50)).slice(0, 3)
    for (const r of top3) expect(specsOf('wow').find((s) => s.label === r.label)!.spec.role).toBe('healer')
  })

  it('게임의 모든 전문화를 점수 내림차순으로 돌려준다', () => {
    const result = recommend('wow', neutral)
    expect(result).toHaveLength(40)
    const values = result.map((r) => r.score)
    expect(values).toEqual([...values].sort((a, b) => b - a))
    expect(new Set(result.map((r) => r.label)).size).toBe(40)
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

/** 골든 성향 테스트. 설계 문서 8.3. 입력은 정규화된 척도의 값이라 rankSpecs를 직접 호출한다. 순서는 E, A, C, N, O. */
const roleOf = (game: string, label: string) => specsOf(game).find((s) => s.label === label)!.spec.role
const specNameOf = (label: string) => label.split('_')[1]
const top3 = (game: string, s: PersonalityScores) =>
  rankSpecs(game, s)
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
    expect(
      r.filter((x) => ['Rogue_Outlaw', 'Mage_Fire', 'Warrior_Fury', 'Demon Hunter_Havoc'].includes(x.label)).length,
    ).toBeGreaterThanOrEqual(2)
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
    expect(
      countIn(r, ['Blade', 'Reaper', 'Deadeye', 'Gunslinger', 'Slayer', 'Striker', 'Battle Master', 'Glaivier']),
    ).toBeGreaterThanOrEqual(2)
  })
  it('계획 파괴자는 블래스터/서머너/소서리스/호크아이 중 하나가 1위다', () => {
    expect(['Artillerist', 'Summoner', 'Sorceress', 'Sharpshooter']).toContain(
      top3('lostark', scores(35, 45, 90, 55, 50))[0].spec,
    )
  })
  it('변칙 전략가는 기공사/스카우터/아르카나/기상술사/환수사/소울이터 중 2개 이상이 상위 3개에 든다', () => {
    const r = top3('lostark', scores(55, 50, 60, 45, 95))
    expect(
      countIn(r, ['Soulfist', 'Machinist', 'Arcanist', 'Aeromancer', 'Wildsoul', 'Souleater']),
    ).toBeGreaterThanOrEqual(2)
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
    expect(
      countIn(r, ['Soul Bender', 'Mechanic', 'Summoner', 'Elementalist', 'Necromancer', 'Dimension Walker']),
    ).toBeGreaterThanOrEqual(2)
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
