'use client';

/**
 * ACT V's loop — observe → model → diagnose → prioritize → delegate → measure → ↺.
 *
 * 03-content-spec names the diagram; 01-design-system has no recipe for a ring, so it is
 * built from the two that apply: `motion/transform`'s stroke-dashoffset draw lays the
 * ring down, and `motion/route`'s six-pixel flow dot travels it at a constant rate — the
 * one easing in the system that means *in transit, nothing happening to it yet*, which is
 * exactly what a loop between runs is.
 *
 * Hand-built SVG, stroke-first, one authored geometry: six stations on a circle, labels
 * placed radially, and the return glyph in the middle. No physics, no layout engine — the
 * same argument `components/graph-layout` makes about seventeen nodes applies twice over
 * to six.
 *
 * The stations light in order as the act scrubs, so the visitor watches the loop close
 * over the story they have just read: the notes under each label name what happened in
 * ACTs I through IV.
 *
 * Reduced motion: the ring renders drawn, the dot rests at the top of the circle, every
 * station is lit and every note readable. The picture is complete; only the lap is gone.
 */

import { motion } from 'framer-motion';
import { DUR, EASE_EXPO_OUT, usePathSlots, useReducedMotion } from '@/lib/motion-utils';
import { useStage } from '@/motion/acts';
import { DrawPath } from '@/motion/motion-transform';
import { RouteDot } from '@/motion/motion-route';
import type { LoopStation } from './data';

/**
 * The viewBox is cropped tight to the drawing — ring, labels and notes — rather than
 * padded out to a comfortable square. The ring shares its act with the sentence it
 * illustrates, so every unit of empty viewBox is a unit of ring the visitor does not get.
 */
const VB_W = 620;
const VB_H = 460;
const CX = 310;
const CY = 225;
const R = 150;
/** Radial distance to the label baseline. Notes sit fifteen units under their label. */
const LABEL_R = R + 28;

/** Two half arcs rather than one: a single arc command cannot close a full circle. */
const RING = `M ${CX} ${CY - R} A ${R} ${R} 0 1 1 ${CX} ${CY + R} A ${R} ${R} 0 1 1 ${CX} ${CY - R}`;

function anchorFor(cos: number): 'start' | 'middle' | 'end' {
  if (Math.abs(cos) < 0.2) return 'middle';
  return cos > 0 ? 'start' : 'end';
}

export interface LoopDiagramProps {
  stations: readonly LoopStation[];
  className?: string;
}

export function LoopDiagram({ stations, className = '' }: LoopDiagramProps) {
  const reduced = useReducedMotion();
  const { paths, setPath } = usePathSlots(1);
  /** One step per station, plus the closed lap. */
  const { step, ref } = useStage(stations.length + 1);

  const placed = stations.map((station, i) => {
    const angle = ((-90 + (360 / stations.length) * i) * Math.PI) / 180;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      station,
      dot: { x: CX + R * cos, y: CY + R * sin },
      label: { x: CX + LABEL_R * cos, y: CY + LABEL_R * sin },
      anchor: anchorFor(cos),
    };
  });

  return (
    <div ref={ref} data-testid="loop-diagram" data-step={step} className={className}>
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="mx-auto w-full"
        role="img"
        aria-label={`The loop: ${stations
          .map((s) => `${s.label} — ${s.note}`)
          .join(', then ')}, and back to ${stations[0]?.label ?? 'the start'}.`}
      >
        <DrawPath
          ref={setPath[0]}
          d={RING}
          active
          duration={DUR.draw * 1.5}
          stroke="var(--line-strong)"
        />
        <RouteDot path={paths[0] ?? null} active repeat duration={DUR.route * 6} />

        {placed.map(({ station, dot, label, anchor }, i) => {
          const lit = step > i;
          return (
            <g key={station.id} data-station={station.id} data-lit={lit ? 'true' : 'false'}>
              <motion.circle
                cx={dot.x}
                cy={dot.y}
                r={7}
                fill={lit ? 'var(--flow)' : 'var(--surface)'}
                stroke={lit ? 'var(--flow)' : 'var(--line-strong)'}
                strokeWidth={1.5}
                vectorEffect="non-scaling-stroke"
                initial={false}
                animate={{ scale: lit && !reduced ? [1, 1.02, 1] : 1 }}
                transition={{ duration: DUR.pulse, ease: EASE_EXPO_OUT }}
                style={{ transformOrigin: `${dot.x}px ${dot.y}px` }}
              />
              <text
                x={label.x}
                y={label.y}
                textAnchor={anchor}
                className="font-system"
                fontSize={12}
                letterSpacing="0.12em"
                fill={lit ? 'var(--ink)' : 'var(--faint)'}
              >
                {station.label.toUpperCase()}
              </text>
              <text
                x={label.x}
                y={label.y + 15}
                textAnchor={anchor}
                className="font-system"
                fontSize={10}
                fill="var(--faint)"
              >
                {station.note}
              </text>
            </g>
          );
        })}

        {/* The return. The glyph 03-content-spec asks for, set in the system voice. */}
        <text
          x={CX}
          y={CY - 4}
          textAnchor="middle"
          className="font-system"
          fontSize={44}
          fill={step >= stations.length ? 'var(--flow)' : 'var(--line-strong)'}
        >
          ↺
        </text>
        <text
          x={CX}
          y={CY + 30}
          textAnchor="middle"
          className="font-system"
          fontSize={10}
          letterSpacing="0.14em"
          fill="var(--faint)"
        >
          AND AGAIN
        </text>
      </svg>
    </div>
  );
}

export default LoopDiagram;
