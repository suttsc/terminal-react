import { inline, window } from '@/terminal/output'
import { defineCommand } from '@/terminal/types'

export const SUDO_COOKIE = 'sudo_attempts'

export default defineCommand({
  signature: '/sudo',
  description: 'Elevate privileges',
  outcome: 'inline',
  handle: async (ctx) => {
    const attempts = (Number.parseInt(ctx.cookies.getSigned(SUDO_COOKIE) ?? '0', 10) || 0) + 1

    ctx.cookies.setSigned(SUDO_COOKIE, String(attempts))

    if (attempts === 1) {
      return inline(['suttsc is not in the sudoers file.', 'This incident will be reported.'])
    }

    if (attempts === 2) {
      return inline(['I said reported.'])
    }

    return window(`incident-report-${String(attempts).padStart(3, '0')}.txt`, 'incident-report', {
      attempts,
    })
  },
})
