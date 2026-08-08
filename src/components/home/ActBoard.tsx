/**
 * **ACT I · The board state** — 03-content-spec, the homepage's first act.
 *
 * Spec: *the BMC assembling itself from Beacon's facts (`fw/bmc-assemble`), evidence
 * chips landing.* The recipe is the same one `/frameworks/bmc` performs and the same one
 * the gallery reviews; what changes here is the data and the density. A homepage canvas
 * carries two items per block instead of four, because the act has one job — show that a
 * framework can *fill itself in from evidence* — and nine full blocks would spend the
 * viewport on detail nobody reads while scrolling.
 *
 * The contradiction is the payoff: key resources wears the `contradiction` grade, so the
 * block the revenue line leans on pulses red once as the canvas finishes. That is the
 * question ACT III answers.
 *
 * This is a server component. `BmcAssemble` is the client island; the blocks, the claims
 * and the evidence chips are rendered here, at build time, from the authored pack.
 */

import { ClaimLine, EvidenceChips } from '@/components/framework-page/Claims';
import { MONO_LABEL } from '@/components/styles';
import { beaconMechanical } from '@/content/companies/beacon-mechanical';
import { BmcAssemble } from '@/motion/fw-bmc-assemble';
import { ActCopy } from './ActCopy';
import { BMC_BLOCKS, BOARD_CLAIMS, BOARD_SOURCES, COMPANY, FICTION_CHIP } from './data';

export function ActBoard() {
  return (
    <div data-home-act="board" className="grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
      <div className="order-2 lg:order-1">
        <BmcAssemble blocks={BMC_BLOCKS} company={COMPANY} />
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className={`${MONO_LABEL} text-[9px]`} style={{ color: 'var(--faint)' }}>
            assembled from
          </span>
          <EvidenceChips company={beaconMechanical} refs={BOARD_SOURCES} />
        </div>
      </div>

      <ActCopy
        className="order-1 lg:order-2"
        kicker="fw/bmc-assemble"
        headline={
          <>
            A business, filled in from <em className="italic">evidence</em> rather than from
            memory.
          </>
        }
        note="Nine blocks assemble in the order you actually reason — who you serve, what you promise, how you reach them, what it takes. Watch key resources: the block the revenue line leans on is the block with no room left in it."
      >
        <div className="grid gap-3">
          {BOARD_CLAIMS.map((claim) => (
            <ClaimLine key={claim.text} claim={claim} company={beaconMechanical} />
          ))}
        </div>
        {/*
          Ruling 4 on the one page every visitor sees. The canvas above looks like a real
          diagnosis of a real company; this chip is the sentence that stops it being one.
        */}
        <p
          className={`${MONO_LABEL} mt-4 flex items-start gap-2 text-[10px]`}
          style={{ color: 'var(--faint)' }}
        >
          <span
            aria-hidden="true"
            className="mt-[6px] inline-block h-[5px] w-[5px] shrink-0 rounded-full"
            style={{ background: 'var(--line-strong)' }}
          />
          {FICTION_CHIP}
        </p>
      </ActCopy>
    </div>
  );
}

export default ActBoard;
