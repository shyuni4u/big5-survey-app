import { validateSurveyResult } from './survey-result'

const validBody = {
  app: 'WoW',
  class: 'Mage',
  specialization: 'Fire',
  answers: { A: 50, C: 60, E: 70, N: 40, O: 55 },
}

const expectRejected = (body: unknown, errorPattern: RegExp) => {
  const result = validateSurveyResult(body)
  expect(result.ok).toBe(false)
  if (!result.ok) expect(result.error).toMatch(errorPattern)
}

describe('validateSurveyResult', () => {
  describe('valid input', () => {
    it('accepts a body whose app/class/spec exist in data.ts and whose answers are Big5 integers', () => {
      expect(validateSurveyResult(validBody)).toEqual({ ok: true, value: validBody })
    })

    it('accepts the app id regardless of letter case', () => {
      for (const app of ['wow', 'WOW', 'WoW']) {
        expect(validateSurveyResult({ ...validBody, app })).toEqual({ ok: true, value: { ...validBody, app } })
      }
    })

    it('accepts classes from each supported game', () => {
      const lostark = { ...validBody, app: 'LostArk', class: 'Mage (Female)', specialization: 'Arcanist' }
      const dnf = { ...validBody, app: 'DNF', class: 'Thief', specialization: 'Shadow Dancer' }
      expect(validateSurveyResult(lostark)).toEqual({ ok: true, value: lostark })
      expect(validateSurveyResult(dnf)).toEqual({ ok: true, value: dnf })
    })

    it('returns only the four known fields, dropping anything else in the body', () => {
      expect(validateSurveyResult({ ...validBody, extra: 'ignored' })).toEqual({ ok: true, value: validBody })
    })
  })

  describe('body shape', () => {
    it('rejects a body that is not a plain object', () => {
      expectRejected(null, /body/i)
      expectRejected('string', /body/i)
      expectRejected([validBody], /body/i)
    })

    it('rejects a body with a missing field', () => {
      const { class: _class, ...withoutClass } = validBody
      void _class
      expectRejected(withoutClass, /class/i)
    })
  })

  describe('app', () => {
    it('rejects an app that is not wow/lostark/dnf', () => {
      expectRejected({ ...validBody, app: 'Overwatch' }, /app/i)
    })

    it('rejects a non-string app', () => {
      expectRejected({ ...validBody, app: 1 }, /app/i)
    })
  })

  describe('class', () => {
    it('rejects a class that does not exist for the app', () => {
      expectRejected({ ...validBody, class: 'Warlord' }, /class/i)
    })

    it('rejects a class whose letter case differs from data.ts', () => {
      expectRejected({ ...validBody, class: 'warrior', specialization: 'Protection' }, /class/i)
    })

    it('rejects a class that belongs to a different game', () => {
      expectRejected({ ...validBody, app: 'DNF', class: 'Death Knight', specialization: 'Blood' }, /class/i)
    })
  })

  describe('specialization', () => {
    it('rejects a specialization that does not belong to the class', () => {
      expectRejected({ ...validBody, specialization: 'Protection' }, /specialization/i)
    })

    it('rejects a specialization whose letter case differs from data.ts', () => {
      expectRejected({ ...validBody, specialization: 'fire' }, /specialization/i)
    })
  })

  describe('answers', () => {
    it('rejects the raw 40-question answer array', () => {
      expectRejected({ ...validBody, answers: new Array(40).fill(3) }, /answers/i)
    })

    it('rejects answers missing a trait', () => {
      expectRejected({ ...validBody, answers: { A: 50, C: 60, E: 70, N: 40 } }, /answers/i)
    })

    it('rejects answers with an unknown extra key', () => {
      expectRejected({ ...validBody, answers: { ...validBody.answers, X: 10 } }, /answers/i)
    })

    it('rejects non-integer trait values', () => {
      expectRejected({ ...validBody, answers: { ...validBody.answers, A: 50.5 } }, /answers/i)
    })

    it('rejects trait values outside 0..100', () => {
      expectRejected({ ...validBody, answers: { ...validBody.answers, A: 101 } }, /answers/i)
      expectRejected({ ...validBody, answers: { ...validBody.answers, N: -1 } }, /answers/i)
    })

    it('rejects non-numeric trait values', () => {
      expectRejected({ ...validBody, answers: { ...validBody.answers, O: '55' } }, /answers/i)
      expectRejected({ ...validBody, answers: { ...validBody.answers, O: NaN } }, /answers/i)
    })

    it('accepts the boundary values 0 and 100', () => {
      const body = { ...validBody, answers: { A: 0, C: 100, E: 0, N: 100, O: 50 } }
      expect(validateSurveyResult(body)).toEqual({ ok: true, value: body })
    })
  })
})
