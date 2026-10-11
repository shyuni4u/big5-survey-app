import { getGameClasses } from '@/lib/data'
import type { PersonalityScores } from '@/lib/types'

/** /api/survey-result 가 받아들이는 app 값 (대소문자 무시). */
export const SUPPORTED_APPS = ['wow', 'lostark', 'dnf'] as const

const TRAITS = ['A', 'C', 'E', 'N', 'O'] as const

export type SurveyResultInput = {
  app: string
  class: string
  specialization: string
  answers: PersonalityScores
}

export type SurveyResultValidation = { ok: true; value: SurveyResultInput } | { ok: false; error: string }

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const fail = (error: string): SurveyResultValidation => ({ ok: false, error })

/**
 * answers 가 { A, C, E, N, O } 다섯 키만 가진 0~100 정수 객체인지 검사한다.
 * 설문 원시 답변 배열(40개)이나 소수/문자열 값은 거부한다.
 */
function parseAnswers(raw: unknown): PersonalityScores | null {
  if (!isPlainObject(raw)) return null
  if (Object.keys(raw).length !== TRAITS.length) return null
  const out = {} as PersonalityScores
  for (const trait of TRAITS) {
    const value = raw[trait]
    if (typeof value !== 'number' || !Number.isInteger(value) || value < 0 || value > 100) return null
    out[trait] = value
  }
  return out
}

/**
 * /api/survey-result 요청 본문을 검증한다 (순수 함수).
 * - app: wow / lostark / dnf 중 하나 (대소문자 무시)
 * - class / specialization: data.ts 의 getGameClasses(app) 에 정확히 같은 이름으로 존재해야 함
 * - answers: A, C, E, N, O 키를 가진 0~100 정수 객체
 */
export function validateSurveyResult(body: unknown): SurveyResultValidation {
  if (!isPlainObject(body)) return fail('Request body must be a JSON object')

  const { app, class: className, specialization, answers } = body

  if (typeof app !== 'string' || !(SUPPORTED_APPS as readonly string[]).includes(app.toLowerCase())) {
    return fail(`app must be one of: ${SUPPORTED_APPS.join(', ')}`)
  }

  if (typeof className !== 'string') return fail('class must be a string')
  const gameClass = getGameClasses(app).find((candidate) => candidate.name === className)
  if (!gameClass) return fail(`class "${className}" does not exist for app "${app}"`)

  if (typeof specialization !== 'string') return fail('specialization must be a string')
  if (!gameClass.specs.some((spec) => spec.name === specialization)) {
    return fail(`specialization "${specialization}" does not exist for class "${className}"`)
  }

  const parsedAnswers = parseAnswers(answers)
  if (!parsedAnswers) return fail('answers must be an object with integer A, C, E, N, O values between 0 and 100')

  return { ok: true, value: { app, class: className, specialization, answers: parsedAnswers } }
}
