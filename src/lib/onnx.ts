import * as ort from 'onnxruntime-web'
import { getGameClasses } from '@/lib/data'

const sessions: Map<string, ort.InferenceSession> = new Map()

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
  const session = await getSession(game)

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

  function softmax(arr: Float32Array): number[] {
    const maxLogit = Math.max(...arr)
    const exps = Array.from(arr).map((v) => Math.exp(v - maxLogit))
    const sumExps = exps.reduce((a, b) => a + b, 0)
    return exps.map((v) => v / sumExps)
  }

  const probabilities = softmax(logits)

  const classes = getGameClasses(game).flatMap((gameClass) =>
    gameClass.specs.map((spec) => `${gameClass.name}_${spec.name}`),
  )

  const recommendations = Array.from(probabilities)
    .map((score, index) => ({
      label: classes[index],
      score,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)

  return { top_5_recommendations: recommendations }
}
