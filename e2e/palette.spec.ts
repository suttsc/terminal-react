import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

test('the homepage palette filters, highlights and runs a command', async ({ page }) => {
  await page.goto('/')

  const combobox = page.getByRole('combobox')
  await expect(combobox).toBeFocused()

  await combobox.fill('/he')
  const help = page.getByRole('option', { name: /\/help/ })
  await expect(help).toHaveAttribute('aria-selected', 'true')

  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('ArrowUp')
  await page.keyboard.press('Enter')

  await expect(page.getByRole('listbox', { name: 'commands' })).toBeVisible()
  await expect(combobox).toHaveAttribute('aria-activedescendant', /option-0$/)
  await expect(page.getByRole('option', { name: /\/about/ })).toBeVisible()
})

test('a window opens, closes on Esc and hands focus back', async ({ page }) => {
  await page.goto('/')

  const combobox = page.getByRole('combobox')
  await combobox.fill('/about')
  await page.keyboard.press('Enter')

  const window = page.getByRole('dialog', { name: 'about.txt' })
  await expect(window).toBeVisible()
  await expect(window).toBeFocused()

  await page.keyboard.press('Escape')

  await expect(window).toBeHidden()
  await expect(combobox).toBeFocused()
})

test('Cmd/Ctrl+K summons the palette on another page', async ({ page }) => {
  await page.goto('/links')
  await expect(page.getByRole('combobox')).toBeHidden()

  await page.keyboard.press('ControlOrMeta+k')

  await expect(page.getByRole('dialog', { name: 'Command palette' })).toBeVisible()
  await expect(page.getByRole('combobox')).toBeFocused()
})

async function windowAnimation(page: Page): Promise<string> {
  await page.goto('/')
  await page.getByRole('combobox').fill('/about')
  await page.keyboard.press('Enter')

  const window = page.getByRole('dialog', { name: 'about.txt' })
  await expect(window).toBeVisible()

  return window.evaluate((element) => getComputedStyle(element).animationName)
}

test('windows pop in by default', async ({ page }) => {
  expect(await windowAnimation(page)).toBe('pop')
})

test.describe('with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('nothing animates', async ({ page }) => {
    expect(await windowAnimation(page)).toBe('none')
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0)
  })
})

test('/tools sets no cookies and asks not to be indexed', async ({ request }) => {
  for (const path of ['/tools', '/tools/base64']) {
    const response = await request.get(path)

    expect(response.status()).toBe(200)
    expect(response.headers()['x-robots-tag']).toBe('noindex, nofollow')
    expect(response.headers()['set-cookie']).toBeUndefined()
  }

  expect((await request.get('/tools/nope')).status()).toBe(404)
})

test('only commands that show content have a page', async ({ request }) => {
  for (const path of ['/help', '/uptime', '/blog', '/strava', '/whoami', '/ai']) {
    expect((await request.get(path)).status(), path).toBe(200)
  }

  for (const path of ['/coffee', '/deploy', '/nonsense', '/links/abc', '/links/999999']) {
    expect((await request.get(path)).status(), path).toBe(404)
  }
})

test('fixed commands answer without asking the server; the rest still ask', async ({ page }) => {
  const asked: string[] = []
  page.on('request', (request) => {
    if (new URL(request.url()).pathname === '/terminal') {
      asked.push(request.postDataJSON().command)
    }
  })

  await page.goto('/')
  const combobox = page.getByRole('combobox')

  await combobox.fill('/ai')
  await page.keyboard.press('Enter')
  await expect(page.getByRole('dialog', { name: 'ai.txt' })).toBeVisible()
  await page.keyboard.press('Escape')

  await combobox.fill('/help')
  await page.keyboard.press('Enter')
  await expect(page.getByRole('listbox', { name: 'commands' })).toBeVisible()
  await page.keyboard.press('Escape')

  await combobox.fill('/uptime')
  await page.keyboard.press('Enter')
  await expect(page.getByText(/deploys so far/)).toBeVisible()

  expect(asked).toEqual(['/uptime'])
})
