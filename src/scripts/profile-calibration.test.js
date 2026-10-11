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
      '\uFEFFapp,class,specialization,answers\n\nDNF,Thief,Rogue,"{""E"":1,""A"":2,""C"":3,""N"":4,""O"":5}"\n\n',
    )
    expect(rows).toHaveLength(1)
    expect(rows[0].app).toBe('DNF')
  })
})

describe('parseProfiles', () => {
  it('data.ts에서 세 게임의 프로필을 모두 읽는다', () => {
    const profiles = parseProfiles(dataTs)
    expect(Object.keys(profiles.wow)).toHaveLength(40)
    expect(Object.keys(profiles.lostark)).toHaveLength(30)
    expect(Object.keys(profiles.dnf)).toHaveLength(71)
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

  it('원점수 평균(mean)과 함께 모집단 기준으로 정규화한 평균(normMean)을 낸다', () => {
    // E가 60과 18인 두 응답자: 모집단 평균 39, 표준편차 21. 나머지 특성은 표준편차 0.
    const rows = [
      { app: 'WoW', class: 'Mage', specialization: 'Arcane', answers: { E: 60, A: 50, C: 50, N: 50, O: 50 } },
      { app: 'WoW', class: 'Rogue', specialization: 'Subtlety', answers: { E: 18, A: 50, C: 50, N: 50, O: 50 } },
    ]
    const { wow, population } = summarize(rows)
    expect(population.mean.E).toBe(39)
    expect(population.sd.E).toBe(21)
    expect(wow['Mage_Arcane'].mean.E).toBe(60)
    expect(wow['Mage_Arcane'].normMean.E).toBe(75)
    expect(wow['Rogue_Subtlety'].normMean.E).toBe(25)
    // 표준편차가 0인 특성은 50으로 둔다 (0으로 나누지 않는다)
    expect(wow['Mage_Arcane'].normMean.A).toBe(50)
    expect(Object.values(wow['Mage_Arcane'].normMean).every(Number.isFinite)).toBe(true)
  })

  it('정규화한 평균은 0~100으로 자른다', () => {
    // E가 0인 응답자 1명, 100인 응답자 1명, 50인 응답자 8명: 모집단 평균 50, 표준편차 약 22.4 → E 100은 약 106, E 0은 약 -6
    const rows = Array.from({ length: 10 }, (_, i) => ({
      app: 'WoW',
      class: 'Mage',
      specialization: i === 8 ? 'Low' : i === 9 ? 'High' : 'Mid',
      answers: { E: i === 8 ? 0 : i === 9 ? 100 : 50, A: 50 + i, C: 50, N: 50, O: 50 },
    }))
    const { wow } = summarize(rows)
    expect(wow['Mage_High'].normMean.E).toBe(100)
    expect(wow['Mage_Low'].normMean.E).toBe(0)
    expect(wow['Mage_Mid'].normMean.E).toBe(50)
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
  // 정규화가 항등(평균 50, 표준편차 25)인 모집단이라 normMean이 mean과 같다.
  const identityPopulation = {
    n: 100,
    mean: { E: 50, A: 50, C: 50, N: 50, O: 50 },
    sd: { E: 25, A: 25, C: 25, N: 25, O: 25 },
  }
  const bucket = (n, mean) => ({ n, mean, normMean: mean })

  it('실데이터가 프로필과 10 이상 다른 전문화를 알려 준다', () => {
    const summary = {
      population: identityPopulation,
      wow: { Mage_Arcane: bucket(5, { E: 45, A: 30, C: 95, N: 55, O: 85 }) },
    }
    const text = buildReport(profiles, summary, { minN: 5, near: 15 }).join('\n')
    expect(text).toContain('Mage_Arcane (n=5) 실데이터(정규화 척도)가 프로필과 10 이상 다름: E +20')
  })

  it('표본이 minN보다 적으면 차이를 보고하지 않는다', () => {
    const summary = {
      population: identityPopulation,
      wow: { Mage_Arcane: bucket(2, { E: 45, A: 30, C: 95, N: 55, O: 85 }) },
    }
    const text = buildReport(profiles, summary, { minN: 5, near: 15 }).join('\n')
    expect(text).not.toContain('Mage_Arcane (n=2)')
  })

  it('가까운 쌍에 실데이터에서 가장 크게 갈리는 특성을 붙인다', () => {
    const summary = {
      population: identityPopulation,
      wow: {
        Mage_Arcane: bucket(5, { E: 20, A: 30, C: 95, N: 70, O: 85 }),
        Rogue_Subtlety: bucket(5, { E: 20, A: 30, C: 95, N: 30, O: 85 }),
      },
    }
    const text = buildReport(profiles, summary, { minN: 5, near: 15 }).join('\n')
    expect(text).toContain('가까운 쌍 d=14.1: Mage_Arcane ~ Rogue_Subtlety')
    expect(text).toContain('실데이터(정규화 척도)에서 가장 크게 갈리는 특성: N (Mage_Arcane 70 vs Rogue_Subtlety 30)')
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

  describe('원점수를 모집단 기준으로 정규화해서 비교한다', () => {
    // E가 60과 18인 두 응답자: 모집단 평균 39, 표준편차 21이므로 원점수 E 60은 정규화하면 75, 18은 25.
    const summary = summarize([
      { app: 'WoW', class: 'Mage', specialization: 'Arcane', answers: { E: 60, A: 50, C: 50, N: 50, O: 50 } },
      { app: 'WoW', class: 'Rogue', specialization: 'Subtlety', answers: { E: 18, A: 50, C: 50, N: 50, O: 50 } },
    ])
    const profile = (E) => ({ role: 'dealer', E, A: 50, C: 50, N: 50, O: 50, signature: ['C'] })

    it('정규화한 값이 프로필과 같으면 차이 줄이 없다 (원점수 60은 프로필 75와 15 차이지만 보고하지 않는다)', () => {
      const far = { wow: { Mage_Arcane: profile(75), Rogue_Subtlety: profile(25) }, lostark: {}, dnf: {} }
      const text = buildReport(far, summary, { minN: 1, near: 15 }).join('\n')
      expect(text).not.toContain('10 이상 다름')
    })

    it('정규화한 값이 프로필과 20 다르면 그 차이를 보고한다 (원점수 60은 프로필 55와 5 차이)', () => {
      const off = { wow: { Mage_Arcane: profile(55), Rogue_Subtlety: profile(25) }, lostark: {}, dnf: {} }
      const text = buildReport(off, summary, { minN: 1, near: 15 }).join('\n')
      expect(text).toContain('Mage_Arcane (n=1) 실데이터(정규화 척도)가 프로필과 10 이상 다름: E +20')
      expect(text).not.toContain('Rogue_Subtlety (n=1)')
    })

    it('가까운 쌍의 힌트도 정규화한 값으로 낸다', () => {
      const close = { wow: { Mage_Arcane: profile(50), Rogue_Subtlety: profile(50) }, lostark: {}, dnf: {} }
      const text = buildReport(close, summary, { minN: 1, near: 15 }).join('\n')
      expect(text).toContain('실데이터(정규화 척도)에서 가장 크게 갈리는 특성: E (Mage_Arcane 75 vs Rogue_Subtlety 25)')
    })
  })

  describe('모집단 통계가 없는 요약', () => {
    it('원점수 평균으로 비교하고 그 사실을 차이 줄에 표시한다', () => {
      const summary = { wow: { Mage_Arcane: { n: 5, mean: { E: 45, A: 30, C: 95, N: 55, O: 85 } } } }
      const text = buildReport(profiles, summary, { minN: 5, near: 15 }).join('\n')
      expect(text).toContain('Mage_Arcane (n=5) 실데이터가 프로필과 10 이상 다름: E +20 [원점수, 모집단 통계 없음]')
      expect(text).not.toContain('정규화 척도')
    })

    it('가까운 쌍의 힌트에도 원점수임을 표시한다', () => {
      const summary = {
        wow: {
          Mage_Arcane: { n: 5, mean: { E: 20, A: 30, C: 95, N: 70, O: 85 } },
          Rogue_Subtlety: { n: 5, mean: { E: 20, A: 30, C: 95, N: 30, O: 85 } },
        },
      }
      const text = buildReport(profiles, summary, { minN: 5, near: 15 }).join('\n')
      expect(text).toContain(
        '실데이터에서 가장 크게 갈리는 특성: N (Mage_Arcane 70 vs Rogue_Subtlety 30) [원점수, 모집단 통계 없음]',
      )
    })
  })
})
