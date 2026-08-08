'use client';

/**
 * The scroll machinery for the five acts — the homepage's only page-level client island.
 *
 * It owns three things and nothing else:
 *
 * 1. **Lenis.** 01-design-system §4 makes smooth scroll the foundation of the motion
 *    language. Reduced-motion visitors are opted out inside `LenisProvider` itself.
 * 2. **The `Acts` registry**, so the margin rail can print `03 / 05` on the server render
 *    rather than flickering it in after hydration.
 * 3. **The reduced-motion re-key**, S2's trick and S3's, load-bearing for the same
 *    reason both times: a statically exported page renders with `reduced === false` and
 *    only learns the truth at hydration. `Act` reads that flag to decide whether to pin
 *    and whether to drive its blur/fade handoff through motion values; flipping it
 *    mid-life would leave Framer holding style values nobody updates any more — an act
 *    stuck at twenty per cent opacity. Re-keying remounts the tree in the other mode
 *    instead. Full-motion visitors never see the flip, so they never see a remount.
 *
 * The acts themselves arrive as `children` **already rendered on the server**. That is
 * the whole performance argument of this slice: the diagrams are client components, but
 * the nine canvas blocks, the five pipe stages, the eight graph edges and every claim
 * block around them are computed at build time from the registry and Beacon's pack, and
 * cross into the browser as props. Neither the registry nor the pack is in this bundle.
 */

import type { ReactNode } from 'react';
import { LenisProvider, useReducedMotion } from '@/lib/motion-utils';
import { Acts, type ActDefinition } from '@/motion/acts';

export interface HomeStageProps {
  acts: ActDefinition[];
  children: ReactNode;
  /** Anchor target for the hero's `Watch it run ↓`. */
  id?: string;
}

export function HomeStage({ acts, children, id }: HomeStageProps) {
  const reduced = useReducedMotion();

  return (
    <LenisProvider>
      <div id={id} data-testid="home-acts" data-reduced={reduced ? 'true' : 'false'}>
        <Acts key={reduced ? 'flat' : 'motion'} acts={acts}>
          {children}
        </Acts>
      </div>
    </LenisProvider>
  );
}

export default HomeStage;
