export default function InlineLines({ lines }: { lines: string[] }) {
  return (
    <div className="overflow-x-auto font-mono text-[13px] leading-[1.75] text-ink-dim">
      {lines.map((line, index) => (
        <p key={index} className="whitespace-pre">
          {line || ' '}
        </p>
      ))}
    </div>
  )
}
