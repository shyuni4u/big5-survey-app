import fs from 'fs'
import path from 'path'
import { getGameClasses } from '@/lib/data'

const mockRun = jest.fn()
const mockCreate = jest.fn()

jest.mock('onnxruntime-web', () => ({
  InferenceSession: { create: (...args: unknown[]) => mockCreate(...args) },
  Tensor: class MockTensor {
    constructor(
      public type: string,
      public data: Float32Array,
      public dims: number[],
    ) {}
  },
}))

const GAMES = ['wow', 'dnf', 'lostark'] as const

const readLabelsJson = (game: string): string[] =>
  JSON.parse(fs.readFileSync(path.join(process.cwd(), 'public', 'models', game, 'labels.json'), 'utf-8'))

// 파이썬 기본 문자열 정렬(코드포인트 순)과 동일한 규칙
const pythonSort = (labels: string[]) => [...labels].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))

// 예전 onnx.ts가 사용했던 매핑: data.ts 나열 순서(class 순서 × specs 순서)
const flatMapLabels = (game: string) =>
  getGameClasses(game).flatMap((gameClass) => gameClass.specs.map((spec) => `${gameClass.name}_${spec.name}`))

// 모듈 수준 캐시(세션/라벨)를 테스트마다 초기화하기 위해 매번 새로 로드한다.
const loadOnnx = async () => {
  jest.resetModules()
  return import('@/lib/onnx')
}

const mockFetchLabels = (labels: string[]) => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => labels,
  }) as unknown as typeof fetch
}

const mockSessionLogits = (logits: number[]) => {
  mockRun.mockResolvedValue({ output: { data: new Float32Array(logits) } })
  mockCreate.mockResolvedValue({ run: mockRun })
}

const oneHot = (length: number, index: number) => {
  const logits = new Array<number>(length).fill(0)
  logits[index] = 10
  return logits
}

const answers = { A: 50, C: 50, E: 50, N: 50, O: 50 }

beforeEach(() => {
  mockRun.mockReset()
  mockCreate.mockReset()
  jest.spyOn(console, 'log').mockImplementation(() => {})
  jest.spyOn(console, 'warn').mockImplementation(() => {})
  jest.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  jest.restoreAllMocks()
})

describe('labels.json (모델과 함께 내보낸 출력 인덱스 → 라벨 매핑)', () => {
  describe.each(GAMES)('%s', (game) => {
    it('LabelEncoder 규칙(코드포인트 순)으로 정렬되어 있고 중복이 없다', () => {
      const labels = readLabelsJson(game)
      expect(labels.length).toBeGreaterThan(0)
      expect(labels).toEqual(pythonSort(labels))
      expect(new Set(labels).size).toBe(labels.length)
    })

    it('data.ts에서 만든 라벨 집합이 정렬 후 labels.json과 완전히 일치한다', async () => {
      const { buildSortedLabelsFromGameData } = await loadOnnx()
      expect(buildSortedLabelsFromGameData(game)).toEqual(readLabelsJson(game))
    })

    it('data.ts의 라벨 집합과 labels.json의 라벨 집합이 같다', () => {
      expect(new Set(flatMapLabels(game))).toEqual(new Set(readLabelsJson(game)))
    })
  })
})

describe('buildSortedLabelsFromGameData', () => {
  it('로스트아크: data.ts 나열 순서와 무관하게 Mage (Female)/Specialist (Female) 전문화가 정렬 순서로 나온다', async () => {
    const { buildSortedLabelsFromGameData } = await loadOnnx()
    const sorted = buildSortedLabelsFromGameData('lostark')

    expect(sorted.filter((label) => label.startsWith('Mage (Female)_'))).toEqual([
      'Mage (Female)_Arcanist',
      'Mage (Female)_Bard',
      'Mage (Female)_Sorceress',
      'Mage (Female)_Summoner',
    ])

    expect(sorted.filter((label) => label.startsWith('Specialist (Female)_'))).toEqual([
      'Specialist (Female)_Aeromancer',
      'Specialist (Female)_Artist',
      'Specialist (Female)_Wildsoul',
    ])
  })

  it('게임 키 대소문자를 구분하지 않는다', async () => {
    const { buildSortedLabelsFromGameData } = await loadOnnx()
    expect(buildSortedLabelsFromGameData('LostArk')).toEqual(buildSortedLabelsFromGameData('lostark'))
  })

  it('알 수 없는 게임은 빈 배열을 반환한다', async () => {
    const { buildSortedLabelsFromGameData } = await loadOnnx()
    expect(buildSortedLabelsFromGameData('unknown')).toEqual([])
  })
})

describe('compareCodePoint', () => {
  it('파이썬 기본 문자열 정렬과 같은 순서를 낸다 (공백 < 괄호 < 대문자 < 소문자)', async () => {
    const { compareCodePoint } = await loadOnnx()
    expect(['b', 'B', ' ', '(', 'a', 'A'].sort(compareCodePoint)).toEqual([' ', '(', 'A', 'B', 'a', 'b'])
    expect(compareCodePoint('Mage (Female)', 'Mage (Male)')).toBeLessThan(0)
    expect(compareCodePoint('x', 'x')).toBe(0)
  })
})

describe('predict', () => {
  it('출력 인덱스를 labels.json 순서로 라벨에 대응시킨다 (로스트아크 Mage (Female)_Bard)', async () => {
    const labels = readLabelsJson('lostark')
    const bardIndex = labels.indexOf('Mage (Female)_Bard')
    expect(bardIndex).toBeGreaterThanOrEqual(0)

    mockFetchLabels(labels)
    mockSessionLogits(oneHot(labels.length, bardIndex))

    const { predict } = await loadOnnx()
    const result = await predict('LostArk', answers)

    expect(global.fetch).toHaveBeenCalledWith('/models/lostark/labels.json')
    expect(result.top_5_recommendations).toHaveLength(5)
    expect(result.top_5_recommendations[0].label).toBe('Mage (Female)_Bard')
    // 예전 방식(data.ts flatMap 순서)이었다면 같은 인덱스가 다른 전문화로 표시되었다.
    expect(flatMapLabels('lostark')[bardIndex]).not.toBe('Mage (Female)_Bard')
  })

  it('Specialist (Female)_Aeromancer 인덱스도 labels.json에 맞게 표시된다', async () => {
    const labels = readLabelsJson('lostark')
    const index = labels.indexOf('Specialist (Female)_Aeromancer')

    mockFetchLabels(labels)
    mockSessionLogits(oneHot(labels.length, index))

    const { predict } = await loadOnnx()
    const result = await predict('lostark', answers)
    expect(result.top_5_recommendations[0].label).toBe('Specialist (Female)_Aeromancer')
  })

  it('labels.json을 가져올 수 없으면 data.ts 기반 정렬 라벨로 대체한다', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('network')) as unknown as typeof fetch
    const labels = readLabelsJson('lostark')
    const index = labels.indexOf('Mage (Female)_Sorceress')
    mockSessionLogits(oneHot(labels.length, index))

    const { predict } = await loadOnnx()
    const result = await predict('lostark', answers)
    expect(result.top_5_recommendations[0].label).toBe('Mage (Female)_Sorceress')
  })

  it('labels.json은 게임별로 한 번만 가져온다', async () => {
    const labels = readLabelsJson('wow')
    mockFetchLabels(labels)
    mockSessionLogits(oneHot(labels.length, 0))

    const { predict } = await loadOnnx()
    await predict('wow', answers)
    await predict('WoW', answers)
    expect(global.fetch).toHaveBeenCalledTimes(1)
    expect(mockCreate).toHaveBeenCalledTimes(1)
  })

  it('모델 출력 크기와 라벨 개수가 다르면 에러를 던진다', async () => {
    mockFetchLabels(readLabelsJson('lostark'))
    mockSessionLogits([1, 2, 3])

    const { predict } = await loadOnnx()
    await expect(predict('lostark', answers)).rejects.toThrow('모델과 라벨 정보가 일치하지 않습니다')
  })

  it('점수를 내림차순으로 정렬하고 가장 큰 로짓의 라벨을 1위로 둔다', async () => {
    const labels = readLabelsJson('wow')
    mockFetchLabels(labels)
    mockSessionLogits(labels.map((_, i) => i * 0.1))

    const { predict } = await loadOnnx()
    const result = await predict('wow', answers)
    const scores = result.top_5_recommendations.map((r) => r.score)
    expect(scores).toEqual([...scores].sort((a, b) => b - a))
    expect(result.top_5_recommendations[0].label).toBe(labels[labels.length - 1])
  })
})
