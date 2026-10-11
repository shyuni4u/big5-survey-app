import { act, render, screen } from '@testing-library/react'
import { AdpickBanner } from './AdpickBanner'

it('resizes only for valid messages from the advertising frame and protects result URLs', () => {
  const { unmount } = render(<AdpickBanner />)
  const frame = screen.getByTitle('애드픽 제휴 광고') as HTMLIFrameElement
  const source = frame.contentWindow!
  const send = (origin: string, sender: Window, height: unknown) => act(() => {
    window.dispatchEvent(new MessageEvent('message', {
      origin, source: sender, data: JSON.stringify({ id: frame.id, height }),
    }))
  })
  expect(frame).toHaveAttribute('referrerpolicy', 'origin')
  send('https://attacker.example', source, 400)
  send('https://www.adpick.co.kr', window, 400)
  expect(frame).toHaveAttribute('height', '100')
  send('https://www.adpick.co.kr', source, '50')
  expect(frame).toHaveAttribute('height', '50')
  send('https://www.adpick.co.kr', source, 100000)
  send('https://www.adpick.co.kr', source, -1)
  expect(frame).toHaveAttribute('height', '50')
  unmount()
})
