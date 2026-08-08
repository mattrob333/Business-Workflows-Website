/**
 * **ACT IV · The delegation** — 03-content-spec.
 *
 * Spec: *the RACI routing animation; a packet stops at a human checkpoint; the signature
 * draws. "Some of the work goes to people. Some to agents. Accountability stays human."*
 *
 * The stop is the argument. Everything before this act says frameworks can run
 * continuously; this one shows the place they must not, and gives that place a name and a
 * signature. It is the animated form of the approval-gated state writes Phase 2's engine
 * is built around (00-LAW Ruling 4) — which is why the homepage shows it now, before a
 * visitor has any reason to trust that this stack would ever stop and ask.
 *
 * Square nodes are agents, round nodes are humans, and accountability is always round.
 *
 * No amber. A checkpoint is a *design*, not a diagnosis — the same ruling the
 * `/frameworks/raci` walk asserts.
 *
 * Server component; `RaciRoute` is the island.
 */

import { ClaimLine, EvidenceChips, MetricLine } from '@/components/framework-page/Claims';
import { MONO_LABEL } from '@/components/styles';
import { beaconMechanical } from '@/content/companies/beacon-mechanical';
import { RaciRoute } from '@/motion/fw-raci-route';
import { ActCopy } from './ActCopy';
import {
  DELEGATION_CLAIMS,
  DELEGATION_METRICS,
  DELEGATION_SOURCES,
  RACI_NODES,
  RACI_PACKET,
} from './data';

export function ActDelegation() {
  return (
    <div data-home-act="delegation" className="grid gap-7">
      <ActCopy
        kicker="fw/raci-route · the delegation"
        headline={
          <>
            Some of the work goes to people. Some to agents.{' '}
            <em className="italic">Accountability stays human.</em>
          </>
        }
        note="The constraint named an action, and the action has to be done by someone. Watch the packet: it moves at machine speed until it reaches the person who owns the outcome, and then it waits — visibly, with the wait on the record — until it is signed."
        aside={
          <div className="grid gap-3">
            {DELEGATION_METRICS.map((metric) => (
              <MetricLine
                key={metric.label}
                metric={metric}
                company={beaconMechanical}
                label="signed, waiting on a crew"
              />
            ))}
            {DELEGATION_CLAIMS.map((claim) => (
              <ClaimLine key={claim.text} claim={claim} company={beaconMechanical} />
            ))}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className={`${MONO_LABEL} text-[9px]`} style={{ color: 'var(--faint)' }}>
                routed from
              </span>
              <EvidenceChips company={beaconMechanical} refs={DELEGATION_SOURCES} />
            </div>
          </div>
        }
      />

      <RaciRoute nodes={RACI_NODES} packet={RACI_PACKET} />
    </div>
  );
}

export default ActDelegation;
