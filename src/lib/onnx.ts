import * as ort from 'onnxruntime-web'
import { getGameClasses } from '@/lib/data'

let session: ort.InferenceSession | null = null

/**
 * ONNX 모델 세션을 초기화합니다.
 * Next.js 페이지 또는 컴포넌트가 로드될 때 한 번만 호출하는 것이 좋습니다.
 * @param modelPath - public 폴더에 위치한 onnx 모델 파일의 경로 (기본값: '/models/model.onnx')
 */
export async function initSession(modelPath: string = '/models/model.onnx') {
  if (!session) {
    try {
      // 성능 향상을 위해 WebGL 또는 WASM 백엔드를 우선 사용하도록 설정
      session = await ort.InferenceSession.create(modelPath, {
        executionProviders: ['webgl', 'wasm'],
      })
      console.log('ONNX session initialized successfully.')
    } catch (error) {
      console.error('Failed to initialize ONNX session:', error)
      // 프로덕션 환경에서는 사용자에게 친화적인 에러 메시지를 보여주는 로직 추가 가능
      throw new Error('모델을 불러오는 데 실패했습니다. 페이지를 새로고침 해주세요.')
    }
  }
}

/**
 * 성격 유형 검사 결과를 바탕으로 직업을 추천합니다.
 * @param answers - { A: number; C: number; E: number; N: number; O: number } 형태의 객체
 * @returns Top 5 추천 직업과 점수를 담은 객체
 */
export async function predict(
  game: string,
  answers: Record<'A' | 'C' | 'E' | 'N' | 'O', number>,
): Promise<{
  top_5_recommendations: { label: string; score: number }[]
}> {
  // 세션이 초기화되었는지 확인하고, 안 되어있으면 초기화 시도
  if (!session) {
    await initSession(`/models/${game.toLowerCase()}/model.onnx`)
    if (!session) {
      // initSession 내부에서 에러를 throw하므로, 이 코드는 사실상 도달하기 어려움
      throw new Error('ONNX session is not initialized. Call initSession() first.')
    }
  }

  // 1. 입력값 정규화 (PyTorch 모델과 동일하게 0~100 범위를 -1~1 범위로 변경)
  const inputData = new Float32Array([
    answers['A'] / 50.0 - 1.0,
    answers['C'] / 50.0 - 1.0,
    answers['E'] / 50.0 - 1.0,
    answers['N'] / 50.0 - 1.0,
    answers['O'] / 50.0 - 1.0,
  ])

  // 2. 입력 텐서 생성 (배치 크기 1, 특성 5)
  const inputTensor = new ort.Tensor('float32', inputData, [1, 5])

  // 3. 모델 실행 (입력 객체의 키는 ONNX 변환 시 지정한 'input'과 일치해야 함)
  const feeds = { input: inputTensor }
  const outputMap = await session.run(feeds)

  // 4. 출력 텐서 추출 (출력 이름은 ONNX 변환 시 지정한 'output' 사용)
  const outputTensor = outputMap.output
  const logits = outputTensor.data as Float32Array

  // 5. Softmax 함수를 적용하여 로짓(logits)을 확률로 변환
  function softmax(arr: Float32Array): number[] {
    // 안정적인 계산을 위해 최대값을 먼저 뺌 (overflow 방지)
    const maxLogit = arr.reduce((max, val) => (val > max ? val : max), -Infinity)
    const exps = Array.from(arr).map((v) => Math.exp(v - maxLogit))
    const sumExps = exps.reduce((a, b) => a + b, 0)
    return exps.map((v) => v / sumExps)
  }

  const probabilities = softmax(logits)

  const classes = getGameClasses(game).flatMap((gameClass) =>
    gameClass.specs.map((spec) => `${gameClass.name}_${spec.name}`),
  )

  // 6. 확률이 높은 상위 5개 직업을 추출하고 점수와 함께 객체로 만듦
  const recommendations = Array.from(probabilities)
    .map((score, index) => ({
      label: classes[index],
      score: score,
    }))
    .sort((a, b) => b.score - a.score) // 점수가 높은 순으로 정렬
    .slice(0, 5)

  return { top_5_recommendations: recommendations }
}
