import { safeAnalyticsUrl, shareUrl } from './sharing'
import { unzipData } from './utils'

describe('share attribution and privacy', () => {
  const scores = { E: 70, A: 60, C: 50, N: 40, O: 80 }
  it('tags result links and includes only public result data', () => {
    const url = new URL(shareUrl('https://survey.enzo.kr', 'WoW', 'copy_link', scores))
    expect(url.pathname).toBe('/result')
    expect(url.searchParams.get('ref')).toBe('share')
    expect(url.searchParams.get('utm_content')).toBe('copy_link')
    expect(unzipData(url.searchParams.get('data')!)).toEqual({ userType: 'new', personalityScores: scores })
  })
  it('QR starts the selected game without embedding personality scores', () => {
    const url = new URL(shareUrl('https://survey.enzo.kr', 'DNF', 'card_qr'))
    expect(url.pathname).toBe('/survey')
    expect(url.searchParams.get('type')).toBe('new')
    expect(url.searchParams.get('game')).toBe('DNF')
    expect(url.searchParams.has('data')).toBe(false)
  })
  it('removes result data and arbitrary query values from analytics URLs', () => {
    expect(
      safeAnalyticsUrl('https://survey.enzo.kr/result?data=private&game=WoW&utm_source=play_persona#private'),
    ).toBe('https://survey.enzo.kr/result?utm_source=play_persona')
  })
})
