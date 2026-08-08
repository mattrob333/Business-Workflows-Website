'use client';

/**
 * Recipe `panel/glass` — 01-design-system §2, layer 2.
 *
 * Spec: `background: rgba(29,29,27,.66); backdrop-filter: blur(14px); border: 1px solid
 * var(--line)`. The literal rgba in the doc is the value of `--surface` at 66%; it is
 * expressed here as `color-mix(in srgb, var(--surface) 66%, transparent)` so the token
 * remains the single source of colour (02-architecture: "no raw hex in components").
 *
 * This module is the *visual primitive*. `components/GlassPanel` is the ergonomic
 * wrapper around it (padding scale, elevation, the serif-over-data overhang); recipes
 * that need glass inside an SVG-adjacent layout use `panelGlassStyle()` directly.
 */

import { motion, type HTMLMotionProps, type MotionStyle } from 'framer-motion';
import { forwardRef } from 'react';
import { DUR, EASE_EXPO_OUT, useReducedMotion } from '@/lib/motion-utils';

export type GlassTone = 'surface' | 'raised' | 'void';

const TONE: Record<GlassTone, string> = {
  surface: 'color-mix(in srgb, var(--surface) 66%, transparent)',
  raised: 'color-mix(in srgb, var(--raised) 72%, transparent)',
  void: 'color-mix(in srgb, var(--void) 62%, transparent)',
};

export interface PanelGlassStyleOptions {
  tone?: GlassTone;
  /** Backdrop blur in px. Spec default 14. */
  blur?: number;
  /** `true` adds the spec'd two-stop drop shadow (`--shadow`). */
  elevated?: boolean;
  /** Border colour token name; `line-strong` marks an active/selected panel. */
  border?: 'line' | 'line-strong' | 'flow';
}

const BORDER: Record<NonNullable<PanelGlassStyleOptions['border']>, string> = {
  line: 'var(--line)',
  'line-strong': 'var(--line-strong)',
  flow: 'color-mix(in srgb, var(--flow) 55%, transparent)',
};

/** The raw recipe, as a style object — for SVG-adjacent or measured layouts. */
export function panelGlassStyle({
  tone = 'surface',
  blur = 14,
  elevated = false,
  border = 'line',
}: PanelGlassStyleOptions = {}): React.CSSProperties {
  return {
    background: TONE[tone],
    backdropFilter: `blur(${blur}px)`,
    WebkitBackdropFilter: `blur(${blur}px)`,
    border: `1px solid ${BORDER[border]}`,
    boxShadow: elevated ? 'var(--shadow)' : undefined,
  };
}

export interface PanelGlassProps
  extends Omit<HTMLMotionProps<'div'>, 'children'>,
    PanelGlassStyleOptions {
  children?: React.ReactNode;
  /**
   * motion/route's destination lift: the panel rises 2px and gains `--shadow` when the
   * work arrives. Under reduced motion the lift becomes a shadow crossfade only.
   */
  lifted?: boolean;
}

export const PanelGlass = forwardRef<HTMLDivElement, PanelGlassProps>(function PanelGlass(
  { children, tone, blur, elevated, border, lifted = false, style, className = '', ...rest },
  ref,
) {
  const reduced = useReducedMotion();
  const base = panelGlassStyle({
    ...(tone !== undefined ? { tone } : {}),
    ...(blur !== undefined ? { blur } : {}),
    ...(elevated !== undefined ? { elevated } : {}),
    ...(border !== undefined ? { border } : {}),
  });

  return (
    <motion.div
      ref={ref}
      data-recipe="panel/glass"
      data-lifted={lifted ? 'true' : 'false'}
      className={`rounded-lg ${className}`}
      style={{ ...base, ...style } as MotionStyle}
      animate={{
        y: lifted && !reduced ? -2 : 0,
        boxShadow: lifted || elevated ? 'var(--shadow)' : '0 0 0 rgba(0,0,0,0)',
      }}
      transition={{
        duration: reduced ? DUR.reduced : DUR.state,
        ease: reduced ? 'linear' : EASE_EXPO_OUT,
      }}
      {...rest}
    >
      {children}
    </motion.div>
  );
});

export default PanelGlass;
