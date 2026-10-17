// Explicit opt-in: this test sends real visits and survey events to Google Analytics.
const { chromium } = require('playwright')
const assert = require('node:assert/strict')
const fs = require('node:fs')

assert.equal(process.env.TEST_LIVE_GA, '1', 'Set TEST_LIVE_GA=1 to send real verification events')
const base = process.env.TEST_BASE_URL || 'http://localhost:3100'
const measurementId = process.env.TEST_GA_ID || 'G-2FW5XLPK5V'

;(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true })
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
    const page = await context.newPage()
    const received = []
    const failures = []
    page.on('requestfailed', request => {
      // Navigation can cancel ancillary requests; required event responses are asserted below.
      if (/google(tagmanager|-analytics)\.com/.test(request.url()) && request.failure()?.errorText !== 'net::ERR_ABORTED') {
        failures.push(request.failure()?.errorText)
      }
    })
    page.on('response', response => {
      const url = new URL(response.url())
      if (!url.hostname.endsWith('google-analytics.com') || !url.pathname.endsWith('/collect')) return
      const body = response.request().postData() || ''
      for (const line of body.split('\n')) {
        const params = new URLSearchParams(url.search)
        for (const [key, value] of new URLSearchParams(line)) params.set(key, value)
        assert.equal(params.get('tid'), measurementId)
        for (const key of ['dl', 'dr']) assert(!params.get(key)?.includes('data='), 'Result payload leaked to GA')
        received.push({ event: params.get('en'), status: response.status(), source: params.get('ep.acquisition_source') })
      }
    })
    const tagResponse = page.waitForResponse(response => response.url().startsWith('https://www.googletagmanager.com/gtag/js?'))
    tagResponse.catch(() => {}) // Preserve the navigation error if the browser closes early.
    await page.goto(base + '/survey?type=new&game=LostArk&ref=share&utm_source=play_persona&utm_medium=referral&utm_campaign=result_share&utm_content=card_qr')
    const script = await tagResponse
    assert.equal(script.status(), 200, 'Google tag must load successfully')
    assert.match(script.headers()['content-type'], /javascript/)
    for (let batch = 0; batch < 8; batch++) {
      await page.getByText(`${batch + 1} / 8 페이지`).waitFor()
      for (let i = batch * 5; i < batch * 5 + 5; i++) await page.locator(`label[for="q${i}v3"]`).tap()
      await page.getByRole('button', { name: batch === 7 ? '답변 완료' : '다음', exact: true }).tap()
    }
    // Skip current-class submission so verification does not add training data.
    await page.getByRole('button', { name: '건너뛰고 결과 보기' }).tap()
    await page.getByRole('heading', { name: '이번 모험의 주인공은?' }).waitFor({ timeout: 60000 })
    const download = page.waitForEvent('download')
    await page.getByRole('button', { name: '결과 카드 저장', exact: true }).tap()
    await download
    await page.waitForTimeout(8000)
    for (const name of ['page_view', 'share_landing', 'survey_start', 'survey_complete', 'share_card_download']) {
      assert(received.some(event => event.event === name && event.status >= 200 && event.status < 300), `No successful GA request for ${name}`)
    }
    assert.equal(received.filter(event => event.event === 'survey_complete').length, 1)
    assert.equal(failures.length, 0, failures.join(', '))
    fs.mkdirSync('test-results', { recursive: true })
    fs.writeFileSync('test-results/analytics-live.json', JSON.stringify({ base, measurementId, received }, null, 2))
    console.log(JSON.stringify({ base, measurementId, received }, null, 2))
  } finally {
    await browser.close()
  }
})().catch(error => { console.error(error); process.exitCode = 1 })
