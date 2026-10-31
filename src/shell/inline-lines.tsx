export default function InlineLines({ lines }: { lines: string[] }) {
  return (
    <div className="overflow-x-auto font-mono text-[13px] leading-[1.75] text-ink-dim">
      {lines.map((line, index) => (
        // Spacing is kept so columns line up; on a narrow screen long lines wrap
        // rather than run off the edge.
        <p key={index} className="whitespace-pre max-sm:break-words max-sm:whitespace-pre-wrap">
          {line || ' '}
        </p>
      ))}
    </div>
  )
}
