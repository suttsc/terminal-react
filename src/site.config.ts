/**
 * Constants the site is built around. Records that change live in Payload.
 */
export const site = {
  name: 'suttsc',
  /** The taskbar clock shows the owner's time, not the visitor's. */
  timezone: 'Europe/London',
  /** The day suttsc.com was registered. /uptime counts the days since. */
  get registeredAt(): string {
    return process.env.SITE_REGISTERED_AT || '2026-08-26'
  },
  /** Where /hire points people. */
  get contactEmail(): string | null {
    return process.env.SITE_CONTACT_EMAIL || null
  },
} as const
