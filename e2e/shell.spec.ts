import { expect, test } from '@playwright/test'
import { encode } from 'next-auth/jwt'

test('a chosen theme repaints the page and survives a reload', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'amber')

  await page.getByRole('combobox').fill('/theme')
  await page.keyboard.press('Enter')
  await expect(page.getByRole('listbox', { name: 'themes' })).toBeVisible()

  // Moving the selection previews; Enter keeps.
  await page.keyboard.press('ArrowDown')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'phosphor')
  await page.keyboard.press('Enter')
  await expect(page.getByText('phosphor. Noted.')).toBeVisible()

  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'phosphor')
})

test('Esc on a theme preview puts the old theme back', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('combobox').fill('/theme')
  await page.keyboard.press('Enter')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('ArrowDown')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'cold')

  await page.keyboard.press('Escape')

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'amber')
})

test('a window hides to the taskbar and comes back', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('combobox').fill('/whoami')
  await page.keyboard.press('Enter')

  const window = page.getByRole('dialog', { name: 'whoami.txt' })
  await expect(window).toBeVisible()

  await page.getByRole('button', { name: 'Minimise whoami.txt' }).click()
  await expect(window).toBeHidden()

  await page
    .getByRole('navigation', { name: 'Taskbar' })
    .getByRole('button', { name: 'whoami.txt' })
    .click()
  await expect(window).toBeVisible()
  await expect(window).toBeFocused()
})

test('windows step aside to the taskbar when the page changes', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('combobox').fill('/about')
  await page.keyboard.press('Enter')
  const window = page.getByRole('dialog', { name: 'about.txt' })
  await expect(window).toBeVisible()

  await page.getByRole('combobox').fill('/hire')
  await page.keyboard.press('Enter')

  await expect(page).toHaveURL(/\/hire$/)
  await expect(window).toBeHidden()
  await expect(
    page.getByRole('navigation', { name: 'Taskbar' }).getByRole('button', { name: 'about.txt' }),
  ).toBeVisible()
})

test.describe('as the owner', () => {
  test.beforeEach(async ({ context, baseURL }) => {
    const secret = process.env.AUTH_SECRET
    test.skip(!secret, 'AUTH_SECRET is needed to mint an owner session')

    const value = await encode({
      token: { owner: true },
      secret: secret!,
      salt: 'authjs.session-token',
    })
    await context.addCookies([{ name: 'authjs.session-token', value, url: baseURL! }])
  })

  test('owner commands are listed and run without a request', async ({ page }) => {
    const asked: string[] = []
    page.on('request', (request) => {
      if (new URL(request.url()).pathname === '/terminal') {
        asked.push(request.postDataJSON().command)
      }
    })

    await page.goto('/')
    await expect(page.getByRole('option', { name: /\/logout/ })).toBeAttached()

    await page.getByRole('combobox').fill('/link add')
    await page.keyboard.press('Enter')

    await expect(page.getByRole('dialog', { name: 'new-link.url' })).toBeVisible()
    await expect(page.getByLabel('reason')).toBeVisible()
    expect(asked).toEqual([])
  })
})

test('visitors never see owner commands in the page source', async ({ request }) => {
  const html = await (await request.get('/')).text()

  for (const signature of ['/logout', '/deploy', '/link add', '/link rm']) {
    expect(html).not.toContain(signature)
  }
})
