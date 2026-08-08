'use client';

/**
 * Recipe `atmo/mesh-drift` — 01-design-system §2, layer 1.
 *
 * A mesh-gradient field built from soft, heavily blurred colour blobs over `--void`.
 * Legal hues are `--flow-deep`, `--flow` and the warm neutrals, at 4–10% opacity.
 * Blobs drift at <= 8px amplitude over >= 20s: felt, not seen.
 *
 * THE AMBER LAW. This file deliberately cannot name the amber token, because a shared
 * atmosphere component is not a constraint surface and must not be able to leak amber
 * into a section that has not earned it. A constraint surface (currently only
 * `fw-toc-flow`, which carries the `amber-law` pragma) opts in by *injecting* its own
 * colour through the `constraint` prop, passing the token as a plain CSS value. The
 * token reference therefore stays inside the pragma'd file and `lint-tokens` stays the
 * enforcer rather than the reviewer.
 */

import { motion } from 'framer-motion';
import { DRIFT_AMPLITUDE, DUR, EASE_DRIFT, prng, useReducedMotion } from '@/lib/motion-utils';

/** The only hues an atmosphere layer may use (01 §2). */
export type AtmoHue = 'flow-deep' | 'flow' | 'raised' | 'line-strong' | 'surface';

const HUE_VAR: Record<AtmoHue, string> = {
  'flow-deep': 'var(--flow-deep)',
  flow: 'var(--flow)',
  raised: 'var(--raised)',
  'line-strong': 'var(--line-strong)',
  surface: 'var(--surface)',
};

/**
 * Constraint opt-in. `false` (the default) means "this is not a constraint surface".
 * The object form is only constructible by a file that can name the amber token, which
 * is exactly the restriction the amber law asks for.
 */
export type AtmoConstraint = false | { color: string; /** 0–1, defaults to .10 */ intensity?: number };

export interface AtmoMeshDriftProps {
  /** Hue rotation for the blobs. Defaults to the house field. */
  hues?: AtmoHue[];
  /** Blob opacity ceiling, 0.04–0.10 per spec. */
  intensity?: number;
  /** Number of blobs. 3–5 reads as a field; more reads as noise. */
  count?: number;
  /** Deterministic layout seed — same seed, same field, every render and on the server. */
  seed?: number;
  /** Constraint surfaces only. See the amber-law note above. */
  constraint?: AtmoConstraint;
  className?: string;
}

interface Blob {
  hue: string;
  top: number;
  left: number;
  size: number;
  opacity: number;
  dx: number;
  dy: number;
  duration: number;
  delay: number;
}

export function AtmoMeshDrift({
  hues = ['flow-deep', 'raised', 'flow', 'line-strong'],
  intensity = 0.08,
  count = 4,
  seed = 7,
  constraint = false,
  className = '',
}: AtmoMeshDriftProps) {
  const reduced = useReducedMotion();
  const rand = prng(seed);
  const palette = hues.length > 0 ? hues : (['flow-deep'] as AtmoHue[]);
  const cap = Math.min(0.1, Math.max(0.04, intensity));

  const blobs: Blob[] = Array.from({ length: count }, (_, i) => {
    const hueKey = palette[i % palette.length] ?? 'flow-deep';
    const a = rand();
    const b = rand();
    const c = rand();
    const d = rand();
    return {
      hue: HUE_VAR[hueKey],
      top: 8 + a * 64,
      left: 4 + b * 78,
      size: 34 + c * 34,
      opacity: cap * (0.6 + d * 0.4),
      dx: (rand() * 2 - 1) * DRIFT_AMPLITUDE,
      dy: (rand() * 2 - 1) * DRIFT_AMPLITUDE,
      duration: DUR.drift + rand() * 12,
      delay: -rand() * DUR.drift,
    };
  });

  if (constraint) {
    blobs.push({
      hue: constraint.color,
      top: 30,
      left: 42,
      size: 40,
      opacity: constraint.intensity ?? 0.1,
      dx: DRIFT_AMPLITUDE * 0.5,
      dy: -DRIFT_AMPLITUDE * 0.5,
      duration: DUR.drift + 6,
      delay: -4,
    });
  }

  return (
    <div
      aria-hidden="true"
      data-recipe="atmo/mesh-drift"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {blobs.map((blob, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            top: `${blob.top}%`,
            left: `${blob.left}%`,
            width: `${blob.size}%`,
            aspectRatio: '1.35 / 1',
            background: blob.hue,
            opacity: blob.opacity,
            filter: 'blur(72px)',
            willChange: reduced ? 'auto' : 'transform',
          }}
          {...(reduced
            ? {}
            : {
                animate: {
                  x: [0, blob.dx, blob.dx * -0.6, 0],
                  y: [0, blob.dy, blob.dy * 0.4, 0],
                },
                transition: {
                  duration: blob.duration,
                  ease: EASE_DRIFT,
                  repeat: Infinity,
                  repeatType: 'loop' as const,
                  delay: blob.delay,
                },
              })}
        />
      ))}
    </div>
  );
}

export default AtmoMeshDrift;
