'use client';

/**
 * Recipe `fw/forces-gauges` — 01-design-system §5.
 *
 * Spec: the company as a glass panel at centre; five arrows as tapered SVG wedges
 * pointing inward, length and opacity bound to force score (0–10). Scrubbing an
 * assumption slider re-tweens lengths over 500ms with a spring (`stiffness 120,
 * damping 20`). PESTLE variant: slow orbiting weather glyphs at the perimeter
 * (atmosphere layer, 40s orbit).
 *
 * The wedges point *inward* on purpose — Porter's five forces are pressures applied to
 * the firm, and an outward-pointing arrow would quietly reverse the model's meaning.
 *
 * The sliders are labelled "assumption", not "score", and each carries a `StatusChip`
 * upstream in the page: a force rating is an assumption until an evidence pack says
 * otherwise (Ruling 4). Scrubbing one is the visitor performing a sensitivity test,
 * which is the entire lesson of the recipe.
 *
 * Reduced motion: wedges render at their final geometry, the spring is replaced by a
 * 200ms linear settle (dragging a slider must still visibly do something), and the
 * PESTLE orbit holds a fixed, evenly spaced position.
 */

import { motion, useMotionValueEvent, useSpring } from 'framer-motion';
import { useEffect, useState } from 'react';
import { DUR, FORCE_SPRING, useReducedMotion, useSvgId } from '@/lib/motion-utils';
import { useStage } from './acts';
import { FOCUS_RING } from '@/components/styles';

/* ------------------------------------------------------------------- types */

export interface Force {
  id: string;
  label: string;
  /** 0–10. Higher = more pressure on the firm. */
  score: number;
  /** One line of why, shown under the slider. */
  note?: string;
}

export interface ForcesGaugesProps {
  company: string;
  /** Exactly five reads best; the layout tolerates 3–6. */
  forces: Force[];
  /** Let the visitor scrub the assumptions. */
  interactive?: boolean;
  /** PESTLE variant: slow orbiting perimeter glyphs. */
  orbit?: boolean;
  className?: string;
}

/* ------------------------------------------------------------------ layout */

/**
 * The viewBox is wider than it is tall on purpose: the force labels are set horizontally
 * outside the ring, and a square box clipped "SUPPLIER POWER" to "SUPPLIER POWEI".
 * `LABEL_PAD` is the room reserved for the longest of them.
 */
const VB_W = 640;
const VB_H = 500;
const CX = VB_W / 2;
const CY = VB_H / 2;
/** Where a wedge tip stops — just off the centre panel. */
const TIP_R = 96;
const MIN_R = 112;
const MAX_R = 196;
const LABEL_R = MAX_R + 16;

function polar(r: number, deg: number): [number, number] {
  const rad = ((deg - 90) * Math.PI) / 180;
  return [CX + r * Math.cos(rad), CY + r * Math.sin(rad)];
}

/**
 * A tapered wedge: a narrow throat at the tip that opens toward the rim, with a concave
 * back edge. A plain pie slice reads as a proportion; this reads as pressure arriving.
 */
function wedgePath(angle: number, score: number): string {
  const clamped = Math.min(10, Math.max(0, score));
  const outer = MIN_R + (clamped / 10) * (MAX_R - MIN_R);
  const halfWidth = 4 + (clamped / 10) * 7;
  const [tx, ty] = polar(TIP_R, angle);
  const [nx, ny] = polar(TIP_R + 26, angle - halfWidth * 0.35);
  const [px, py] = polar(TIP_R + 26, angle + halfWidth * 0.35);
  const [ax, ay] = polar(outer, angle - halfWidth);
  const [bx, by] = polar(outer, angle + halfWidth);
  const [mx, my] = polar(outer + 10, angle);
  const f = (n: number) => n.toFixed(1);
  return [
    `M ${f(tx)} ${f(ty)}`,
    `C ${f(nx)} ${f(ny)}, ${f(ax)} ${f(ay)}, ${f(ax)} ${f(ay)}`,
    `Q ${f(mx)} ${f(my)} ${f(bx)} ${f(by)}`,
    `C ${f(bx)} ${f(by)}, ${f(px)} ${f(py)}, ${f(tx)} ${f(ty)}`,
    'Z',
  ].join(' ');
}

/** Anchor a horizontal label so it never runs back over the ring. */
function labelAnchor(x: number): 'start' | 'middle' | 'end' {
  if (x < CX - 20) return 'end';
  if (x > CX + 20) return 'start';
  return 'middle';
}

/* -------------------------------------------------------------- one wedge */

interface WedgeProps {
  angle: number;
  score: number;
  label: string;
  active: boolean;
  reduced: boolean;
  highlighted: boolean;
}

/**
 * Each wedge owns its own spring so a single slider re-tweens one shape at 60fps
 * without re-rendering the other four.
 */
function ForceWedge({ angle, score, label, active, reduced, highlighted }: WedgeProps) {
  const target = active ? score : 0;
  const spring = useSpring(target, reduced ? { duration: DUR.reduced * 1000 } : FORCE_SPRING);
  const [rendered, setRendered] = useState(target);

  useEffect(() => {
    spring.set(target);
  }, [target, spring]);

  useMotionValueEvent(spring, 'change', (v) => setRendered(v));
  useEffect(() => {
    if (reduced) setRendered(target);
  }, [reduced, target]);

  const shown = Math.max(0, rendered);
  const opacity = 0.28 + (Math.min(10, shown) / 10) * 0.55;
  const [lx, ly] = polar(LABEL_R, angle);
  const anchor = labelAnchor(lx);
  const stack = Math.abs(ly - CY) > 120;

  return (
    <g data-force={label} data-score={score.toFixed(1)}>
      <path
        d={wedgePath(angle, shown)}
        fill={highlighted ? 'var(--flow)' : 'var(--flow-deep)'}
        opacity={opacity}
        stroke={highlighted ? 'var(--flow)' : 'none'}
        strokeWidth={highlighted ? 1 : 0}
        vectorEffect="non-scaling-stroke"
      />
      <text
        x={lx}
        y={stack ? ly : ly - 6}
        textAnchor={anchor}
        dominantBaseline="middle"
        className="font-system"
        fontSize={10}
        letterSpacing="0.12em"
        fill={highlighted ? 'var(--ink)' : 'var(--muted)'}
      >
        {label.toUpperCase()}
      </text>
      <text
        x={lx}
        y={stack ? ly + 14 : ly + 8}
        textAnchor={anchor}
        dominantBaseline="middle"
        className="font-system tabular-nums"
        fontSize={11}
        fill={highlighted ? 'var(--flow)' : 'var(--faint)'}
      >
        {shown.toFixed(1)}
      </text>
    </g>
  );
}

/* ---------------------------------------------------------- orbit (PESTLE) */

function OrbitGlyphs({ reduced }: { reduced: boolean }) {
  const glyphs = ['P', 'E', 'S', 'T', 'L', 'E'];
  return (
    <motion.g
      aria-hidden="true"
      style={{ transformOrigin: `${CX}px ${CY}px` }}
      {...(reduced
        ? {}
        : {
            animate: { rotate: 360 },
            transition: { duration: DUR.orbit, ease: 'linear' as const, repeat: Infinity },
          })}
    >
      {glyphs.map((g, i) => {
        const [x, y] = polar(MAX_R + 4, (360 / glyphs.length) * i);
        return (
          <g key={`${g}-${i}`}>
            <circle
              cx={x}
              cy={y}
              r={11}
              fill="none"
              stroke="var(--line-strong)"
              strokeWidth={1.5}
              vectorEffect="non-scaling-stroke"
              opacity={0.7}
            />
            <text
              x={x}
              y={y + 3.5}
              textAnchor="middle"
              className="font-system"
              fontSize={9}
              fill="var(--faint)"
            >
              {g}
            </text>
          </g>
        );
      })}
    </motion.g>
  );
}

/* --------------------------------------------------------------- component */

export function ForcesGauges({
  company,
  forces,
  interactive = true,
  orbit = false,
  className = '',
}: ForcesGaugesProps) {
  const reduced = useReducedMotion();
  const ringId = useSvgId('forcering');
  /** One step per force arriving, plus the settled reading. */
  const { step, ref } = useStage(forces.length + 1);
  const [scores, setScores] = useState<Record<string, number>>(() =>
    Object.fromEntries(forces.map((f) => [f.id, f.score])),
  );
  const [focusId, setFocusId] = useState<string | null>(null);

  const values = forces.map((f) => scores[f.id] ?? f.score);
  const overall = values.length
    ? values.reduce((a, b) => a + b, 0) / values.length
    : 0;
  const dominant = forces.reduce<{ label: string; score: number }>(
    (best, f) => {
      const v = scores[f.id] ?? f.score;
      return v > best.score ? { label: f.label, score: v } : best;
    },
    { label: '—', score: -1 },
  );

  return (
    <div
      ref={ref}
      data-recipe="fw/forces-gauges"
      data-step={step}
      className={`grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center ${className}`}
    >
      <div className="relative mx-auto w-full max-w-[560px]">
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="w-full"
          role="img"
          aria-label={`Five forces acting on ${company}. ${forces
            .map((f) => `${f.label} ${(scores[f.id] ?? f.score).toFixed(1)} out of 10`)
            .join('. ')}`}
        >
          <defs>
            <radialGradient id={ringId}>
              <stop offset="60%" stopColor="var(--flow-deep)" stopOpacity="0" />
              <stop offset="100%" stopColor="var(--flow-deep)" stopOpacity="0.22" />
            </radialGradient>
          </defs>

          <circle cx={CX} cy={CY} r={MAX_R} fill={`url(#${ringId})`} opacity={0.7} />
          <circle
            cx={CX}
            cy={CY}
            r={MAX_R}
            fill="none"
            stroke="var(--line)"
            strokeWidth={1.5}
            strokeDasharray="1 9"
            vectorEffect="non-scaling-stroke"
            opacity={0.8}
          />
          <circle
            cx={CX}
            cy={CY}
            r={MIN_R}
            fill="none"
            stroke="var(--line)"
            strokeWidth={1.5}
            strokeDasharray="1 9"
            vectorEffect="non-scaling-stroke"
            opacity={0.5}
          />

          {orbit ? <OrbitGlyphs reduced={reduced} /> : null}

          {forces.map((f, i) => (
            <ForceWedge
              key={f.id}
              angle={(360 / forces.length) * i}
              score={scores[f.id] ?? f.score}
              label={f.label}
              active={step >= i}
              reduced={reduced}
              highlighted={focusId === f.id}
            />
          ))}

          {/* Centre: the firm under pressure. */}
          <rect
            x={CX - TIP_R + 4}
            y={CY - 48}
            width={(TIP_R - 4) * 2}
            height={96}
            rx={8}
            fill="color-mix(in srgb, var(--surface) 94%, transparent)"
            stroke="var(--line-strong)"
            strokeWidth={1.5}
            vectorEffect="non-scaling-stroke"
          />
          <text
            x={CX}
            y={CY - 20}
            textAnchor="middle"
            className="font-system"
            fontSize={9}
            letterSpacing="0.16em"
            fill="var(--faint)"
          >
            THE FIRM
          </text>
          <text
            x={CX}
            y={CY + 2}
            textAnchor="middle"
            className="font-narrative"
            fontSize={20}
            fill="var(--ink)"
          >
            {company}
          </text>
          <text
            x={CX}
            y={CY + 26}
            textAnchor="middle"
            className="font-system tabular-nums"
            fontSize={10}
            letterSpacing="0.1em"
            fill="var(--muted)"
          >
            {`PRESSURE ${overall.toFixed(1)} / 10`}
          </text>
        </svg>
      </div>

      <div>
        <div
          className="font-system text-[10px] uppercase"
          style={{ letterSpacing: '.14em', color: 'var(--faint)' }}
        >
          assumption sliders
        </div>
        <p className="mt-2 max-w-[46ch] text-[13px]" style={{ color: 'var(--muted)' }}>
          Every score below is an assumption until the evidence pack says otherwise. Move
          one and watch which force actually decides the shape.
        </p>

        <div className="mt-4 grid gap-3">
          {forces.map((f) => {
            const value = scores[f.id] ?? f.score;
            return (
              <div key={f.id}>
                <div className="flex items-baseline justify-between gap-3">
                  <label
                    htmlFor={`force-${f.id}`}
                    className="font-system text-[11px] uppercase"
                    style={{ letterSpacing: '.1em', color: 'var(--ink)' }}
                  >
                    {f.label}
                  </label>
                  <span
                    className="font-system text-[11px] tabular-nums"
                    style={{ color: 'var(--flow)' }}
                  >
                    {value.toFixed(1)}
                  </span>
                </div>
                <input
                  id={`force-${f.id}`}
                  type="range"
                  min={0}
                  max={10}
                  step={0.5}
                  value={value}
                  disabled={!interactive}
                  onChange={(e) =>
                    setScores((prev) => ({ ...prev, [f.id]: Number(e.target.value) }))
                  }
                  onFocus={() => setFocusId(f.id)}
                  onBlur={() => setFocusId(null)}
                  onPointerEnter={() => setFocusId(f.id)}
                  onPointerLeave={() => setFocusId(null)}
                  className={`${FOCUS_RING} mt-2 h-1 w-full cursor-pointer appearance-none rounded-full disabled:cursor-not-allowed`}
                  style={{
                    background: `linear-gradient(90deg, var(--flow) 0%, var(--flow) ${value * 10}%, var(--line) ${value * 10}%, var(--line) 100%)`,
                  }}
                />
                {f.note ? (
                  <p className="mt-1 text-[12px]" style={{ color: 'var(--faint)' }}>
                    {f.note}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>

        <p
          className="font-system mt-4 border-t pt-3 text-[11px]"
          style={{ borderColor: 'var(--line)', color: 'var(--muted)' }}
          aria-live="polite"
        >
          strongest force ·{' '}
          <span style={{ color: 'var(--ink)' }}>{dominant.label.toLowerCase()}</span>{' '}
          <span style={{ color: 'var(--faint)' }}>
            ({dominant.score.toFixed(1)})
          </span>
        </p>
      </div>
    </div>
  );
}

export default ForcesGauges;
