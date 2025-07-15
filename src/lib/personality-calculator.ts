import { PersonalityScores, Question, UserAnswers } from './types'

export const calculateScores = (userAnswers: UserAnswers, shuffledQuestions: Question[]): PersonalityScores => {
  // 1. 각 특성별로 점수를 합산할 객체 (-2 ~ +2 기반)
  const scores: PersonalityScores = { E: 0, A: 0, C: 0, N: 0, O: 0 }
  // 2. 정규화를 위해 각 특성별 '최대 가능 절대값'을 저장할 객체
  const maxAbsScores: PersonalityScores = { E: 0, A: 0, C: 0, N: 0, O: 0 }

  shuffledQuestions.forEach((q, index) => {
    const trait = q.trait as keyof PersonalityScores
    const weight = q.weight || 1.0
    const answer = userAnswers[index]

    if (answer === undefined) return

    // 3. 사용자의 답변(1~5)을 점수(-2~+2)로 변환합니다.
    // 1점 -> -2점, 2점 -> -1점, 3점 -> 0점, 4점 -> +1점, 5점 -> +2점
    let centeredScore = answer - 3

    // 4. 역문항의 경우, 점수의 부호만 바꿔줍니다.
    if (q.reverse) {
      centeredScore = -centeredScore
    }

    // 5. 가중치를 적용하여 점수를 누적합니다.
    scores[trait] += centeredScore * weight

    // 6. 정규화를 위해 해당 특성의 최대 점수(2점)에 가중치를 곱해 누적합니다.
    maxAbsScores[trait] += 2 * weight
  })

  const percentageScores: PersonalityScores = { E: 0, A: 0, C: 0, N: 0, O: 0 }
  for (const trait in scores) {
    const key = trait as keyof PersonalityScores
    const totalScore = scores[key] // 최종 합산 점수 (음수 또는 양수)
    const maxAbsScore = maxAbsScores[key] // 해당 특성의 최대 가능 점수(양수)

    if (maxAbsScore === 0) {
      percentageScores[key] = 50 // 문항이 없을 경우 중간값
      continue
    }

    // 7. 최종 점수(-maxAbsScore ~ +maxAbsScore 범위)를 0~100점 척도로 변환(정규화)합니다.
    // 공식: (현재값 - 최소값) / (최대값 - 최소값) * 100
    // 여기서 현재값 = totalScore, 최소값 = -maxAbsScore, 최대값 = +maxAbsScore
    const normalized = ((totalScore - -maxAbsScore) / (maxAbsScore - -maxAbsScore)) * 100
    // 위 공식을 단순화하면: (totalScore + maxAbsScore) / (2 * maxAbsScore) * 100

    percentageScores[key] = Math.round(normalized)
  }

  return percentageScores
}
