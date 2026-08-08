/**
 * **ACT V · The bridge** — 03-content-spec, the last act.
 *
 * Spec: *the loop diagram (observe→model→diagnose→prioritize→delegate→measure→↺), then:
 * "You just watched it run once. **Instinct keeps it running.**"*
 *
 * The conversion sentence is law, not copywriting (00-LAW Ruling 6): never *buy more
 * framework reports* — always *you ran it once, Instinct keeps it running*. It is set
 * here and nowhere else on the page, over the diagram that has just shown what "running"
 * means.
 *
 * The waitlist and the footer are the next section rather than part of this act's pinned
 * stage: a form inside a sticky, scroll-scrubbed viewport is a form nobody can fill in,
 * and `WaitlistBar` has its own designed honest state that deserves to be read at rest.
 *
 * Server component; `LoopDiagram` is the island.
 */

import { ActCopy } from './ActCopy';
import { LoopDiagram } from './LoopDiagram';
import { LOOP_STATIONS } from './data';

export function ActBridge() {
  return (
    <div
      data-home-act="bridge"
      className="grid items-center gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]"
    >
      <ActCopy
        kicker="motion/route · the loop"
        headline={
          <>
            You just watched it run once.{' '}
            <em className="italic">Instinct keeps it running.</em>
          </>
        }
        note="A framework you run once is a document. The same framework, wired to the state the last one wrote and re-run when the evidence moves, is a system — and the difference is only that nobody has to remember to start it."
      />
      <LoopDiagram stations={LOOP_STATIONS} />
    </div>
  );
}

export default ActBridge;
