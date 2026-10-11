import * as ort from 'onnxruntime-web'
import { getGameClasses } from '@/lib/data'

const sessions: Map<string, ort.InferenceSession> = new Map()
const labelCache: Map<string, Promise<string[]>> = new Map()

/**
 * 두 문자열을 코드포인트 순서로 비교합니다.
 * 파이썬 기본 문자열 정렬(sklearn LabelEncoder가 사용하는 순서)과 동일한 규칙입니다.
 * `localeCompare`는 로케일에 따라 결과가 달라지므로 사용하지 않습니다.
 */
export function compareCodePoint(a: string, b: string): number {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

/**
 * data.ts의 게임 클래스 정보로부터 `${class}_${spec}` 라벨 배열을 만들어
 * LabelEncoder와 동일한 규칙(코드포인트 순)으로 정렬해 반환합니다.
 *
 * 이 함수는 data.ts의 나열 순서에 의존하지 않습니다. 학습 시 사용한 라벨 집합과
 * data.ts의 라벨 집합이 같다면, 반환값은 체크포인트의 label_classes와 동일합니다.
 */
export function buildSortedLabelsFromGameData(game: string): string[] {
  return getGameClasses(game)
    .flatMap((gameClass) => gameClass.specs.map((spec) => `${gameClass.name}_${spec.name}`))
    .sort(compareCodePoint)
}

/**
 * 모델과 함께 내보낸 `public/models/<game>/labels.json`(출력 인덱스 → 라벨)을 가져옵니다.
 * 파일을 가져올 수 없으면 data.ts에서 만든 정렬 라벨로 대체합니다.
 */
async function getLabels(gameKey: string): Promise<string[]> {
  if (!labelCache.has(gameKey)) {
    const promise = (async () => {
      try {
        const response = await fetch(`/models/${gameKey}/labels.json`)
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const labels: unknown = await response.json()
        if (!Array.isArray(labels) || !labels.every((label) => typeof label === 'string')) {
          throw new Error('labels.json 형식이 올바르지 않습니다.')
        }
        return labels as string[]
      } catch (error) {
        console.warn(`[ONNX] ${gameKey} labels.json 로드 실패, data.ts 기반 정렬 라벨로 대체합니다:`, error)
        return buildSortedLabelsFromGameData(gameKey)
      }
    })()
    labelCache.set(gameKey, promise)
  }

  return labelCache.get(gameKey)!
}

/**
 * 게임 이름을 기준으로 세션을 가져오거나 새로 초기화합니다.
 * @param game - 게임 키 (소문자, 예: 'overwatch')
 */
async function getSession(game: string): Promise<ort.InferenceSession> {
  const gameKey = game.toLowerCase()

  if (!sessions.has(gameKey)) {
    try {
      const session = await ort.InferenceSession.create(`/models/${gameKey}/model.onnx`, {
        executionProviders: ['webgl', 'wasm'],
      })
      sessions.set(gameKey, session)
      console.log(`[ONNX] ${gameKey} 모델 세션 초기화 완료`)
    } catch (error) {
      console.error(`[ONNX] ${gameKey} 모델 초기화 실패:`, error)
      throw new Error('모델을 불러오는 데 실패했습니다. 페이지를 새로고침 해주세요.')
    }
  }

  return sessions.get(gameKey)!
}

/**
 * 성격 유형 검사 결과를 바탕으로 직업을 추천합니다.
 * @param game - 게임 키
 * @param answers - { A: number; C: number; E: number; N: number; O: number } 형태의 객체
 * @returns Top 5 추천 직업과 점수를 담은 객체
 */
export async function predict(
  game: string,
  answers: Record<'A' | 'C' | 'E' | 'N' | 'O', number>,
): Promise<{
  top_5_recommendations: { label: string; score: number }[]
}> {
  const gameKey = game.toLowerCase()
  const [session, labels] = await Promise.all([getSession(gameKey), getLabels(gameKey)])

  const inputData = new Float32Array([
    answers['A'] / 50.0 - 1.0,
    answers['C'] / 50.0 - 1.0,
    answers['E'] / 50.0 - 1.0,
    answers['N'] / 50.0 - 1.0,
    answers['O'] / 50.0 - 1.0,
  ])
  const inputTensor = new ort.Tensor('float32', inputData, [1, 5])
  const feeds = { input: inputTensor }
  const outputMap = await session.run(feeds)

  const logits = outputMap.output.data as Float32Array

  if (logits.length !== labels.length) {
    console.error(`[ONNX] ${gameKey} 모델 출력 크기(${logits.length})와 라벨 개수(${labels.length})가 일치하지 않습니다.`)
    throw new Error('모델과 라벨 정보가 일치하지 않습니다. 모델 파일을 다시 내보내 주세요.')
  }

  function softmax(arr: Float32Array): number[] {
    const maxLogit = Math.max(...arr)
    const exps = Array.from(arr).map((v) => Math.exp(v - maxLogit))
    const sumExps = exps.reduce((a, b) => a + b, 0)
    return exps.map((v) => v / sumExps)
  }

  const probabilities = softmax(logits)

  const recommendations = probabilities
    .map((score, index) => ({
      label: labels[index],
      score,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)

  return { top_5_recommendations: recommendations }
}
