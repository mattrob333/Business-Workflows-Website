'use client';

/**
 * Recipe `atmo/grain` — 01-design-system §2, layer 1 (the film-grain overlay).
 *
 * Spec: static film grain, `opacity: .04`, `mix-blend-mode: overlay`.
 *
 * Implemented as an inline SVG `feTurbulence` rather than a tiling PNG: it costs zero
 * network bytes (team rule 9 — performance is a feature of the design), it is resolution
 * independent so it never softens on a 2x display, and it keeps `public/` free of a
 * binary that would have to be regenerated whenever the grain is tuned.
 *
 * The turbulence is desaturated with `feColorMatrix` before it reaches the page —
 * unfiltered turbulence is *coloured* noise, which would smuggle non-token hues onto
 * the canvas. Grain is static by definition: nothing here animates, so the recipe has
 * no reduced-motion variant to define beyond "identical".
 */

import { useSvgId } from '@/lib/motion-utils';

export interface GrainProps {
  /** Spec default is .04. Raise only with a documented reason. */
  opacity?: number;
  /** Turbulence frequency. Higher = finer grain. */
  frequency?: number;
  /** `fixed` pins the grain to the viewport (page-level); `absolute` scopes it. */
  position?: 'fixed' | 'absolute';
  className?: string;
}

export function Grain({
  opacity = 0.04,
  frequency = 0.82,
  position = 'absolute',
  className = '',
}: GrainProps) {
  const filterId = useSvgId('grain');

  return (
    <div
      aria-hidden="true"
      data-recipe="atmo/grain"
      className={`pointer-events-none ${position === 'fixed' ? 'fixed' : 'absolute'} inset-0 ${className}`}
      style={{ opacity, mixBlendMode: 'overlay', zIndex: 1 }}
    >
      <svg className="h-full w-full" width="100%" height="100%" focusable="false">
        <filter id={filterId} x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency={frequency}
            numOctaves={4}
            stitchTiles="stitch"
            result="noise"
          />
          {/* Desaturate: grain is luminance, never colour. */}
          <feColorMatrix
            in="noise"
            type="matrix"
            values="0 0 0 0 0.5
                    0 0 0 0 0.5
                    0 0 0 0 0.5
                    0.6 0.6 0.6 0 0"
          />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${filterId})`} />
      </svg>
    </div>
  );
}

export default Grain;
