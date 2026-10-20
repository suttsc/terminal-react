export type PageTitleFetcher = {
  /** The contents of the page's <title>, or null when there isn't a usable one. */
  fetch(url: string): Promise<string | null>
}
