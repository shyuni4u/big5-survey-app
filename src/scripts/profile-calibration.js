#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * 실제 설문 응답(survey_results)과 src/lib/data.ts의 전문화 프로필을 비교해
 * 구분이 잘 안 되는 전문화 쌍을 실데이터 방향으로 벌릴 수 있도록 리포트를 출력합니다.
 *
 * 사용법:
 *   node src/scripts/profile-calibration.js <survey_results.csv|json> [--min-n 5] [--near 15]
 *
 * 입력: Supabase SQL Editor에서 아래 쿼리를 실행하고 결과를 CSV(다운로드 버튼) 또는 JSON으로 내보낸 파일
 *   select app, class, specialization, answers from survey_results;
 *
 * 출력:
 *   0) 중복 제거 후 응답자 모집단의 특성별 평균·표준편차 (src/lib/recommend.ts의 POPULATION_BASELINE 갱신용)
 *   1) 표본이 min-n 이상인 전문화 중 실데이터 평균이 프로필과 10 이상 다른 특성
 *   2) 현재 프로필에서 거리가 near 미만인 쌍과, 실데이터에서 그 둘이 가장 크게 갈리는 특성
 */
const fs = require('fs')
const path = require('path')

const TRAITS = ['E', 'A', 'C', 'N', 'O']
const GAMES = ['wow', 'lostark', 'dnf']

/** RFC 4180 방식 CSV를 헤더 키의 객체 배열로 읽는다. 큰따옴표 안의 쉼표·개행·겹친 큰따옴표를 처리하고 BOM과 빈 줄은 무시한다. */
function parseCsv(text) {
  const source = text.replace(/^﻿/, '')
  const records = []
  let row = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < source.length; i++) {
    const ch = source[i]
    if (inQuotes) {
      if (ch === '"') {
        if (source[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === ',') {
      row.push(field)
      field = ''
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && source[i + 1] === '\n') i++
      row.push(field)
      field = ''
      if (row.length > 1 || row[0] !== '') records.push(row)
      row = []
    } else {
      field += ch
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field)
    records.push(row)
  }
  const [header, ...body] = records
  if (!header) return []
  const keys = header.map((h) => h.trim())
  return body.map((cells) => Object.fromEntries(keys.map((key, i) => [key, cells[i] === undefined ? '' : cells[i]])))
}

/** 확장자에 따라 CSV 또는 JSON 파일을 행 배열로 읽는다. */
function readRows(inputPath) {
  const text = fs.readFileSync(inputPath, 'utf8')
  return inputPath.toLowerCase().endsWith('.csv') ? parseCsv(text) : JSON.parse(text)
}

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

/**
 * 응답 행을 게임/전문화별 n과 평균으로 요약한다. 완전히 같은 행(결과 페이지 새로고침 중복)은 한 번만 센다.
 * `summary.population`에는 게임을 가리지 않고 서로 다른 응답 벡터마다 한 번씩 센 모집단 평균·표준편차를 넣는다.
 */
function summarize(rows) {
  const summary = {}
  const seen = new Set()
  const vectors = new Map()
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
    const vectorKey = TRAITS.map((trait) => answers[trait]).join(',')
    vectors.set(vectorKey, answers)
    const key = `${game}|${label}|${vectorKey}`
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
  const all = [...vectors.values()]
  if (all.length > 0) {
    const mean = Object.fromEntries(
      TRAITS.map((trait) => [trait, all.reduce((sum, a) => sum + a[trait], 0) / all.length]),
    )
    const sd = Object.fromEntries(
      TRAITS.map((trait) => [
        trait,
        Math.sqrt(all.reduce((sum, a) => sum + (a[trait] - mean[trait]) ** 2, 0) / all.length),
      ]),
    )
    summary.population = { n: all.length, mean, sd }
  }
  return summary
}

const distance = (a, b) => Math.sqrt(TRAITS.reduce((sum, trait) => sum + (a[trait] - b[trait]) ** 2, 0))

/** 리포트 줄 배열을 만든다. */
function buildReport(profiles, summary, { minN = 5, near = 15 } = {}) {
  const lines = []
  if (summary.population) {
    const { n, mean, sd } = summary.population
    const fmt = (stats) => TRAITS.map((trait) => `${trait} ${Math.round(stats[trait])}`).join(', ')
    lines.push(`모집단(응답자 ${n}명) 평균 ${fmt(mean)} / 표준편차 ${fmt(sd)}`)
  }
  for (const game of GAMES) {
    const stats = summary[game] || {}
    const labels = Object.keys(profiles[game])
    const total = Object.values(stats).reduce((sum, bucket) => sum + bucket.n, 0)
    lines.push(`=== ${game}: 응답 ${total}건, 전문화 ${Object.keys(stats).length}/${labels.length}개에 데이터 있음 ===`)

    for (const label of labels) {
      const bucket = stats[label]
      if (!bucket || bucket.n < minN) continue
      const diffs = TRAITS.map((trait) => ({
        trait,
        diff: Math.round(bucket.mean[trait] - profiles[game][label][trait]),
      })).filter((d) => Math.abs(d.diff) >= 10)
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
    console.error('사용법: node src/scripts/profile-calibration.js <survey_results.csv|json> [--min-n 5] [--near 15]')
    process.exit(1)
  }
  const option = (name, fallback) => {
    const i = flags.indexOf(name)
    return i >= 0 ? Number(flags[i + 1]) : fallback
  }
  const rows = readRows(input)
  const source = fs.readFileSync(path.join(__dirname, '..', 'lib', 'data.ts'), 'utf8')
  const lines = buildReport(parseProfiles(source), summarize(rows), {
    minN: option('--min-n', 5),
    near: option('--near', 15),
  })
  console.log(lines.join('\n'))
}

module.exports = { parseCsv, readRows, parseProfiles, summarize, buildReport }

if (require.main === module) main()
