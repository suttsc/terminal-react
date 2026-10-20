/**
 * about.txt: the window and the /about page say the same thing.
 */
export default function AboutWindow() {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-[15px] font-semibold text-ink">suttsc</h3>
      <p>
        Lead PHP/Laravel developer. Years of putting other people's businesses into databases and
        trying to keep the result maintainable.
      </p>
      <p>
        Mostly interested in application architecture — the boring, load-bearing decisions that
        decide whether a codebase is pleasant in year three.
      </p>
      <p>
        Also leading a team, which turns out to be a completely different skill that nobody warns
        you about.
      </p>
      <p className="text-ink-faint">
        Type <strong className="font-mono font-medium text-ink">/hire</strong> if this is going
        somewhere.
      </p>
    </div>
  )
}
