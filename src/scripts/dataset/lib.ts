import type { GameClass } from '@/lib/types'

/** Big5 점수. 각 특성은 0~100 정수. */
export type Big5 = { A: number; C: number; E: number; N: number; O: number }
export const TRAITS = ['A', 'C', 'E', 'N', 'O'] as const

export type GameKey = 'wow' | 'lostark' | 'dnf'
export const GAME_KEYS: GameKey[] = ['wow', 'lostark', 'dnf']

/** Supabase survey_results 한 행 (정규화 전). */
export type RawRow = {
  app?: string | null
  class?: string | null
  specialization?: string | null
  answers?: unknown
}

/** 학습 CSV 한 행. */
export type DatasetRow = {
  app: GameKey
  class: string
  specialization: string
  answers: Big5
  source: 'real' | 'synthetic'
}

/** profiles/<game>.json 구조: { [class]: { [spec]: {A,C,E,N,O, note?} } } */
export type Profiles = Record<string, Record<string, Big5 & { note?: string }>>

export const specKey = (cls: string, spec: string) => `${cls}_${spec}`

const isFiniteNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)

function parseAnswers(raw: unknown): Big5 | null {
  let obj: unknown = raw
  if (typeof raw === 'string') {
    try {
      obj = JSON.parse(raw)
    } catch {
      return null
    }
  }
  if (!obj || typeof obj !== 'object') return null
  const out = {} as Big5
  for (const trait of TRAITS) {
    const v = (obj as Record<string, unknown>)[trait]
    if (!isFiniteNumber(v) || v < 0 || v > 100) return null
    out[trait] = Math.round(v)
  }
  return out
}

/**
 * Supabase 행을 data.ts 기준 정식 이름으로 정규화한다.
 * app/class/specialization은 대소문자를 무시하고 매칭하며, 매칭되지 않거나 answers가 깨진 행은 버린다.
 */
export function normalizeRows(
  rows: RawRow[],
  classesByGame: Record<GameKey, GameClass[]>,
): { kept: DatasetRow[]; dropped: { reason: string; row: RawRow }[] } {
  const lookup = new Map<GameKey, Map<string, { name: string; specs: Map<string, string> }>>()
  for (const game of GAME_KEYS) {
    const byClass = new Map<string, { name: string; specs: Map<string, string> }>()
    for (const cls of classesByGame[game] ?? []) {
      byClass.set(cls.name.toLowerCase(), {
        name: cls.name,
        specs: new Map(cls.specs.map((s) => [s.name.toLowerCase(), s.name])),
      })
    }
    lookup.set(game, byClass)
  }

  const kept: DatasetRow[] = []
  const dropped: { reason: string; row: RawRow }[] = []
  for (const row of rows) {
    const app = (row.app ?? '').trim().toLowerCase() as GameKey
    const byClass = lookup.get(app)
    if (!byClass) {
      dropped.push({ reason: 'unknown app', row })
      continue
    }
    const cls = byClass.get((row.class ?? '').trim().toLowerCase())
    if (!cls) {
      dropped.push({ reason: 'unknown class', row })
      continue
    }
    const spec = cls.specs.get((row.specialization ?? '').trim().toLowerCase())
    if (!spec) {
      dropped.push({ reason: 'unknown specialization', row })
      continue
    }
    const answers = parseAnswers(row.answers)
    if (!answers) {
      dropped.push({ reason: 'invalid answers', row })
      continue
    }
    kept.push({ app, class: cls.name, specialization: spec, answers, source: 'real' })
  }
  return { kept, dropped }
}

/** 실데이터 평균. 행이 없으면 null. */
export function empiricalMean(rows: Big5[]): Big5 | null {
  if (rows.length === 0) return null
  const sum = { A: 0, C: 0, E: 0, N: 0, O: 0 }
  for (const r of rows) for (const t of TRAITS) sum[t] += r[t]
  const out = {} as Big5
  for (const t of TRAITS) out[t] = sum[t] / rows.length
  return out
}

/**
 * 합성 데이터의 중심값. 실데이터가 threshold 건 이상이면 실데이터 평균을 그대로 쓰고,
 * 그 미만이면 추정 프로필과 실데이터 평균을 (n / threshold) 비율로 섞는다.
 */
export function blendMean(profile: Big5, realRows: Big5[], threshold: number): Big5 {
  const emp = empiricalMean(realRows)
  if (!emp) return { ...profile }
  const w = Math.min(1, realRows.length / threshold)
  const out = {} as Big5
  for (const t of TRAITS) out[t] = w * emp[t] + (1 - w) * profile[t]
  return out
}

/** data.ts의 모든 전문화 중 프로필이 없는 것의 키 목록. */
export function validateProfiles(classes: GameClass[], profiles: Profiles): string[] {
  const missing: string[] = []
  for (const cls of classes) {
    for (const spec of cls.specs) {
      const p = profiles[cls.name]?.[spec.name]
      if (!p || TRAITS.some((t) => !isFiniteNumber(p[t]))) missing.push(specKey(cls.name, spec.name))
    }
  }
  return missing
}

export type SpecPlan = {
  key: string
  class: string
  specialization: string
  realCount: number
  syntheticCount: number
  mean: Big5
}

const STRETCH_MIN = 1
const STRETCH_MAX = 4
const STRETCH_CLIP = { min: 10, max: 90 }

/**
 * 특성별 대비(contrast) 계수. 실데이터 평균들의 전문화 간 표준편차가 spread 에 이르도록 하는 배율을
 * [1, 4] 범위에서 고른다. 실데이터에서는 전문화 간 평균 차이(3~5점)가 개인차(15~20점)보다 훨씬 작아
 * 그대로 학습하면 모델이 사실상 균등 분포를 내놓기 때문에, 전문화 간 "방향"은 실데이터에서 가져오되
 * 간격만 손으로 만든 프로필 수준(약 15점)으로 벌린다. 표본이 minSpecs 개 미만이면 1(변화 없음).
 */
export function contrastFactors(empiricalMeans: Big5[], spread: number, minSpecs = 5): Big5 {
  const k = { A: 1, C: 1, E: 1, N: 1, O: 1 }
  if (spread <= 0 || empiricalMeans.length < minSpecs) return k
  for (const t of TRAITS) {
    const g = empiricalMeans.reduce((s, m) => s + m[t], 0) / empiricalMeans.length
    const sd = Math.sqrt(empiricalMeans.reduce((s, m) => s + (m[t] - g) ** 2, 0) / empiricalMeans.length)
    k[t] = sd === 0 ? STRETCH_MAX : Math.min(STRETCH_MAX, Math.max(STRETCH_MIN, spread / sd))
  }
  return k
}

/** 전역 평균에서 벗어난 만큼을 k 배로 늘리고 10~90 으로 자른다. */
export function stretchMean(mean: Big5, global: Big5, k: Big5): Big5 {
  const out = {} as Big5
  for (const t of TRAITS) {
    out[t] = Math.min(STRETCH_CLIP.max, Math.max(STRETCH_CLIP.min, global[t] + k[t] * (mean[t] - global[t])))
  }
  return out
}

/**
 * 전문화별로 실데이터 수와 보충할 합성 데이터 수, 합성 중심값을 정한다.
 * spread > 0 이면 실데이터 평균 부분에만 대비 보정을 적용한다 (추정 프로필은 손대지 않음).
 */
export function planSynthetic(
  classes: GameClass[],
  realBySpec: Map<string, Big5[]>,
  profiles: Profiles,
  opts: { target: number; threshold: number; spread?: number },
): SpecPlan[] {
  const spread = opts.spread ?? 0
  const empirical = new Map<string, Big5>()
  for (const cls of classes) {
    for (const spec of cls.specs) {
      const key = specKey(cls.name, spec.name)
      const emp = empiricalMean(realBySpec.get(key) ?? [])
      if (emp) empirical.set(key, emp)
    }
  }
  const wellSampled = [...empirical.entries()]
    .filter(([key]) => (realBySpec.get(key)?.length ?? 0) >= opts.threshold)
    .map(([, m]) => m)
  const k = contrastFactors(wellSampled, spread)
  const global = empiricalMean(wellSampled) ?? { A: 50, C: 50, E: 50, N: 50, O: 50 }

  const plan: SpecPlan[] = []
  for (const cls of classes) {
    for (const spec of cls.specs) {
      const key = specKey(cls.name, spec.name)
      const real = realBySpec.get(key) ?? []
      const profile = profiles[cls.name]?.[spec.name]
      if (!profile) throw new Error(`profile missing for ${key}`)
      const { A, C, E, N, O } = profile
      const emp = empirical.get(key)
      const stretched = emp && spread > 0 ? stretchMean(emp, global, k) : emp
      // blendMean 과 같은 가중치(n/threshold)로 보정된 실데이터 평균과 프로필을 섞는다.
      const w = Math.min(1, real.length / opts.threshold)
      const mean = {} as Big5
      for (const t of TRAITS) mean[t] = stretched ? w * stretched[t] + (1 - w) * profile[t] : profile[t]
      plan.push({
        key,
        class: cls.name,
        specialization: spec.name,
        realCount: real.length,
        syntheticCount: Math.max(0, opts.target - real.length),
        mean: spread > 0 ? mean : blendMean({ A, C, E, N, O }, real, opts.threshold),
      })
    }
  }
  return plan
}

/** 시드 기반 난수 생성기 (재현 가능한 합성 데이터용). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function gaussian(rng: () => number, mean: number, std: number): number {
  let u = 0
  let v = 0
  while (u === 0) u = rng()
  while (v === 0) v = rng()
  return mean + std * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

const clip = (v: number) => Math.min(100, Math.max(0, Math.round(v)))

/** 주어진 중심값 주변에 정규분포(표준편차 std)로 합성 행을 만든다. */
export function generateSynthetic(
  app: GameKey,
  cls: string,
  spec: string,
  mean: Big5,
  count: number,
  rng: () => number,
  std = 10,
): DatasetRow[] {
  const rows: DatasetRow[] = []
  for (let i = 0; i < count; i++) {
    const answers = {} as Big5
    for (const t of TRAITS) answers[t] = clip(gaussian(rng, mean[t], std))
    rows.push({ app, class: cls, specialization: spec, answers, source: 'synthetic' })
  }
  return rows
}

function escapeCsv(value: string): string {
  return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

/** train.py가 읽는 CSV (app, answers, class, specialization + source). */
export function toCsv(rows: DatasetRow[]): string {
  const lines = ['app,answers,class,specialization,source']
  for (const r of rows) {
    const answers = JSON.stringify({ A: r.answers.A, C: r.answers.C, E: r.answers.E, N: r.answers.N, O: r.answers.O })
    lines.push([r.app, escapeCsv(answers), escapeCsv(r.class), escapeCsv(r.specialization), r.source].join(','))
  }
  return lines.join('\n')
}
