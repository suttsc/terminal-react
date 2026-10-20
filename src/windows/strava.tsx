import type { RunView as Run } from '@/services/running-log'

export type StravaWindowProps = {
  runs: Run[]
  total: string
  syncedAgo: string | null
}

export default function StravaWindow({ runs, total, syncedAgo }: StravaWindowProps) {
  if (runs.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <p>No runs this week. Resting, strategically.</p>
        <p className="font-mono text-[11px] text-ink-faint">
          {syncedAgo === null ? 'Strava has never been asked.' : `synced ${syncedAgo}`}
        </p>
      </div>
    )
  }

  return (
    <div>
      <table className="w-full border-collapse font-mono text-xs tabular-nums">
        <thead>
          <tr className="border-b border-line-soft text-[10px] tracking-[0.12em] text-ink-faint uppercase">
            <th scope="col" className="pb-2 text-left font-medium">
              day
            </th>
            <th scope="col" className="pb-2 text-right font-medium">
              dist
            </th>
            <th scope="col" className="pb-2 text-right font-medium">
              pace
            </th>
            <th scope="col" className="pb-2 text-right font-medium">
              elev
            </th>
          </tr>
        </thead>
        <tbody>
          {runs.map((run, index) => (
            <tr key={index} className="border-b border-line-soft last:border-0" title={run.name}>
              <td className="py-[9px] text-ink">{run.day}</td>
              <td className="py-[9px] text-right">{run.distance}</td>
              <td className="py-[9px] text-right">{run.pace}</td>
              <td className="py-[9px] text-right">{run.elevation}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3.5 font-mono text-[11px] text-ink-faint">
        {total} this week
        {syncedAgo !== null && `  ·  synced ${syncedAgo}`}
      </p>
    </div>
  )
}
