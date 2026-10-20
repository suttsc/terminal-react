/**
 * Reads unix seconds, unix milliseconds or anything Date understands.
 */
export function parseMoment(input: string): Date | null {
  const trimmed = input.trim()

  if (trimmed === '') {
    return null
  }

  if (/^-?\d+$/.test(trimmed)) {
    const number = Number(trimmed)

    // Thirteen digits or more reads as milliseconds.
    return new Date(Math.abs(number) >= 1e12 ? number : number * 1000)
  }

  const parsed = Date.parse(trimmed)

  return Number.isNaN(parsed) ? null : new Date(parsed)
}

export function formatIn(moment: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone,
    dateStyle: 'medium',
    timeStyle: 'long',
  }).format(moment)
}
