export type Question = {
  text: string
  trait: 'E' | 'A' | 'C' | 'N' | 'O'
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
  role: 'tanker' | 'dealer' | 'healer' | 'supporter'
  image: string
  description: string
}
