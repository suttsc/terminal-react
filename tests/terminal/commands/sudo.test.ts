import { describe, expect, it } from 'vitest'
import { makeTestContext, manifestSignatures, run } from '../../support/make-test-context'

describe('/sudo', () => {
  it('escalates from a warning to an incident report', async () => {
    const { ctx, cookies } = makeTestContext()

    await expect(run('/sudo', ctx)).resolves.toEqual({
      type: 'inline',
      lines: ['suttsc is not in the sudoers file.', 'This incident will be reported.'],
    })
    await expect(run('/sudo', ctx)).resolves.toEqual({
      type: 'inline',
      lines: ['I said reported.'],
    })
    await expect(run('/sudo', ctx)).resolves.toEqual({
      type: 'window',
      title: 'incident-report-003.txt',
      component: 'incident-report',
      props: { attempts: 3 },
    })
    expect(cookies.signed.get('sudo_attempts')).toBe('3')
  })

  it('treats a mangled count as no count', async () => {
    const { ctx, cookies } = makeTestContext()
    cookies.setSigned('sudo_attempts', 'lots')

    await expect(run('/sudo', ctx)).resolves.toMatchObject({
      lines: ['suttsc is not in the sudoers file.', 'This incident will be reported.'],
    })
  })

  it('is listed for everyone', () => {
    expect(manifestSignatures(false)).toContain('/sudo')
  })
})
