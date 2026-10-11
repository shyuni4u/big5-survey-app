export type Trait = 'E' | 'A' | 'C' | 'N' | 'O'

export type Question = {
  text: string
  trait: Trait
  reverse: boolean
  weight: number
}

export type UserAnswers = {
  [questionIndex: number]: number
}

export type TraitInfo = {
  name: string
  icon: string
  color: string
  description: string
}

export type ResultInterpretation = {
  high: string
  low: string
}

export type AboutContent = {
  title: string
  content: string
}

export type PersonalityScores = {
  E: number
  A: number
  C: number
  N: number
  O: number
}

export type TestData = {
  userType: 'existing' | 'new'
  personalityScores: PersonalityScores
  currentClass?: string[]
}

export type Game = {
  id: string
  name: string
  image: string
}

export type GameClass = {
  name: string
  nameKr: string
  image: string
  color: string
  specs: GameSpec[]
}

export type GameSpec = {
  name: string
  nameKr: string
  role: 'tanker' | 'dealer' | 'healer' | 'supporter' | 'buffer'
  position?: string
  image?: string
  description: string
  /** 이 전문화에 가장 잘 맞는 성향의 목표값 (0~100). 설계 문서 4.3 */
  big5: PersonalityScores
  /** 이 전문화를 정의하는 특성 1~2개. 적합도 계산에서 가중치 2배 */
  signature: Trait[]
}

export type Recommendation = {
  label: string
  score: number
  reason: string
}
