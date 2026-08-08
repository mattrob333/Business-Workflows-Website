/**
 * **ACT III · The conductor** — 03-content-spec, and the page's amber moment.
 *
 * Spec: *everything dims except the flow pipe; the bottleneck backs up; **the page's
 * first amber appears here** and nowhere earlier. "A hundred true findings. One binding
 * constraint."*
 *
 * ## The amber choreography, in one place
 *
 * Amber is the site's most sacred rule (00-LAW Ruling 2, 01-design-system §1) and this
 * page is where it is easiest to break, because a homepage wants an accent colour. It
 * does not get one. The choreography is:
 *
 *   - The hero and ACTs I, II, IV and V contain **no amber at all**, asserted as an
 *     absence by `tests/home.spec.ts` — not "no amber outside a surface", but none.
 *   - ACT III carries every amber pixel on the page, and every one of them sits inside a
 *     `[data-amber-surface]`: `fw/toc-flow`'s computed stage (`toc`) and the
 *     `ConstraintBadge` that names it (`badge`). Both files already carry the
 *     `amber-law` pragma that `scripts/lint-tokens.mjs` enforces.
 *   - **No new amber-bearing component was written for this slice.** The badge beside the
 *     headline is the existing `ConstraintBadge`; the pipe is the existing recipe. A third
 *     pragma'd file on the homepage would have been the first crack in the law.
 *
 * The constraint is *computed*, never authored: `fw/toc-flow` wears amber on whichever
 * stage has the least capacity, so the stage named in the copy is read back out of the
 * same model (`CONSTRAINED_STAGE` in `./data`) rather than typed twice.
 *
 * Server component; `TocFlow` and `ConductorStage` are the islands.
 */

import { ConstraintBadge } from '@/components/ConstraintBadge';
import { ClaimLine } from '@/components/framework-page/Claims';
import { MONO_LABEL } from '@/components/styles';
import { beaconMechanical } from '@/content/companies/beacon-mechanical';
import { TocFlow } from '@/motion/fw-toc-flow';
import { ActCopy } from './ActCopy';
import { ConductorStage } from './ConductorStage';
import {
  CONDUCTOR_CLAIMS,
  CONSTRAINED_STAGE,
  TOC_DEMAND,
  TOC_INTERVENTIONS,
  TOC_STAGES,
  TOC_UNIT,
} from './data';

export function ActConductor() {
  return (
    <ConductorStage>
      <div data-home-act="conductor" className="grid gap-6">
        <ActCopy
          kicker="fw/toc-flow · the conductor"
          headline={
            <>
              A hundred true findings. <em className="italic">One</em> binding constraint.
            </>
          }
          note="Every framework above returned something true. Only one of those truths sets the rate of the whole system — and improving anything else is how a business stays busy while nothing moves."
          aside={
            <>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <ConstraintBadge subject={CONSTRAINED_STAGE} />
                <span className={`${MONO_LABEL} text-[9px]`} style={{ color: 'var(--faint)' }}>
                  computed from capacity
                </span>
              </div>
              {/*
                One claim, and it cites five objects of its own — a separate "modelled
                from" chip row would repeat them. A pinned act has no room for a sentence
                said twice.
              */}
              <div className="mt-3 grid gap-3">
                {CONDUCTOR_CLAIMS.map((claim) => (
                  <ClaimLine key={claim.text} claim={claim} company={beaconMechanical} />
                ))}
              </div>
            </>
          }
        />

        {/*
          The pipe is held to four-fifths of the column. It is the widest diagram on the
          page and the act above it is the wordiest, and a pinned stage clips: this is the
          sixty pixels that keep the interventions on screen at 720px tall.
        */}
        <div className="mx-auto w-full max-w-4xl">
          <TocFlow
            stages={TOC_STAGES}
            interventions={TOC_INTERVENTIONS}
            demand={TOC_DEMAND}
            unit={TOC_UNIT}
          />
        </div>
      </div>
    </ConductorStage>
  );
}

export default ActConductor;
