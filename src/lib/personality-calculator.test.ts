import { calculateScores } from './personality-calculator'
import { UserAnswers, Question } from './types'
import { questions as originalQuestions } from './data'

// calculateScores 함수는 섞인 질문 배열을 인자로 받으므로,
// 테스트 시에도 이 배열을 인자로 전달해야 합니다.
// 여기서는 originalQuestions를 사용하여 mockQuestions를 구성합니다.
const mockQuestions: Question[] = originalQuestions

describe('calculateScores', () => {
  it('should correctly calculate scores for average answers (all 3s)', () => {
    const userAnswers: UserAnswers = {}
    // 모든 질문에 '보통' (3점)으로 답변했을 때 모든 특성이 50%가 되어야 합니다.
    mockQuestions.forEach((_, index) => {
      userAnswers[index] = 3 // 인덱스를 사용하여 답변 저장
    })

    const scores = calculateScores(userAnswers, mockQuestions) // mockQuestions를 인자로 전달

    // 모든 특성 점수가 50%에 가까워야 합니다.
    expect(scores.E).toBeCloseTo(50)
    expect(scores.A).toBeCloseTo(50)
    expect(scores.C).toBeCloseTo(50)
    expect(scores.N).toBeCloseTo(50)
    expect(scores.O).toBeCloseTo(50)
  })

  it('should calculate correct scores for high Extraversion (E) and low Neuroticism (N)', () => {
    const userAnswers: UserAnswers = {}

    // E (외향성)를 높게, N (신경성)을 낮게 만드는 답변을 구성합니다.
    // E (reverse: false) 질문에 5점, E (reverse: true) 질문에 1점
    // N (reverse: false) 질문에 1점, N (reverse: true) 질문에 5점
    mockQuestions.forEach((q, index) => {
      if (q.trait === 'E') {
        userAnswers[index] = q.reverse ? 1 : 5
      } else if (q.trait === 'N') {
        userAnswers[index] = q.reverse ? 5 : 1
      } else {
        // 나머지 특성은 중간값으로
        userAnswers[index] = 3
      }
    })

    const scores = calculateScores(userAnswers, mockQuestions)

    // 실제 가중치와 질문 수에 따라 정확한 값은 달라지지만, 경향성을 확인합니다.
    expect(scores.E).toBeGreaterThan(70) // 외향성은 높아야 함
    expect(scores.N).toBeLessThan(30) // 신경성은 낮아야 함 (안정적)
    // 나머지 특성은 중간값에 가까울 것
    expect(scores.A).toBeCloseTo(50)
    expect(scores.C).toBeCloseTo(50)
    expect(scores.O).toBeCloseTo(50)
  })

  it('should return 50 for traits if no relevant questions are answered (or maxAbsScore is 0)', () => {
    const userAnswers: UserAnswers = {} // 빈 답변 객체
    // 특정 특성에 대한 질문이 아예 없거나 답변되지 않았을 때 50을 반환하는지 확인합니다.
    // calculateScores 로직에서 maxAbsScore가 0인 경우 50을 반환하도록 되어있습니다.
    // 여기서는 모든 질문을 답변하지 않은 경우를 테스트합니다.

    const scores = calculateScores(userAnswers, mockQuestions)

    // 모든 특성 점수가 50%에 가까워야 합니다.
    expect(scores.E).toBeCloseTo(50)
    expect(scores.A).toBeCloseTo(50)
    expect(scores.C).toBeCloseTo(50)
    expect(scores.N).toBeCloseTo(50)
    expect(scores.O).toBeCloseTo(50)
  })

  it('should correctly handle questions with different weights', () => {
    const questionsWithWeights: Question[] = [
      { text: 'Strong E question', trait: 'E', reverse: false, weight: 2.0 },
      { text: 'Weak E question', trait: 'E', reverse: false, weight: 0.5 },
      { text: 'Strong A question', trait: 'A', reverse: true, weight: 1.0 },
    ]
    const userAnswers: UserAnswers = {
      0: 5, // E 질문 (인덱스 0, 가중치 2.0): +2 * 2.0 = +4
      1: 3, // E 질문 (인덱스 1, 가중치 0.5): 0 * 0.5 = 0
      2: 1, // A 역질문 (인덱스 2, 가중치 1.0): 1점 -> -2점 -> 역전: +2점 * 1.0 = +2
    }

    const scores = calculateScores(userAnswers, questionsWithWeights)

    // E 계산:
    // scores.E = (+4) + (0) = 4
    // maxAbsScores.E = (2 * 2.0) + (2 * 0.5) = 4 + 1 = 5
    // normalized = (4 + 5) / (2 * 5) * 100 = 9 / 10 * 100 = 90
    expect(scores.E).toBeCloseTo(90)

    // A 계산:
    // scores.A = +2
    // maxAbsScores.A = 2 * 1.0 = 2
    // normalized = (2 + 2) / (2 * 2) * 100 = 4 / 4 * 100 = 100
    expect(scores.A).toBeCloseTo(100)

    // 답변되지 않은 특성은 50으로 유지되는지 확인
    expect(scores.C).toBeCloseTo(50)
    expect(scores.N).toBeCloseTo(50)
    expect(scores.O).toBeCloseTo(50)
  })
})
