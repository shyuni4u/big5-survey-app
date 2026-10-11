/**
 * 학습용 데이터셋 빌더.
 *
 * 1. Supabase survey_results 전체를 REST API로 받아 (service_role 키 권장)
 * 2. data.ts 기준으로 app/class/specialization을 정규화하고 (대소문자 복구, 미지 라벨 제거)
 * 3. 전문화별로 목표 건수에 모자란 만큼 합성 데이터를 보충한 뒤
 * 4. src/scripts/data/<game>.csv 와 summary.json 을 쓴다.
 *
 * 실행:  npm run dataset -- --env ../path/to/.env.local [--target 500] [--threshold 50] [--spread 15] [--seed 42] [--games wow,lostark,dnf]
 *   --spread N : 실데이터 평균의 전문화 간 간격을 N점 수준으로 벌리는 대비 보정 (0이면 끔). lib.ts contrastFactors 참고.
 */
import fs from 'node:fs'
import path from 'node:path'
import { dnfClasses, lostarkClasses, wowClasses } from '@/lib/data'
import type { GameClass } from '@/lib/types'
import {
  GAME_KEYS,
  generateSynthetic,
  mulberry32,
  normalizeRows,
  planSynthetic,
  specKey,
  toCsv,
  validateProfiles,
  type Big5,
  type DatasetRow,
  type GameKey,
  type Profiles,
  type RawRow,
} from './lib'

const SCRIPTS_DIR = path.resolve(__dirname, '..')

function parseArgs(argv: string[]) {
  const opts = {
    env: path.resolve(process.cwd(), '.env.local'),
    target: 500,
    threshold: 50,
    spread: 15,
    seed: 42,
    std: 10,
    games: [...GAME_KEYS] as GameKey[],
    out: path.join(SCRIPTS_DIR, 'data'),
  }
  for (let i = 0; i < argv.length; i++) {
    const [flag, inlineValue] = argv[i].split('=')
    const value = inlineValue ?? argv[++i]
    switch (flag) {
      case '--env':
        opts.env = path.resolve(value)
        break
      case '--target':
        opts.target = Number(value)
        break
      case '--threshold':
        opts.threshold = Number(value)
        break
      case '--spread':
        opts.spread = Number(value)
        break
      case '--seed':
        opts.seed = Number(value)
        break
      case '--std':
        opts.std = Number(value)
        break
      case '--games':
        opts.games = value.split(',').map((g) => g.trim().toLowerCase()) as GameKey[]
        break
      case '--out':
        opts.out = path.resolve(value)
        break
      default:
        throw new Error(`unknown option ${flag}`)
    }
  }
  return opts
}

function loadEnv(file: string): Record<string, string> {
  const env: Record<string, string> = { ...(process.env as Record<string, string>) }
  if (!fs.existsSync(file)) return env
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    if (!line || line.startsWith('#') || !line.includes('=')) continue
    const i = line.indexOf('=')
    env[line.slice(0, i).trim()] = line
      .slice(i + 1)
      .trim()
      .replace(/^"|"$/g, '')
  }
  return env
}

async function fetchAllRows(url: string, key: string): Promise<RawRow[]> {
  const rows: RawRow[] = []
  const page = 1000
  for (let from = 0; ; from += page) {
    const res = await fetch(`${url}/rest/v1/survey_results?select=app,class,specialization,answers&order=id.asc`, {
      headers: { apikey: key, Authorization: `Bearer ${key}`, Range: `${from}-${from + page - 1}` },
    })
    if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`)
    const batch = (await res.json()) as RawRow[]
    rows.push(...batch)
    if (batch.length < page) break
  }
  return rows
}

function loadProfiles(game: GameKey): Profiles {
  const file = path.join(SCRIPTS_DIR, 'profiles', `${game}.json`)
  return JSON.parse(fs.readFileSync(file, 'utf8')) as Profiles
}

const CLASSES: Record<GameKey, GameClass[]> = { wow: wowClasses, lostark: lostarkClasses, dnf: dnfClasses }

async function main() {
  const opts = parseArgs(process.argv.slice(2))
  const env = loadEnv(opts.env)
  const url = env.SUPABASE_URL ?? env.NEXT_PUBLIC_SUPABASE_URL
  const key = env.SUPABASE_SERVICE_ROLE_KEY ?? env.SUPABASE_ANON_KEY ?? env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error(`SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not found (env file: ${opts.env})`)
  if (!env.SUPABASE_SERVICE_ROLE_KEY)
    console.warn('⚠ service_role 키가 없어 anon 키로 조회합니다. RLS 때문에 0건이 나올 수 있습니다.')

  console.log('Supabase에서 survey_results를 가져오는 중...')
  const raw = await fetchAllRows(url, key)
  console.log(`  받은 행: ${raw.length}`)

  const { kept, dropped } = normalizeRows(raw, CLASSES)
  console.log(`  정규화 후: ${kept.length} (버림 ${dropped.length})`)
  const dropReasons = new Map<string, number>()
  for (const d of dropped) {
    const label = `${d.reason}: ${d.row.app}/${d.row.class}/${d.row.specialization}`
    dropReasons.set(label, (dropReasons.get(label) ?? 0) + 1)
  }
  for (const [label, n] of [...dropReasons.entries()].sort((a, b) => b[1] - a[1])) console.log(`    - ${label} ×${n}`)

  fs.mkdirSync(opts.out, { recursive: true })
  const summary: Record<string, unknown> = {
    generatedAt: new Date().toISOString(),
    options: { ...opts, env: '<redacted>' },
  }

  for (const game of opts.games) {
    const classes = CLASSES[game]
    const profiles = loadProfiles(game)
    const missing = validateProfiles(classes, profiles)
    if (missing.length) throw new Error(`profiles/${game}.json에 프로필이 없는 전문화: ${missing.join(', ')}`)

    const realBySpec = new Map<string, Big5[]>()
    const realRows: DatasetRow[] = []
    for (const r of kept) {
      if (r.app !== game) continue
      realRows.push(r)
      const k = specKey(r.class, r.specialization)
      realBySpec.set(k, [...(realBySpec.get(k) ?? []), r.answers])
    }

    const plan = planSynthetic(classes, realBySpec, profiles, {
      target: opts.target,
      threshold: opts.threshold,
      spread: opts.spread,
    })
    const rng = mulberry32(opts.seed)
    const rows: DatasetRow[] = [...realRows]
    for (const p of plan)
      rows.push(...generateSynthetic(game, p.class, p.specialization, p.mean, p.syntheticCount, rng, opts.std))

    const csvPath = path.join(opts.out, `${game}.csv`)
    fs.writeFileSync(csvPath, toCsv(rows) + '\n', 'utf8')

    const realTotal = plan.reduce((s, p) => s + p.realCount, 0)
    const synthTotal = plan.reduce((s, p) => s + p.syntheticCount, 0)
    console.log(
      `\n[${game}] 전문화 ${plan.length}개, 실데이터 ${realTotal} + 합성 ${synthTotal} = ${rows.length}행 → ${path.relative(process.cwd(), csvPath)}`,
    )
    for (const p of plan) {
      const mean = (['A', 'C', 'E', 'N', 'O'] as const).map((t) => `${t}${Math.round(p.mean[t])}`).join(' ')
      console.log(
        `  ${String(p.realCount).padStart(4)} real + ${String(p.syntheticCount).padStart(4)} synth  ${p.key.padEnd(40)} ${mean}`,
      )
    }
    summary[game] = {
      specs: plan.length,
      real: realTotal,
      synthetic: synthTotal,
      perSpec: plan.map((p) => ({ key: p.key, real: p.realCount, synthetic: p.syntheticCount, mean: p.mean })),
    }
  }

  fs.writeFileSync(path.join(opts.out, 'summary.json'), JSON.stringify(summary, null, 2) + '\n', 'utf8')
  console.log(`\n요약: ${path.relative(process.cwd(), path.join(opts.out, 'summary.json'))}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
