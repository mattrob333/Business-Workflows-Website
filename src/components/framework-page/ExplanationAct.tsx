'use client';

/**
 * Section 1 — the animated explanation, act-pinned (03-content-spec; 01-design-system §4).
 *
 * The framework's own motion recipe performs on its example company while the act holds
 * the viewport. The recipe is passed in as `children`, already bound to the company's
 * authored pack by the page's config module, so this component knows nothing about any
 * particular framework — it owns the *staging*, not the diagram.
 *
 * The re-key is S2's trick, and it is load-bearing here for the same reason it was there:
 * a statically exported page renders with `reduced === false` and only learns the truth at
 * hydration. `Act` reads that flag to decide whether to pin and whether to drive the
 * blur/fade handoff through motion values. Flipping it mid-life would leave Framer holding
 * style values nobody is updating any more — a stage stuck at 20% opacity. Re-keying the
 * `Acts` tree on the flip remounts it in the other mode instead. Full-motion visitors never
 * see the flip, so they never see a remount.
 */

import type { ReactNode } from 'react';
import { Kicker } from '@/components';
import { useReducedMotion } from '@/lib/motion-utils';
import { Act, Acts } from '@/motion/acts';

export interface ExplanationActProps {
  /** Mono kicker over the headline — the recipe name (01 §5). */
  recipe: string;
  /** Printed in the margin rail. */
  actTitle: string;
  headline: ReactNode;
  note: string;
  /** Viewport heights to pin. `Act` clamps to the spec'd 1.5–2.5. */
  pin?: number;
  /** The recipe element. */
  children: ReactNode;
  /** Sourced reading of the diagram, under the stage. */
  caption?: ReactNode;
}

export function ExplanationAct({
  recipe,
  actTitle,
  headline,
  note,
  pin = 2.2,
  children,
  caption,
}: ExplanationActProps) {
  const reduced = useReducedMotion();

  return (
    <Acts key={reduced ? 'flat' : 'motion'} acts={[{ id: 'explain', title: actTitle }]}>
      <Act id="explain" pin={pin}>
        <div data-testid="showpiece" data-showpiece={recipe}>
          <div className="mb-6 max-w-[58ch]">
            <Kicker>{recipe}</Kicker>
            <h3
              className="font-narrative mt-3 text-[clamp(24px,3.2vw,38px)] leading-[1.08] text-balance"
              style={{ color: 'var(--ink)' }}
            >
              {headline}
            </h3>
            <p className="mt-2 text-[14px] leading-relaxed" style={{ color: 'var(--muted)' }}>
              {note}
            </p>
          </div>
          {children}
          {caption ? <div className="mt-5">{caption}</div> : null}
        </div>
      </Act>
    </Acts>
  );
}

export default ExplanationAct;
