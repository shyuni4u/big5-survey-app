export interface Question {
  text: string
  trait: 'E' | 'A' | 'C' | 'N' | 'O'
  reverse: boolean
}

export interface UserAnswers {
  [questionIndex: number]: number
}

export interface TraitInfo {
  name: string
  icon: string
  color: string
  description: string
}

export interface ResultInterpretation {
  high: string
  low: string
}

export interface AboutContent {
  title: string
  content: string
}

export interface PersonalityScores {
  E: number
  A: number
  C: number
  N: number
  O: number
}

export interface TestData {
  userType: 'existing' | 'new'
  userAnswers: UserAnswers
  personalityScores: PersonalityScores
  currentClass?: string
  currentSpec?: string
  preferredRoles?: string[]
}

export interface GameClass {
  name: string
  image: string
  color: string
  specs: GameSpec[]
}

export interface GameSpec {
  name: string
  role: 'tanker' | 'dealer' | 'healer'
  image: string
  description: string
}
