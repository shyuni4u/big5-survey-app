import { render, cleanup } from '@testing-library/react'
import Analytics from './Analytics'

jest.mock('next/navigation', () => ({
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))
jest.mock('next/script', () => ({
  __esModule: true,
  default: ({ src }: { src: string }) => <script async src={src} />,
}))

afterEach(() => {
  cleanup()
  delete window.personaGaId
  delete window.gtag
  delete window.dataLayer
})

it('loads the connected tag but routes events to the GA4 stream', () => {
  const { container, rerender } = render(<Analytics gaId="G-DESTINATION" tagId="GT-INSTALLATION" />)
  expect(container.querySelector('script')?.src).toBe('https://www.googletagmanager.com/gtag/js?id=GT-INSTALLATION')
  const commands = () => window.dataLayer!.map(command => Array.from(command as ArrayLike<unknown>))
  expect(commands()).toContainEqual(['config', 'GT-INSTALLATION', expect.objectContaining({ send_page_view: false })])
  expect(commands()).toContainEqual(['event', 'page_view', expect.objectContaining({ send_to: 'G-DESTINATION' })])
  rerender(<Analytics gaId="G-DESTINATION" tagId="GT-INSTALLATION" />)
  expect(commands().filter(command => command[0] === 'event')).toHaveLength(1)
})

it('keeps the measurement ID fallback for ordinary streams', () => {
  const { container } = render(<Analytics gaId="G-EXAMPLE" />)
  expect(container.querySelector('script')?.src).toContain('id=G-EXAMPLE')
})

it('does not initialize an invalid installation tag', () => {
  const { container } = render(<Analytics gaId="G-EXAMPLE" tagId="invalid" />)
  expect(container.querySelector('script')).toBeNull()
  expect(window.dataLayer).toBeUndefined()
})
