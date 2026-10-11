/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

// route.ts 는 모듈 로드 시 환경변수를 요구한다. Supabase 클라이언트는 mock 이므로 값은 아무거나 괜찮다.
process.env.SUPABASE_URL = 'http://localhost:54321'
process.env.SUPABASE_ANON_KEY = 'test-anon-key'

const mockInsert = jest.fn()
const mockIsAllowed = jest.fn()

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({ insert: mockInsert })),
  })),
}))

// rate-limiter 는 모듈 로드 시 setInterval 을 걸고 IP 별 상태를 누적하므로 테스트에서는 mock 한다.
jest.mock('@/lib/rate-limiter', () => ({
  surveyRateLimiter: { isAllowed: (...args: unknown[]) => mockIsAllowed(...args) },
}))

const validBody = {
  app: 'WoW',
  class: 'Mage',
  specialization: 'Fire',
  answers: { A: 50, C: 60, E: 70, N: 40, O: 55 },
}

const post = async (body: unknown) => {
  const { POST } = await import('./route')
  const req = new NextRequest('http://localhost/api/survey-result', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
  return POST(req)
}

beforeEach(() => {
  mockInsert.mockReset().mockResolvedValue({ data: null, error: null })
  mockIsAllowed.mockReset().mockReturnValue({ allowed: true, remaining: 9, resetTime: Date.now() + 60_000 })
  jest.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  jest.restoreAllMocks()
})

describe('POST /api/survey-result', () => {
  it('inserts the validated row and returns 200 for a valid body', async () => {
    const res = await post(validBody)
    expect(res.status).toBe(200)
    expect(mockInsert).toHaveBeenCalledTimes(1)
    expect(mockInsert).toHaveBeenCalledWith(validBody)
  })

  it('returns 400 and does not insert when app is unknown', async () => {
    const res = await post({ ...validBody, app: 'Overwatch' })
    expect(res.status).toBe(400)
    expect(mockInsert).not.toHaveBeenCalled()
  })

  it('returns 400 and does not insert when class does not exist for the app', async () => {
    const res = await post({ ...validBody, class: 'warrior', specialization: 'Protection' })
    expect(res.status).toBe(400)
    expect(mockInsert).not.toHaveBeenCalled()
  })

  it('returns 400 and does not insert when specialization does not belong to the class', async () => {
    const res = await post({ ...validBody, specialization: 'Protection' })
    expect(res.status).toBe(400)
    expect(mockInsert).not.toHaveBeenCalled()
  })

  it('returns 400 and does not insert when answers is the raw 40-question array', async () => {
    const res = await post({ ...validBody, answers: new Array(40).fill(3) })
    expect(res.status).toBe(400)
    expect(mockInsert).not.toHaveBeenCalled()
  })

  it('returns 400 and does not insert when the body is not JSON', async () => {
    const res = await post('not json')
    expect(res.status).toBe(400)
    expect(mockInsert).not.toHaveBeenCalled()
  })

  it('returns 500 when Supabase rejects the insert', async () => {
    mockInsert.mockResolvedValue({ data: null, error: { message: 'boom' } })
    const res = await post(validBody)
    expect(res.status).toBe(500)
  })

  it('returns 429 and does not insert when the rate limiter rejects the client', async () => {
    mockIsAllowed.mockReturnValue({ allowed: false, remaining: 0, resetTime: Date.now() + 60_000 })
    const res = await post(validBody)
    expect(res.status).toBe(429)
    expect(mockInsert).not.toHaveBeenCalled()
  })
})
