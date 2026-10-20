/**
 * ai.txt: credit where it is due.
 */
export default function AiWindow() {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-[15px] font-semibold text-ink">Built with AI. Mostly Claude Opus 5.5.</h3>
      <p>
        This website was designed and built with AI — mostly Claude Opus 5.5, working in Claude
        Code. It runs on Next.js, with Payload looking after the handful of records it keeps.
      </p>
      <p>
        suttsc decided what to build, argued about how, and owns the result. The AI wrote a great
        deal of it, and was argued with a great deal.
      </p>
      <p className="text-ink-faint">The jokes are suttsc's. Blame accordingly.</p>
    </div>
  )
}
