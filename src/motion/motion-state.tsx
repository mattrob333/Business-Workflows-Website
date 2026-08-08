'use client';

/**
 * Recipe `motion/state` — 01-design-system §4, meaning: *state changes*.
 *
 * Spec: colour/border crossfade 300ms + a single 1.02 scale pulse 250ms; chips flip
 * with a 180deg rotateX over 400ms.
 *
 * The pulse fires *once* per change, never on mount — a state change is news, and news
 * that repeats is noise. Reduced motion keeps the colour crossfade (it carries meaning:
 * grey to green *is* the information) and drops the pulse and the flip, substituting a
 * 200ms opacity crossfade for the chip.
 */

import {
  AnimatePresence,
  motion,
  useAnimationControls,
  type MotionStyle,
} from 'framer-motion';
import { useEffect, useRef, type ReactNode } from 'react';
import { DUR, EASE_EXPO_OUT, useReducedMotion } from '@/lib/motion-utils';

export interface StateShiftProps {
  /** Any value; a change to it is what fires the recipe. */
  state: string | number | boolean;
  /** Resolved CSS colour (token `var()`) for the current state. */
  color?: string;
  borderColor?: string;
  background?: string;
  children?: ReactNode;
  className?: string;
  style?: MotionStyle;
  /** Suppress the scale pulse (dense grids where 1.02 would collide). */
  pulse?: boolean;
}

/**
 * Crossfades colour/border/background over 300ms and pulses 1.02 for 250ms when
 * `state` changes.
 */
export function StateShift({
  state,
  color,
  borderColor,
  background,
  children,
  className = '',
  style,
  pulse = true,
}: StateShiftProps) {
  const reduced = useReducedMotion();
  const controls = useAnimationControls();
  const previous = useRef(state);

  useEffect(() => {
    if (previous.current === state) return;
    previous.current = state;
    if (reduced || !pulse) return;
    void controls.start({
      scale: [1, 1.02, 1],
      transition: { duration: DUR.pulse, ease: EASE_EXPO_OUT },
    });
  }, [state, controls, reduced, pulse]);

  return (
    <motion.div
      data-recipe="motion/state"
      data-state={String(state)}
      className={className}
      {...(style ? { style } : {})}
      animate={{
        ...(color !== undefined ? { color } : {}),
        ...(borderColor !== undefined ? { borderColor } : {}),
        ...(background !== undefined ? { backgroundColor: background } : {}),
      }}
      transition={{ duration: reduced ? DUR.reduced : DUR.state, ease: 'linear' }}
    >
      <motion.div animate={controls} style={{ transformOrigin: 'center' }}>
        {children}
      </motion.div>
    </motion.div>
  );
}

export interface ChipFlipProps {
  /** Changing this key flips the chip to reveal the new face. */
  flipKey: string | number;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * The 180deg rotateX chip flip (400ms). Used wherever a *label* changes meaning —
 * a status chip moving from `assumption` to `supported inference`, a gauge readout
 * changing units.
 */
export function ChipFlip({ flipKey, children, className = '', style }: ChipFlipProps) {
  const reduced = useReducedMotion();

  return (
    <span
      data-recipe="motion/state"
      data-flip="true"
      className={`relative inline-block ${className}`}
      style={{ perspective: 600, ...style }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={flipKey}
          className="inline-block"
          initial={reduced ? { opacity: 0 } : { rotateX: -90, opacity: 0 }}
          animate={reduced ? { opacity: 1 } : { rotateX: 0, opacity: 1 }}
          exit={reduced ? { opacity: 0 } : { rotateX: 90, opacity: 0 }}
          transition={{
            duration: reduced ? DUR.reduced : DUR.flip / 2,
            ease: reduced ? 'linear' : EASE_EXPO_OUT,
          }}
          style={{ transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
        >
          {children}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export interface ContradictionPulseProps {
  /** Fire the single contradiction pulse when this becomes true. */
  active: boolean;
  children: ReactNode;
  className?: string;
  style?: MotionStyle;
}

/**
 * The one-shot contradiction flash (01 §5, BMC: "a contradiction pulses
 * `--contradiction` once"). Rare by design — Ruling 2's palette grammar spends red
 * sparingly so that it still means something.
 */
export function ContradictionPulse({
  active,
  children,
  className = '',
  style,
}: ContradictionPulseProps) {
  const reduced = useReducedMotion();
  const controls = useAnimationControls();
  const fired = useRef(false);

  useEffect(() => {
    if (!active || fired.current) return;
    fired.current = true;
    if (reduced) return;
    void controls.start({
      boxShadow: [
        '0 0 0 0 color-mix(in srgb, var(--contradiction) 0%, transparent)',
        '0 0 0 6px color-mix(in srgb, var(--contradiction) 26%, transparent)',
        '0 0 0 0 color-mix(in srgb, var(--contradiction) 0%, transparent)',
      ],
      transition: { duration: DUR.state * 2, ease: EASE_EXPO_OUT },
    });
  }, [active, controls, reduced]);

  return (
    <motion.div
      data-recipe="motion/state"
      data-contradiction={active ? 'true' : 'false'}
      animate={controls}
      className={className}
      {...(style ? { style } : {})}
    >
      {children}
    </motion.div>
  );
}

export default StateShift;
