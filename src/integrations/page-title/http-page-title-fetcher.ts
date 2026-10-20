import { decodeHTML } from 'entities'
import type { PageTitleFetcher } from '@/integrations/page-title/page-title-fetcher'

const USER_AGENT = 'suttsc.com link shelf'
const TIMEOUT_MS = 10_000
const MAX_LENGTH = 255

/**
 * Fetches a saved link's <title> after the response has gone or from a cron
 * run, never while a visitor waits.
 */
export class HttpPageTitleFetcher implements PageTitleFetcher {
  constructor(private readonly fetchImpl: typeof fetch = fetch) {}

  async fetch(url: string): Promise<string | null> {
    let body: string

    try {
      const response = await this.fetchImpl(url, {
        headers: { 'User-Agent': USER_AGENT },
        redirect: 'follow',
        signal: AbortSignal.timeout(TIMEOUT_MS),
      })

      if (!response.ok) {
        return null
      }

      body = await response.text()
    } catch {
      return null
    }

    const match = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(body)

    if (!match?.[1]) {
      return null
    }

    const title = decodeHTML(match[1]).replace(/\s+/g, ' ').trim().slice(0, MAX_LENGTH)

    return title === '' ? null : title
  }
}
