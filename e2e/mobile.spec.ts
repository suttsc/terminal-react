import { devices, expect, test } from '@playwright/test'

test.use({ ...devices['Pixel 7'] })

test('on a phone, an inline answer has a way back to the commands', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('option', { name: /\/blog/ }).tap()
  await expect(page.getByText('0 posts.')).toBeVisible()

  // Long lines wrap inside the palette instead of running off the edge.
  const overflows = await page
    .getByText(/^Try \/links\./)
    .evaluate((line) => line.scrollWidth > line.clientWidth)
  expect(overflows).toBe(false)

  await expect(page.getByText('back for the commands')).toBeVisible()

  const back = page.getByRole('button', { name: 'Back to the commands' })
  await expect(back.getByText('back', { exact: true })).toBeVisible()
  await expect(back.getByText('esc', { exact: true })).toBeHidden()
  await back.tap()

  await expect(page.getByRole('option', { name: /\/about/ })).toBeVisible()
  await expect(page.getByText('tap a command')).toBeVisible()
})

test('on a phone, typed text has a way to clear it', async ({ page }) => {
  await page.goto('/')
  const combobox = page.getByRole('combobox')

  await combobox.fill('/zzz')
  await page.getByRole('button', { name: 'Clear what was typed' }).tap()

  await expect(combobox).toHaveValue('')
  await expect(page.getByRole('option', { name: /\/about/ })).toBeVisible()
})
