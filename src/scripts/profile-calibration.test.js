/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs')
const path = require('path')
const { parseCsv, parseProfiles, summarize, buildReport } = require('./profile-calibration')

const dataTs = fs.readFileSync(path.join(__dirname, '..', 'lib', 'data.ts'), 'utf8')

describe('parseCsv', () => {
  it('Supabase 내보내기 형식(큰따옴표로 감싼 JSON, 겹친 큰따옴표)을 행 객체로 읽는다', () => {
    const csv =
      'app,class,specialization,answers\r\n' +
      'WoW,Mage,Fire,"{""E"":61,""A"":62,""C"":63,""N"":48,""O"":73}"\r\n' +
      'LostArk,Warrior (Male),Holy Knight,"{""E"":59,""A"":34,""C"":34,""N"":52,""O"":74}"\n'
    const rows = parseCsv(csv)
    expect(rows).toHaveLength(2)
    expect(rows[0]).toEqual({
      app: 'WoW',
      class: 'Mage',
      specialization: 'Fire',
      answers: '{"E":61,"A":62,"C":63,"N":48,"O":73}',
    })
    expect(rows[1].class).toBe('Warrior (Male)')
    expect(rows[1].specialization).toBe('Holy Knight')
  })

  it('BOM과 빈 줄을 무시한다', () => {
    const rows = parseCsv(
      '﻿app,class,specialization,answers\n\nDNF,Thief,Rogue,"{""E"":1,""A"":2,""C"":3,""N"":4,""O"":5}"\n\n',
    )
    expect(rows).toHaveLength(1)
    expect(rows[0].app).toBe('DNF')
  })
})

describe('parseProfiles', () => {
  it('data.ts에서 세 게임의 프로필을 모두 읽는다', () => {
    const profiles = parseProfiles(dataTs)
    expect(Object.keys(profiles.wow)).toHaveLength(39)
    expect(Object.keys(profiles.lostark)).toHaveLength(28)
    expect(Object.keys(profiles.dnf)).toHaveLength(69)
    expect(profiles.wow['Mage_Arcane']).toEqual({
      role: 'dealer',
      E: 20,
      A: 30,
      C: 95,
      N: 55,
      O: 85,
      signature: ['C', 'O'],
    })
  })
})

describe('summarize', () => {
  it('완전히 같은 행은 한 번만 세고, 문자열 answers도 읽으며, 평균을 낸다', () => {
    const rows = [
      { app: 'WoW', class: 'Mage', specialization: 'Arcane', answers: { E: 20, A: 30, C: 90, N: 50, O: 80 } },
      { app: 'WoW', class: 'Mage', specialization: 'Arcane', answers: { E: 20, A: 30, C: 90, N: 50, O: 80 } },
      {
        app: 'WoW',
        class: 'Mage',
        specialization: 'Arcane',
        answers: JSON.stringify({ E: 40, A: 30, C: 90, N: 50, O: 80 }),
      },
      { app: 'DNF', class: 'Thief', specialization: 'Rogue', answers: null },
    ]
    const summary = summarize(rows)
    expect(summary.wow['Mage_Arcane'].n).toBe(2)
    expect(summary.wow['Mage_Arcane'].mean.E).toBe(30)
    expect(summary.dnf).toBeUndefined()
  })

  it('모집단 통계는 게임을 가리지 않고 서로 다른 응답 벡터마다 한 번씩 센다', () => {
    const rows = [
      { app: 'WoW', class: 'Mage', specialization: 'Arcane', answers: { E: 20, A: 50, C: 50, N: 50, O: 50 } },
      { app: 'WoW', class: 'Mage', specialization: 'Fire', answers: { E: 20, A: 50, C: 50, N: 50, O: 50 } },
      { app: 'DNF', class: 'Thief', specialization: 'Rogue', answers: { E: 60, A: 50, C: 50, N: 50, O: 50 } },
    ]
    const { population } = summarize(rows)
    expect(population.n).toBe(2)
    expect(population.mean.E).toBe(40)
    expect(population.sd.E).toBe(20)
  })
})

describe('buildReport', () => {
  const profiles = {
    wow: {
      Mage_Arcane: { role: 'dealer', E: 25, A: 30, C: 95, N: 55, O: 85, signature: ['C', 'O'] },
      Rogue_Subtlety: { role: 'dealer', E: 20, A: 25, C: 90, N: 45, O: 80, signature: ['C', 'O'] },
    },
    lostark: {},
    dnf: {},
  }

  it('실데이터가 프로필과 10 이상 다른 전문화를 알려 준다', () => {
    const summary = { wow: { Mage_Arcane: { n: 5, mean: { E: 45, A: 30, C: 95, N: 55, O: 85 } } } }
    const text = buildReport(profiles, summary, { minN: 5, near: 15 }).join('\n')
    expect(text).toContain('Mage_Arcane (n=5)')
    expect(text).toContain('E +20')
  })

  it('표본이 minN보다 적으면 차이를 보고하지 않는다', () => {
    const summary = { wow: { Mage_Arcane: { n: 2, mean: { E: 45, A: 30, C: 95, N: 55, O: 85 } } } }
    const text = buildReport(profiles, summary, { minN: 5, near: 15 }).join('\n')
    expect(text).not.toContain('Mage_Arcane (n=2)')
  })

  it('가까운 쌍에 실데이터에서 가장 크게 갈리는 특성을 붙인다', () => {
    const summary = {
      wow: {
        Mage_Arcane: { n: 5, mean: { E: 20, A: 30, C: 95, N: 70, O: 85 } },
        Rogue_Subtlety: { n: 5, mean: { E: 20, A: 30, C: 95, N: 30, O: 85 } },
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

  it('모집단 통계가 있으면 POPULATION_BASELINE 갱신용 줄을 맨 앞에 출력한다', () => {
    const summary = {
      population: {
        n: 2310,
        mean: { E: 38.8, A: 53.4, C: 55.6, N: 48.7, O: 54.6 },
        sd: { E: 20.9, A: 14.7, C: 17.8, N: 19.6, O: 16.1 },
      },
    }
    const lines = buildReport(profiles, summary, { minN: 5, near: 15 })
    expect(lines[0]).toBe(
      '모집단(응답자 2310명) 평균 E 39, A 53, C 56, N 49, O 55 / 표준편차 E 21, A 15, C 18, N 20, O 16',
    )
  })
})
