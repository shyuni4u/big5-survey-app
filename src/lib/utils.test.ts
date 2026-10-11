import { zipData, unzipData, SEPERATE_TOKEN, hashString } from './utils'
import { TestData, PersonalityScores } from './types'

describe('Utility Functions', () => {
  it('should correctly zip and unzip data', () => {
    const testPersonalityScores: PersonalityScores = {
      A: 70,
      C: 80,
      E: 60,
      N: 30,
      O: 90,
    }

    const testData: TestData = {
      userType: 'new',
      personalityScores: testPersonalityScores,
      currentClass: ['Warrior_Arms', 'Mage_Frost'],
    }

    const zipped = zipData(testData)
    expect(typeof zipped).toBe('string')
    expect(zipped.length).toBeGreaterThan(0)

    const unzipped = unzipData(zipped)
    expect(unzipped).toEqual(testData)
  })

  it('should handle different user types and empty currentClass', () => {
    const testPersonalityScores: PersonalityScores = {
      A: 50,
      C: 50,
      E: 50,
      N: 50,
      O: 50,
    }

    const testData: TestData = {
      userType: 'existing',
      personalityScores: testPersonalityScores,
      currentClass: [], // Empty currentClass
    }

    const zipped = zipData(testData)
    const unzipped = unzipData(zipped)
    expect(unzipped).toEqual(testData)
  })

  it('should correctly handle the SEPERATE_TOKEN', () => {
    expect(SEPERATE_TOKEN).toBe(' ') // SEPERATE_TOKEN이 제대로 정의되었는지 확인
  })
})

describe('hashString', () => {
  it('returns a short hex string that is stable for the same input', () => {
    const a = hashString('eJyrViotTi0KqSxIVbJSykstV9JRKkgtKs7PS8zJLKkMTs4vSi1Wsqp')
    expect(a).toMatch(/^[0-9a-f]{8}$/)
    expect(hashString('eJyrViotTi0KqSxIVbJSykstV9JRKkgtKs7PS8zJLKkMTs4vSi1Wsqp')).toBe(a)
  })

  it('returns different values for inputs that differ in one character', () => {
    expect(hashString('abc')).not.toBe(hashString('abd'))
  })
})
