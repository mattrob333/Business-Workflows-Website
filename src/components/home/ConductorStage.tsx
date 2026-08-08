'use client';

/**
 * ACT III's staging — *"everything dims except the flow pipe"* (03-content-spec).
 *
 * There are two layers here and the effect only exists because of both. The act carries
 * its own `atmo/mesh-drift` field, and over it a radial wash from transparent at the pipe
 * to `--void` at the edges whose opacity is bound to the act's scroll clock. As the act
 * locks, the wash swallows the field: the room genuinely goes dark, and the pipe — which
 * carries its own atmosphere inside `fw/toc-flow` — is the last thing lit. A wash alone
 * over an already-black page would have been an invisible animation.
 *
 * The wash lives **behind** the content, not over it. Drawing it over would have dimmed
 * the sentence that names the constraint, which is the one sentence on this page that
 * must not become hard to read — and dimming live text is a contrast regression dressed
 * up as art direction.
 *
 * The scrim's insets are deliberately larger than the editorial column. `Act`'s pinned
 * stage clips at `overflow: hidden`, so an oversized child fills the viewport and stops
 * there — no `position: fixed`, which would have escaped the act entirely once the page
 * un-pins under reduced motion.
 *
 * Reduced motion: a static wash at a fixed opacity. The act is a document section then,
 * and a section that darkens as you scroll past it would be an animation by another
 * name — but the *look* of the conductor's room is part of the design, so it stays.
 */

import { motion, useMotionValue, useTransform } from 'framer-motion';
import type { ReactNode } from 'react';
import { useReducedMotion } from '@/lib/motion-utils';
import { useAct } from '@/motion/acts';
import { AtmoMeshDrift } from '@/motion/atmo-mesh-drift';

/** Transparent over the pipe, `--void` at the edges. Neutral only — never amber. */
const WASH =
  'radial-gradient(ellipse 62% 46% at 50% 54%, transparent 0%, transparent 38%, var(--void) 82%)';

export interface ConductorStageProps {
  children: ReactNode;
  className?: string;
}

export function ConductorStage({ children, className = '' }: ConductorStageProps) {
  const act = useAct();
  const reduced = useReducedMotion();
  /** Stand-in clock for the case where this renders outside an act (gallery, tests). */
  const standalone = useMotionValue(1);
  const opacity = useTransform(act?.progress ?? standalone, [0, 0.22, 1], [0, 0.92, 0.92]);

  return (
    <div data-testid="conductor-stage" className={`relative ${className}`}>
      {/*
        The room. Legal atmosphere hues only — this component cannot name the amber token
        and must not be able to: a shared staging wrapper is not a constraint surface.
      */}
      <div aria-hidden="true" className="pointer-events-none absolute z-0" style={{ inset: '-40vh -50vw' }}>
        <AtmoMeshDrift hues={['flow-deep', 'raised', 'line-strong']} count={3} seed={23} intensity={0.09} />
      </div>
      {reduced ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute z-0"
          style={{ inset: '-50vh -50vw', background: WASH, opacity: 0.55 }}
        />
      ) : (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute z-0"
          style={{ inset: '-50vh -50vw', background: WASH, opacity }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default ConductorStage;
