'use client';

/**
 * `GlassPanel` — 01-design-system §6; the ergonomic wrapper around the `panel/glass`
 * recipe (`src/motion/panel-glass`).
 *
 * The recipe owns the *look* (tone, blur, border, the lift). This owns the *use*: a
 * padding scale, an optional mono eyebrow, and `overhang` — the signature move from
 * §3, where a display headline overlaps the top of the panel by ~0.5em. Keeping the
 * overhang here (rather than leaving each page to invent negative margins) is what
 * makes "serif over data" a system feature instead of a one-off.
 */

import type { ReactNode } from 'react';
import { PanelGlass, type PanelGlassProps } from '@/motion/panel-glass';
import { MONO_LABEL } from './styles';

export type PanelPad = 'none' | 'sm' | 'md' | 'lg';

const PAD: Record<PanelPad, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-7 sm:p-8',
};

export interface GlassPanelProps extends Omit<PanelGlassProps, 'children'> {
  children?: ReactNode;
  pad?: PanelPad;
  /** Mono eyebrow printed inside the panel's top-left. */
  eyebrow?: string;
  /**
   * Room at the top for a display headline to overlap into (§3's `type/serif-over-data`).
   * Use at most once per screenful.
   */
  overhang?: boolean;
}

export function GlassPanel({
  children,
  pad = 'md',
  eyebrow,
  overhang = false,
  className = '',
  ...rest
}: GlassPanelProps) {
  return (
    <PanelGlass
      data-component="glass-panel"
      className={`${PAD[pad]} ${overhang ? 'pt-10 sm:pt-12' : ''} ${className}`}
      {...rest}
    >
      {eyebrow ? (
        <div
          className={`${MONO_LABEL} mb-3 text-[10px]`}
          style={{ color: 'var(--faint)' }}
        >
          {eyebrow}
        </div>
      ) : null}
      {children}
    </PanelGlass>
  );
}

export default GlassPanel;
