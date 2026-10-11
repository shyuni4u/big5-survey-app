const { chromium } = require('playwright')
const assert = require('node:assert/strict')
const pako = require('pako')
const fs = require('node:fs')
const base = process.env.TEST_BASE_URL || 'http://localhost:3000'
const output = 'test-results/mobile'
fs.mkdirSync(output, { recursive: true })
const decode = (url) =>
  JSON.parse(pako.inflate(Buffer.from(new URL(url).searchParams.get('data'), 'base64url'), { to: 'string' }))
;(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true })
  try {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      acceptDownloads: true,
    })
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', (e) => errors.push(e.message))
    await page.addInitScript(() => {
      window.testCopies = []
      window.testShares = []
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { writeText: async (text) => window.testCopies.push(text) },
      })
      Object.defineProperty(navigator, 'share', { configurable: true, value: undefined })
    })
    const fits = async () =>
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'horizontal overflow')
    await page.goto(base)
    await fits()
    await page.getByRole('button', { name: '로스트아크' }).click()
    await page.getByRole('link', { name: '내 직업 발견하기' }).click()
    await page.getByText('1 / 8 페이지').waitFor()
    await page.getByRole('button', { name: '다음', exact: true }).click()
    await page.getByRole('alert').filter({ hasText: '이 문항에 답변' }).waitFor()
    assert.equal(await page.locator(':focus').getAttribute('id'), 'q0v1')
    const first = await page.locator('legend').first().innerText()
    for (let i = 0; i < 5; i++) await page.locator(`label[for="q${i}v4"]`).tap()
    await page.reload()
    await page.getByText('1 / 8 페이지').waitFor()
    assert.equal(await page.locator('legend').first().innerText(), first)
    assert.equal(await page.locator('input:checked').count(), 5)
    await page.getByRole('button', { name: '다음', exact: true }).tap()
    await page.getByText('2 / 8 페이지').waitFor()
    await page.getByRole('button', { name: '이전', exact: true }).tap()
    assert.equal(await page.locator('input:checked').count(), 5)
    await page.getByRole('button', { name: '다음', exact: true }).tap()
    for (let batch = 1; batch < 8; batch++) {
      await page.getByText(`${batch + 1} / 8 페이지`).waitFor()
      for (let i = batch * 5; i < batch * 5 + 5; i++) await page.locator(`label[for="q${i}v${(i % 5) + 1}"]`).tap()
      await fits()
      await page.getByRole('button', { name: batch === 7 ? '답변 완료' : '다음', exact: true }).tap()
    }
    await page.getByRole('button', { name: '건너뛰고 결과 보기' }).tap()
    await page.getByRole('heading', { name: '이번 모험의 주인공은?' }).waitFor({ timeout: 60000 })
    const resultUrl = page.url()
    const result = decode(resultUrl)
    assert.equal(result.userType, 'new')
    assert.equal(Object.keys(result.personalityScores).length, 5)
    assert.equal(await page.evaluate(() => localStorage.getItem('persona-survey-v1-LostArk-new')), null)
    await fits()
    await page.screenshot({ path: `${output}/result.png`, fullPage: true })
    const download = page.waitForEvent('download')
    await page.getByRole('button', { name: '결과 카드 저장' }).tap()
    await (await download).saveAs(`${output}/card.png`)
    const png = fs.readFileSync(`${output}/card.png`)
    assert.equal(png.readUInt32BE(16), 1080)
    assert.equal(png.readUInt32BE(20), 1350)
    await page.getByRole('button', { name: '링크 복사', exact: true }).tap()
    await page.getByRole('button', { name: '친구에게 결과 공유' }).tap()
    let copies = await page.evaluate(() => window.testCopies)
    assert.equal(copies.length, 2)
    assert.equal(decode(copies[0]).currentClass, undefined)
    assert.deepEqual(decode(copies[0]).personalityScores, result.personalityScores)
    await page.evaluate(() =>
      Object.defineProperty(navigator, 'share', {
        configurable: true,
        value: async (data) => window.testShares.push(data),
      }),
    )
    await page.getByRole('button', { name: '친구에게 결과 공유' }).tap()
    assert.equal((await page.evaluate(() => window.testShares)).length, 1)
    await page.evaluate(() =>
      Object.defineProperty(navigator, 'share', {
        configurable: true,
        value: async () => {
          throw new DOMException('cancel', 'AbortError')
        },
      }),
    )
    await page.getByRole('button', { name: '친구에게 결과 공유' }).tap()
    assert.equal((await page.evaluate(() => window.testCopies)).length, 2)
    await page.goto(copies[0])
    await page.getByRole('heading', { name: '이번 모험의 주인공은?' }).waitFor({ timeout: 60000 })
    for (const width of [320, 375, 430]) {
      await page.setViewportSize({ width, height: 844 })
      await fits()
    }
    await page.getByRole('link', { name: '와우 직업 추천 받기' }).click()
    await page.waitForURL(/game=WoW/)
    await page.getByText('와우에서 발견한 세 가지 가능성').waitFor()
    await page.getByRole('heading', { name: '이번 모험의 주인공은?' }).waitFor({ timeout: 60000 })
    await fits()
    assert.equal(new URL(page.url()).searchParams.get('game'), 'WoW')
    await page.getByRole('link', { name: '던전앤파이터 직업 추천 받기' }).click()
    await page.waitForURL(/game=DNF/)
    await page.getByText('던전앤파이터에서 발견한 세 가지 가능성').waitFor()
    await page.getByRole('heading', { name: '이번 모험의 주인공은?' }).waitFor({ timeout: 60000 })
    await fits()
    await page.goto(base + '/result?game=LostArk&data=invalid')
    await page.getByRole('heading', { name: '결과 링크를 확인해주세요' }).waitFor()
    assert.deepEqual(errors, [])
    console.log(
      'PASS: 40 answers, missing-answer focus, reload/resume, previous, skip class, real model results for 3 games, 320–430px overflow, PNG 1080x1350, share payload, clipboard fallback, native share/cancel handlers, shared URL, invalid URL; no uncaught page errors',
    )
    await context.close()
  } finally {
    await browser.close()
  }
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
