import type { ImgHTMLAttributes } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { zipData, SEPERATE_TOKEN } from '@/lib/utils'
import type { TestData } from '@/lib/types'

const mockPush = jest.fn()
// useRouter 는 렌더마다 같은 객체를 돌려줘야 한다. 매번 새 객체를 만들면 router 를 의존성으로 가진 effect 가 무한히 재실행된다.
const mockRouter = { push: mockPush, replace: jest.fn() }
let searchParams = new URLSearchParams()

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  useSearchParams: () => searchParams,
}))

// 추천은 동기 순수 함수(src/lib/recommend)라 모킹하지 않는다. next/image 는 jsdom 에서 일반 img 로 바꾼다.
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    const { unoptimized, ...rest } = props
    void unoptimized
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...(rest as ImgHTMLAttributes<HTMLImageElement>)} />
  },
}))

jest.mock('chart.js', () => ({
  Chart: Object.assign(
    jest.fn().mockImplementation(() => ({ destroy: jest.fn() })),
    { register: jest.fn() },
  ),
  registerables: [],
}))

jest.mock('@/components/atoms/AdpickBanner', () => ({ AdpickBanner: () => null }))
// ShareResult 는 qrcode 로 캔버스를 그린다. 저장 로직과 무관하므로 비운다.
jest.mock('@/components/molecules/ShareResult', () => ({ __esModule: true, default: () => null }))

import ResultPageClient from './ResultPageClient'

const existingUser: TestData = {
  userType: 'existing',
  personalityScores: { E: 60, A: 55, C: 70, N: 40, O: 65 },
  currentClass: [`Mage${SEPERATE_TOKEN}Fire`, `Death Knight${SEPERATE_TOKEN}Blood`],
}

const mockFetch = jest.fn()

const renderResult = (data: TestData, game = 'WoW') => {
  searchParams = new URLSearchParams({ data: zipData(data), game })
  return render(<ResultPageClient />)
}

const postedBodies = () => mockFetch.mock.calls.map(([, init]) => JSON.parse((init as RequestInit).body as string))

beforeEach(() => {
  sessionStorage.clear()
  // jsdom 은 canvas 를 구현하지 않아 getContext 가 console.error 를 찍는다. 차트는 이 테스트의 관심사가 아니다.
  jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => null)
  mockPush.mockReset()
  mockFetch.mockReset().mockResolvedValue({ ok: true, status: 200 })
  global.fetch = mockFetch as unknown as typeof fetch
  jest.spyOn(console, 'info').mockImplementation(() => {})
  jest.spyOn(console, 'warn').mockImplementation(() => {})
  jest.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  jest.restoreAllMocks()
})

describe('ResultPageClient result saving', () => {
  it('posts one row per selected class for an existing user', async () => {
    renderResult(existingUser)

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(2))
    expect(mockFetch.mock.calls.every(([url]) => url === '/api/survey-result')).toBe(true)
    expect(postedBodies()).toEqual(
      expect.arrayContaining([
        { app: 'WoW', answers: existingUser.personalityScores, class: 'Mage', specialization: 'Fire' },
        { app: 'WoW', answers: existingUser.personalityScores, class: 'Death Knight', specialization: 'Blood' },
      ]),
    )
  })

  it('does not post again when the same result is rendered a second time in the same browser session', async () => {
    const first = renderResult(existingUser)
    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(2))
    await screen.findAllByText('성격 분석 결과')
    first.unmount()

    renderResult(existingUser)
    await screen.findAllByText('성격 분석 결과')

    expect(mockFetch).toHaveBeenCalledTimes(2)
  })

  it('posts again after a failed save so a later reload can retry', async () => {
    mockFetch.mockRejectedValue(new Error('network down'))
    const first = renderResult(existingUser)
    await waitFor(() => expect(console.error).toHaveBeenCalledWith('Failed to save results:', expect.any(Error)))
    expect(mockFetch).toHaveBeenCalledTimes(2)
    first.unmount()

    mockFetch.mockResolvedValue({ ok: true, status: 200 })
    renderResult(existingUser)

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(4))
  })

  it('reports a non-2xx response as a failed save', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 400 })
    renderResult(existingUser)

    await waitFor(() => expect(console.error).toHaveBeenCalledWith('Failed to save results:', expect.any(Error)))
  })

  it('does not post for a shared result (userType new)', async () => {
    renderResult({ ...existingUser, userType: 'new' })

    await screen.findAllByText('성격 분석 결과')
    expect(mockFetch).not.toHaveBeenCalled()
  })
})
