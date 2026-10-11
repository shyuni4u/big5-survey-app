import type { PersonalityScores } from './types'
import { zipData } from './utils'

export type ShareMethod = 'native' | 'copy_link' | 'card_qr'
export function shareUrl(origin: string, game: string, method: ShareMethod, scores?: PersonalityScores) {
  const url = new URL(scores ? '/result' : '/survey', origin)
  url.searchParams.set('game', game)
  if (scores) url.searchParams.set('data', zipData({ userType: 'new', personalityScores: scores }))
  else url.searchParams.set('type', 'new')
  url.searchParams.set('ref', 'share')
  url.searchParams.set('utm_source', 'play_persona')
  url.searchParams.set('utm_medium', 'referral')
  url.searchParams.set('utm_campaign', 'result_share')
  url.searchParams.set('utm_content', method)
  return url.toString()
}

export function safeAnalyticsUrl(input: string) {
  const url = new URL(input)
  const clean = new URL(url.pathname, url.origin)
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content']) {
    const value = url.searchParams.get(key)
    if (value && /^[a-zA-Z0-9_-]{1,50}$/.test(value)) clean.searchParams.set(key, value)
  }
  return clean.toString()
}
