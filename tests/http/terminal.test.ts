import { describe, expect, it } from 'vitest'
import { createTerminalHandler } from '@/http/terminal'
import { registry } from '@/terminal/registry'
import { makeTestContext } from '../support/make-test-context'

const handler = (isOwner = false) =>
  createTerminalHandler({ registry, context: async () => makeTestContext({ isOwner }).ctx })

const post = (body: unknown, headers: Record<string, string> = { origin: 'https://suttsc.com' }) =>
  new Request('https://suttsc.com/terminal', {
    method: 'POST',
    headers: { host: 'suttsc.com', 'content-type': 'application/json', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })

describe('POST /terminal', () => {
  it('runs a command and returns its output', async () => {
    const response = await handler()(post({ command: '/coffee' }))

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      type: 'inline',
      lines: ["418 I'm a teapot", 'This server is, permanently, a teapot.'],
    })
  })

  it('answers a missing command and an unauthorised one identically', async () => {
    const missing = await handler()(post({ command: '/nope' }))
    const unauthorised = await handler()(post({ command: '/deploy' }))

    expect(missing.status).toBe(404)
    expect(unauthorised.status).toBe(404)
    expect(await unauthorised.text()).toBe(await missing.text())
  })

  it('runs owner commands for the owner', async () => {
    expect((await handler(true)(post({ command: '/deploy' }))).status).toBe(200)
  })

  it('returns 422 when no command is sent', async () => {
    const response = await handler()(post({}))

    expect(response.status).toBe(422)
    await expect(response.json()).resolves.toMatchObject({
      errors: { command: 'The command field is required.' },
    })
  })

  it('returns 422 when the command is longer than 255 characters', async () => {
    const response = await handler()(post({ command: `/${'a'.repeat(255)}` }))

    expect(response.status).toBe(422)
    await expect(response.json()).resolves.toMatchObject({
      errors: { command: 'The command field must not be greater than 255 characters.' },
    })
  })

  it('returns 422 for a body that is not JSON', async () => {
    expect((await handler()(post('not json'))).status).toBe(422)
  })

  it('refuses a request from another site, or from nowhere', async () => {
    expect(
      (await handler()(post({ command: '/coffee' }, { origin: 'https://evil.test' }))).status,
    ).toBe(403)
    expect((await handler()(post({ command: '/coffee' }, {}))).status).toBe(403)
  })
})
