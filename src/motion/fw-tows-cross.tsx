'use client';

/**
 * Recipe `fw/tows-cross` — 01-design-system §5.
 *
 * Spec: four quadrant stacks; on scroll, an S-card and an O-card physically slide
 * toward each other and *cross* — at the intersection a new strategy-option card is
 * minted (`motion/transform`), stamped SO / ST / WO / WT in mono. "The mint moment is
 * the teaching moment: SWOT gathers, TOWS generates."
 *
 * The whole recipe exists to kill the most common misuse of SWOT — treating the four
 * lists as the deliverable. So the layout deliberately puts *nothing* in the middle at
 * rest: an empty, dashed mint zone that stays visibly empty until two cards collide in
 * it. The quadrants are the ingredients; the centre is the output.
 *
 * Reduced motion: every option is already minted in the centre stack, and the source
 * cards that produced the currently-read option keep their `--flow` borders, so the
 * pairing is still legible without anything moving.
 */

import { AnimatePresence, motion } from 'framer-motion';
import { DUR, EASE_EXPO_OUT, useReducedMotion } from '@/lib/motion-utils';
import { MONO_LABEL } from '@/components/styles';
import { useStage } from './acts';

/* ------------------------------------------------------------------- types */

export type TowsKind = 'SO' | 'ST' | 'WO' | 'WT';

export interface TowsCard {
  id: string;
  text: string;
}

export interface TowsCrossing {
  id: string;
  kind: TowsKind;
  /** id from strengths or weaknesses. */
  internal: string;
  /** id from opportunities or threats. */
  external: string;
  /** The strategy the pairing generates. */
  option: string;
}

export interface TowsCrossProps {
  strengths: TowsCard[];
  weaknesses: TowsCard[];
  opportunities: TowsCard[];
  threats: TowsCard[];
  crossings: TowsCrossing[];
  className?: string;
}

const KIND_GLOSS: Record<TowsKind, string> = {
  SO: 'strength × opportunity — press the advantage',
  ST: 'strength × threat — defend with what you have',
  WO: 'weakness × opportunity — fix to compete',
  WT: 'weakness × threat — contain the damage',
};

/* ------------------------------------------------------------------- parts */

function Quadrant({
  label,
  cards,
  highlight,
  align,
}: {
  label: string;
  cards: TowsCard[];
  highlight: string | null;
  align: 'left' | 'right';
}) {
  return (
    <div>
      <div
        className={`${MONO_LABEL} text-[9px] ${align === 'right' ? 'text-right' : ''}`}
        style={{ color: 'var(--faint)' }}
      >
        {label}
      </div>
      <div className="mt-2 grid gap-[6px]">
        {cards.map((card) => {
          const on = highlight === card.id;
          return (
            <motion.div
              key={card.id}
              data-card={card.id}
              className="rounded-md border px-[10px] py-[7px] text-[12px] leading-snug"
              animate={{
                borderColor: on
                  ? 'color-mix(in srgb, var(--flow) 60%, transparent)'
                  : 'var(--line)',
                color: on ? 'var(--ink)' : 'var(--muted)',
              }}
              transition={{ duration: DUR.state, ease: 'linear' }}
              style={{
                background: 'color-mix(in srgb, var(--surface) 62%, transparent)',
                backdropFilter: 'blur(14px)',
              }}
            >
              {card.text}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- component */

export function TowsCross({
  strengths,
  weaknesses,
  opportunities,
  threats,
  crossings,
  className = '',
}: TowsCrossProps) {
  const reduced = useReducedMotion();
  /** gather, one mint per crossing, settled. */
  const { step, ref } = useStage(crossings.length + 2);

  const minted = Math.min(crossings.length, Math.max(0, step - 1));
  const activeIndex = step >= 1 && step - 1 < crossings.length ? step - 1 : -1;
  const active = activeIndex >= 0 ? crossings[activeIndex] : undefined;

  const all = [...strengths, ...weaknesses, ...opportunities, ...threats];
  const findText = (id: string) => all.find((c) => c.id === id)?.text ?? id;

  return (
    <div
      ref={ref}
      data-recipe="fw/tows-cross"
      data-step={step}
      data-minted={minted}
      className={`grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(230px,1.15fr)_minmax(0,1fr)] ${className}`}
    >
      <div className="grid gap-5">
        <Quadrant
          label="strengths"
          cards={strengths}
          highlight={active?.internal ?? null}
          align="left"
        />
        <Quadrant
          label="weaknesses"
          cards={weaknesses}
          highlight={active?.internal ?? null}
          align="left"
        />
      </div>

      {/* The mint zone. Empty by design until two cards collide inside it. */}
      <div className="relative flex min-h-[260px] flex-col">
        <div
          className={`${MONO_LABEL} text-center text-[9px]`}
          style={{ color: minted > 0 ? 'var(--flow)' : 'var(--faint)' }}
        >
          tows · generated options
        </div>

        <div
          className="relative mt-2 flex-1 rounded-lg p-3"
          style={{
            border: `1px dashed ${minted > 0 ? 'color-mix(in srgb, var(--flow) 35%, transparent)' : 'var(--line)'}`,
            background:
              minted > 0
                ? 'color-mix(in srgb, var(--flow-deep) 7%, transparent)'
                : 'transparent',
          }}
        >
          {minted === 0 ? (
            <p
              className="mt-6 text-center text-[12px] leading-relaxed"
              style={{ color: 'var(--faint)' }}
            >
              SWOT gathers.
              <br />
              Nothing has been generated yet.
            </p>
          ) : null}

          <div className="grid gap-2">
            <AnimatePresence initial={false}>
              {crossings.slice(0, minted).map((c) => (
                <motion.div
                  key={c.id}
                  layout={!reduced}
                  data-minted={c.kind}
                  initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{
                    duration: reduced ? DUR.reduced : DUR.ingest,
                    ease: reduced ? 'linear' : EASE_EXPO_OUT,
                  }}
                  className="rounded-md border p-[10px]"
                  style={{
                    borderColor: 'color-mix(in srgb, var(--flow) 40%, transparent)',
                    background: 'color-mix(in srgb, var(--raised) 82%, transparent)',
                    backdropFilter: 'blur(14px)',
                    boxShadow: 'var(--shadow)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`${MONO_LABEL} rounded-[3px] border px-[5px] py-[2px] text-[9px]`}
                      style={{
                        color: 'var(--flow)',
                        borderColor: 'color-mix(in srgb, var(--flow) 45%, transparent)',
                      }}
                    >
                      {c.kind}
                    </span>
                    <span className="text-[10px]" style={{ color: 'var(--faint)' }}>
                      {KIND_GLOSS[c.kind]}
                    </span>
                  </div>
                  <p className="mt-[6px] text-[13px] leading-snug" style={{ color: 'var(--ink)' }}>
                    {c.option}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* The crossing itself: two cards travel in from opposite sides and meet. */}
          <AnimatePresence>
            {active && !reduced ? (
              <div
                key={active.id}
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2"
              >
                {[
                  { text: findText(active.internal), from: -1 },
                  { text: findText(active.external), from: 1 },
                ].map((t, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: `${t.from * 150}%`, opacity: 0 }}
                    animate={{ x: `${t.from * 12}%`, opacity: [0, 1, 1, 0] }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: DUR.draw,
                      ease: EASE_EXPO_OUT,
                      opacity: { duration: DUR.draw, times: [0, 0.25, 0.7, 1] },
                    }}
                    className="absolute inset-x-3 rounded-md border px-[10px] py-[7px] text-[11px] leading-snug"
                    style={{
                      top: i === 0 ? -22 : 6,
                      borderColor: 'color-mix(in srgb, var(--flow) 55%, transparent)',
                      background: 'color-mix(in srgb, var(--flow-deep) 26%, transparent)',
                      color: 'var(--ink)',
                    }}
                  >
                    {t.text}
                  </motion.div>
                ))}
              </div>
            ) : null}
          </AnimatePresence>
        </div>

        <p
          className={`${MONO_LABEL} mt-2 text-center text-[9px]`}
          style={{ color: 'var(--faint)' }}
        >
          {minted}/{crossings.length} generated
        </p>
      </div>

      <div className="grid gap-5">
        <Quadrant
          label="opportunities"
          cards={opportunities}
          highlight={active?.external ?? null}
          align="right"
        />
        <Quadrant
          label="threats"
          cards={threats}
          highlight={active?.external ?? null}
          align="right"
        />
      </div>
    </div>
  );
}

export default TowsCross;
