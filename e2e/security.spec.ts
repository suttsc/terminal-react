import { expect, test } from '@playwright/test'

test('pages send the security headers and a fresh nonce each time', async ({ request }) => {
  const first = await request.get('/')
  const second = await request.get('/')
  const policy = first.headers()['content-security-policy'] ?? ''

  expect(first.headers()['x-frame-options']).toBe('DENY')
  expect(first.headers()['x-content-type-options']).toBe('nosniff')
  expect(first.headers()['referrer-policy']).toBe('strict-origin-when-cross-origin')
  expect(first.headers()['strict-transport-security']).toBe('max-age=63072000')
  expect(policy).toMatch(/script-src 'self' 'nonce-[^']+' 'strict-dynamic'/)
  expect(second.headers()['content-security-policy']).not.toBe(policy)

  // Next puts the response's nonce on its own scripts.
  const nonce = /'nonce-([^']+)'/.exec(policy)?.[1]
  expect(await first.text()).toContain(`nonce="${nonce}"`)
})

test('every kind of page runs under the policy without a violation', async ({ page }) => {
  const violations: string[] = []
  page.on('console', (message) => {
    if (/Content Security Policy|Refused to/i.test(message.text())) {
      violations.push(message.text())
    }
  })

  for (const path of ['/', '/about', '/tools', '/tools/base64', '/help', '/nonsense']) {
    await page.goto(path)
    await page.waitForLoadState('networkidle')
  }

  // Hydrated and interactive under the policy: the palette still answers.
  await page.goto('/')
  await page.getByRole('combobox').fill('/about')
  await page.keyboard.press('Enter')
  await expect(page.getByRole('dialog', { name: 'about.txt' })).toBeVisible()

  expect(violations).toEqual([])
})
