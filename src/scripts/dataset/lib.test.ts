import type { GameClass, GameSpec } from '@/lib/types'
import {
  blendMean,
  contrastFactors,
  generateSynthetic,
  mulberry32,
  normalizeRows,
  planSynthetic,
  specKey,
  stretchMean,
  toCsv,
  validateProfiles,
  type Big5,
  type Profiles,
} from './lib'

// 데이터셋 빌더는 추천용 프로필(big5/signature)을 쓰지 않지만 GameSpec의 필수 필드라 중립값을 채운다.
const neutralProfile: Pick<GameSpec, 'big5' | 'signature'> = {
  big5: { E: 50, A: 50, C: 50, N: 50, O: 50 },
  signature: ['E'],
}

const classes: Record<'wow' | 'lostark' | 'dnf', GameClass[]> = {
  wow: [
    {
      name: 'Warrior',
      nameKr: '전사',
      image: '',
      color: '',
      specs: [
        { name: 'Arms', nameKr: '무기', role: 'dealer', description: '', ...neutralProfile },
        { name: 'Protection', nameKr: '방어', role: 'tanker', description: '', ...neutralProfile },
      ],
    },
  ],
  lostark: [
    {
      name: 'Mage (Female)',
      nameKr: '마법사 (여)',
      image: '',
      color: '',
      specs: [{ name: 'Bard', nameKr: '바드', role: 'supporter', description: '', ...neutralProfile }],
    },
  ],
  dnf: [],
}

const answers = (A: number, C = 50, E = 50, N = 50, O = 50): Big5 => ({ A, C, E, N, O })

describe('normalizeRows', () => {
  it('keeps rows whose app/class/spec match data.ts exactly', () => {
    const { kept, dropped } = normalizeRows(
      [{ app: 'wow', class: 'Warrior', specialization: 'Arms', answers: answers(70) }],
      classes,
    )
    expect(dropped).toHaveLength(0)
    expect(kept).toEqual([
      { app: 'wow', class: 'Warrior', specialization: 'Arms', answers: answers(70), source: 'real' },
    ])
  })

  it('repairs case differences in app, class and specialization', () => {
    const { kept } = normalizeRows(
      [
        { app: 'WoW', class: 'warrior', specialization: 'protection', answers: answers(60) },
        { app: 'LostArk', class: 'mage (female)', specialization: 'bard', answers: answers(80) },
      ],
      classes,
    )
    expect(kept.map((r) => `${r.app}:${specKey(r.class, r.specialization)}`)).toEqual([
      'wow:Warrior_Protection',
      'lostark:Mage (Female)_Bard',
    ])
  })

  it('drops rows with unknown app, class or spec and reports why', () => {
    const { kept, dropped } = normalizeRows(
      [
        { app: 'overwatch', class: 'Warrior', specialization: 'Arms', answers: answers(50) },
        { app: 'wow', class: 'Paladin', specialization: 'Holy', answers: answers(50) },
        { app: 'wow', class: 'Warrior', specialization: 'Fury', answers: answers(50) },
      ],
      classes,
    )
    expect(kept).toHaveLength(0)
    expect(dropped.map((d) => d.reason)).toEqual(['unknown app', 'unknown class', 'unknown specialization'])
  })

  it('parses JSON-string answers and rounds to integers, dropping malformed ones', () => {
    const { kept, dropped } = normalizeRows(
      [
        { app: 'wow', class: 'Warrior', specialization: 'Arms', answers: '{"A":70.4,"C":50,"E":50,"N":50,"O":50}' },
        { app: 'wow', class: 'Warrior', specialization: 'Arms', answers: { A: 70, C: 50, E: 50, N: 50 } },
        { app: 'wow', class: 'Warrior', specialization: 'Arms', answers: { A: 170, C: 50, E: 50, N: 50, O: 50 } },
        { app: 'wow', class: 'Warrior', specialization: 'Arms', answers: null },
      ],
      classes,
    )
    expect(kept).toHaveLength(1)
    expect(kept[0].answers).toEqual(answers(70))
    expect(dropped).toHaveLength(3)
    expect(dropped.every((d) => d.reason === 'invalid answers')).toBe(true)
  })
})

describe('blendMean', () => {
  const profile: Big5 = { A: 20, C: 20, E: 20, N: 20, O: 20 }
  const real = Array.from({ length: 25 }, () => answers(60, 60, 60, 60, 60))

  it('returns the profile when there is no real data', () => {
    expect(blendMean(profile, [], 50)).toEqual(profile)
  })

  it('returns the empirical mean once real rows reach the threshold', () => {
    const many = Array.from({ length: 50 }, (_, i) => answers(i % 2 === 0 ? 40 : 80, 60, 60, 60, 60))
    expect(blendMean(profile, many, 50)).toEqual({ A: 60, C: 60, E: 60, N: 60, O: 60 })
  })

  it('blends profile and empirical mean proportionally below the threshold', () => {
    // 25/50 real weight → halfway between 20 and 60
    expect(blendMean(profile, real, 50)).toEqual({ A: 40, C: 40, E: 40, N: 40, O: 40 })
  })
})

describe('contrastFactors', () => {
  it('returns 1 for every trait when there are too few empirical specs', () => {
    const means = [answers(50), answers(60), answers(70)]
    expect(contrastFactors(means, 15, 5)).toEqual({ A: 1, C: 1, E: 1, N: 1, O: 1 })
  })

  it('scales each trait so the between-spec spread reaches the target, clamped to [1, 4]', () => {
    // A: means 40..60 (std 7.07) → 15/7.07 ≈ 2.12 ; C: all 50 (std 0) → clamp 4 ; E: std 28 → below 1 → 1
    const means = [
      answers(40, 50, 10),
      answers(45, 50, 30),
      answers(50, 50, 50),
      answers(55, 50, 70),
      answers(60, 50, 90),
    ]
    const k = contrastFactors(means, 15, 5)
    expect(k.A).toBeCloseTo(2.12, 2)
    expect(k.C).toBe(4)
    expect(k.E).toBe(1)
  })
})

describe('stretchMean', () => {
  it('pushes a mean away from the global mean by the factor and clips to 10..90', () => {
    const global: Big5 = { A: 50, C: 50, E: 50, N: 50, O: 50 }
    const k: Big5 = { A: 3, C: 3, E: 3, N: 3, O: 3 }
    expect(stretchMean(answers(55, 45, 50, 70, 30), global, k)).toEqual({ A: 65, C: 35, E: 50, N: 90, O: 10 })
  })
})

describe('planSynthetic', () => {
  const profiles: Profiles = {
    Warrior: { Arms: { A: 30, C: 60, E: 70, N: 50, O: 50 }, Protection: { A: 80, C: 95, E: 85, N: 15, O: 55 } },
  }

  it('contrast-stretches empirical means when spread is set, leaving profile-only specs alone', () => {
    const cls: GameClass[] = [
      {
        name: 'X',
        nameKr: 'X',
        image: '',
        color: '',
        specs: ['S1', 'S2', 'S3', 'S4', 'S5', 'P'].map((n) => ({
          name: n,
          nameKr: n,
          role: 'dealer' as const,
          description: '',
          ...neutralProfile,
        })),
      },
    ]
    const prof: Profiles = { X: {} }
    for (const n of ['S1', 'S2', 'S3', 'S4', 'S5', 'P']) prof.X[n] = { A: 20, C: 50, E: 50, N: 50, O: 50 }
    const real = new Map<string, Big5[]>()
    // five empirical specs whose A means are 48,49,50,51,52 (std ≈ 1.41) → k = min(4, 15/1.41) = 4
    ;['S1', 'S2', 'S3', 'S4', 'S5'].forEach((n, i) =>
      real.set(
        `X_${n}`,
        Array.from({ length: 60 }, () => answers(48 + i)),
      ),
    )
    const plan = planSynthetic(cls, real, prof, { target: 100, threshold: 50, spread: 15 })
    const byKey = Object.fromEntries(plan.map((p) => [p.key, p]))
    expect(byKey.X_S1.mean.A).toBeCloseTo(42) // 50 + 4 * (48 - 50)
    expect(byKey.X_S5.mean.A).toBeCloseTo(58)
    expect(byKey.X_S3.mean.A).toBeCloseTo(50)
    expect(byKey.X_P.mean).toEqual({ A: 20, C: 50, E: 50, N: 50, O: 50 }) // no real rows → profile untouched
  })

  it('leaves empirical means untouched when spread is 0', () => {
    const real = new Map<string, Big5[]>([['Warrior_Arms', Array.from({ length: 60 }, () => answers(55))]])
    const plan = planSynthetic(classes.wow, real, profiles, { target: 100, threshold: 50, spread: 0 })
    expect(plan[0].mean.A).toBe(55)
  })

  it('fills each spec up to the target and never goes negative', () => {
    const real = new Map<string, Big5[]>([
      ['Warrior_Arms', Array.from({ length: 120 }, () => answers(50))],
      ['Warrior_Protection', Array.from({ length: 600 }, () => answers(50))],
    ])
    const plan = planSynthetic(classes.wow, real, profiles, { target: 500, threshold: 50 })
    expect(plan.map((p) => [p.key, p.realCount, p.syntheticCount])).toEqual([
      ['Warrior_Arms', 120, 380],
      ['Warrior_Protection', 600, 0],
    ])
  })

  it('uses the profile mean for specs with no real data', () => {
    const plan = planSynthetic(classes.wow, new Map(), profiles, { target: 10, threshold: 50 })
    expect(plan[0].mean).toEqual(profiles.Warrior.Arms)
    expect(plan[0].syntheticCount).toBe(10)
  })
})

describe('validateProfiles', () => {
  it('lists every spec that has no profile', () => {
    const profiles: Profiles = { Warrior: { Arms: { A: 30, C: 60, E: 70, N: 50, O: 50 } } }
    expect(validateProfiles(classes.wow, profiles)).toEqual(['Warrior_Protection'])
  })

  it('returns an empty list when every spec is covered', () => {
    const profiles: Profiles = {
      Warrior: { Arms: { A: 30, C: 60, E: 70, N: 50, O: 50 }, Protection: { A: 80, C: 95, E: 85, N: 15, O: 55 } },
    }
    expect(validateProfiles(classes.wow, profiles)).toEqual([])
  })
})

describe('generateSynthetic', () => {
  it('is deterministic for a seed and stays within 0..100 integers', () => {
    const mean: Big5 = { A: 85, C: 20, E: 50, N: 95, O: 5 }
    const a = generateSynthetic('wow', 'Warrior', 'Arms', mean, 200, mulberry32(7), 10)
    const b = generateSynthetic('wow', 'Warrior', 'Arms', mean, 200, mulberry32(7), 10)
    expect(a).toEqual(b)
    expect(a).toHaveLength(200)
    for (const row of a) {
      expect(row.source).toBe('synthetic')
      for (const v of Object.values(row.answers)) {
        expect(Number.isInteger(v)).toBe(true)
        expect(v).toBeGreaterThanOrEqual(0)
        expect(v).toBeLessThanOrEqual(100)
      }
    }
  })

  it('scatters around the requested mean', () => {
    const mean: Big5 = { A: 60, C: 40, E: 70, N: 30, O: 50 }
    const rows = generateSynthetic('wow', 'Warrior', 'Arms', mean, 4000, mulberry32(1), 10)
    for (const trait of ['A', 'C', 'E', 'N', 'O'] as const) {
      const avg = rows.reduce((s, r) => s + r.answers[trait], 0) / rows.length
      expect(Math.abs(avg - mean[trait])).toBeLessThan(1.5)
    }
  })
})

describe('toCsv', () => {
  it('writes the header train.py expects and quotes the JSON answers column', () => {
    const csv = toCsv([{ app: 'wow', class: 'Warrior', specialization: 'Arms', answers: answers(70), source: 'real' }])
    const [header, row] = csv.split('\n')
    expect(header).toBe('app,answers,class,specialization,source')
    expect(row).toBe('wow,"{""A"":70,""C"":50,""E"":50,""N"":50,""O"":50}",Warrior,Arms,real')
  })
})
