'use client';

/**
 * `event-injection` — step nine, and the moment the run stops being a slideshow.
 *
 * A competitor raises capital. Every instrument the visitor has spent twenty minutes
 * assembling is suddenly in question, and the honest answer is that most of them are not:
 * three re-run, four do not, and none of the three touches the thing that sets the rate. That
 * is the argument for a *compiled* company model rather than a folder of decks, and it is the
 * only place on the site where the graph does the arguing (appendix §9, adopted by Ruling 8).
 *
 * ## The mechanic
 *
 * 1. The visitor marks the instruments they think the event invalidates. Marking is cheap and
 *    reversible; nothing is scored until they commit.
 * 2. `inject the event` fires. The edges into the frameworks that genuinely re-run light and
 *    carry a `motion/route` dot; the others visibly **stay dark** — the negative space is the
 *    finding, so it is drawn rather than omitted.
 * 3. Every instrument then states its own verdict, sourced, including the two that are
 *    tempting to re-run and should not be.
 *
 * The re-run set, the fields each re-run touches and every verdict are authored upstream and
 * arrive as server-rendered nodes. This island decides what is lit, never what is true.
 */

import { useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { FOCUS_RING, MONO_LABEL } from '@/components';
import { DUR, EASE_EXPO_OUT, useReducedMotion } from '@/lib/motion-utils';
import { RouteEdge } from '@/motion/motion-route';
import { useRunControls } from '../controls';
import { Frame } from './Frame';

export interface EventTarget {
  readonly id: string;
  readonly name: string;
  /** Does this instrument have to run again? Authored, and defended in `verdict`. */
  readonly reruns: boolean;
  /** State-field labels the re-run would rewrite. Empty for instruments that stay dark. */
  readonly fields: readonly string[];
  /** Why — sourced, server-rendered. */
  readonly verdict: ReactNode;
}

export interface EventInjectionProps {
  prompt: string;
  instruction?: string;
  /** The injected signal, named. Rendered above the graph. */
  eventLabel: string;
  targets: readonly EventTarget[];
  /** The closing reading, once the edges have settled. */
  settled: ReactNode;
}

const VB_W = 960;
const VB_H = 260;
const EVENT_Y = 44;
const NODE_Y = 190;
const NODE_R = 26;

function nodeX(index: number, total: number): number {
  const pad = 70;
  const span = VB_W - pad * 2;
  return pad + (span / Math.max(1, total - 1)) * index;
}

function edgePath(index: number, total: number): string {
  const x = nodeX(index, total);
  const midY = (EVENT_Y + NODE_Y) / 2;
  return `M ${VB_W / 2} ${EVENT_Y + 26} C ${VB_W / 2} ${midY}, ${x} ${midY}, ${x} ${NODE_Y - NODE_R}`;
}

export function EventInjection({
  prompt,
  instruction,
  eventLabel,
  targets,
  settled,
}: EventInjectionProps) {
  const reduced = useReducedMotion();
  const { markInteracted } = useRunControls();
  const [marked, setMarked] = useState<string[]>([]);
  const [injected, setInjected] = useState(false);

  const total = targets.length;
  const rerunCount = targets.filter((t) => t.reruns).length;
  const called = targets.filter((t) => t.reruns === marked.includes(t.id)).length;

  const toggle = (id: string) => {
    if (injected) return;
    setMarked((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]));
  };

  const inject = () => {
    setInjected(true);
    markInteracted();
  };

  return (
    <Frame
      kind="event-injection"
      prompt={prompt}
      done={injected}
      {...(instruction !== undefined ? { instruction } : {})}
    >
      <div
        data-testid="event-injection"
        data-injected={injected ? 'true' : 'false'}
        data-marked={marked.length}
        data-lit={injected ? rerunCount : 0}
        className="grid gap-5"
      >
        <div
          className="relative overflow-hidden rounded-lg border"
          style={{ borderColor: 'var(--line)', background: 'color-mix(in srgb, var(--paper) 70%, transparent)' }}
        >
          <svg
            viewBox={`0 0 ${VB_W} ${VB_H}`}
            className="w-full"
            role="img"
            aria-label={
              injected
                ? `${eventLabel}. ${targets
                    .filter((t) => t.reruns)
                    .map((t) => t.name)
                    .join(', ')} re-run. ${targets
                    .filter((t) => !t.reruns)
                    .map((t) => t.name)
                    .join(', ')} do not.`
                : `${eventLabel}, not yet injected. ${total} instruments waiting.`
            }
          >
            <g data-layer="edges">
              {targets.map((target, i) => {
                const lit = injected && target.reruns;
                return (
                  <g key={target.id} data-event-edge={target.id} data-lit={lit ? 'true' : 'false'}>
                    <RouteEdge
                      d={edgePath(i, total)}
                      active={lit}
                      draw={false}
                      repeat={lit && !reduced}
                      delay={i * 0.08}
                      stroke={lit ? 'var(--flow)' : 'var(--line-strong)'}
                    />
                  </g>
                );
              })}
            </g>

            {/* The injected signal. */}
            <g data-layer="event">
              <motion.rect
                x={VB_W / 2 - 150}
                y={EVENT_Y - 22}
                width={300}
                height={48}
                rx={24}
                initial={false}
                animate={{
                  opacity: injected ? 1 : 0.72,
                }}
                transition={{ duration: reduced ? DUR.reduced : DUR.state }}
                fill="color-mix(in srgb, var(--surface) 92%, transparent)"
                stroke={injected ? 'var(--flow)' : 'var(--line-strong)'}
                strokeWidth={1.5}
                vectorEffect="non-scaling-stroke"
              />
              <text
                x={VB_W / 2}
                y={EVENT_Y + 6}
                textAnchor="middle"
                className="font-system"
                fontSize={13}
                letterSpacing="0.08em"
                fill={injected ? 'var(--ink)' : 'var(--muted)'}
              >
                {eventLabel}
              </text>
            </g>

            <g data-layer="nodes">
              {targets.map((target, i) => {
                const x = nodeX(i, total);
                const lit = injected && target.reruns;
                const dark = injected && !target.reruns;
                const predicted = marked.includes(target.id);
                return (
                  <g
                    key={target.id}
                    data-event-node={target.id}
                    data-state={lit ? 'rerun' : dark ? 'unchanged' : 'waiting'}
                  >
                    <motion.circle
                      cx={x}
                      cy={NODE_Y}
                      r={NODE_R}
                      initial={false}
                      animate={{ opacity: dark ? 0.45 : 1 }}
                      transition={{ duration: reduced ? DUR.reduced : DUR.state }}
                      fill={
                        lit
                          ? 'color-mix(in srgb, var(--flow-deep) 40%, var(--surface))'
                          : 'var(--surface)'
                      }
                      stroke={lit ? 'var(--flow)' : 'var(--line-strong)'}
                      strokeWidth={lit ? 2 : 1.5}
                      vectorEffect="non-scaling-stroke"
                    />
                    {predicted && !injected ? (
                      <circle
                        cx={x}
                        cy={NODE_Y}
                        r={NODE_R + 6}
                        fill="none"
                        stroke="var(--flow)"
                        strokeWidth={1.5}
                        strokeDasharray="3 4"
                        vectorEffect="non-scaling-stroke"
                        opacity={0.9}
                      />
                    ) : null}
                    <text
                      x={x}
                      y={NODE_Y + NODE_R + 22}
                      textAnchor="middle"
                      className="font-system"
                      fontSize={12}
                      letterSpacing="0.05em"
                      fill={dark ? 'var(--faint)' : 'var(--ink)'}
                    >
                      {target.name}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        {/* Mark, then commit. */}
        <div className="flex flex-wrap items-center gap-2">
          {targets.map((target) => {
            const predicted = marked.includes(target.id);
            return (
              <button
                key={target.id}
                type="button"
                data-event-mark={target.id}
                aria-pressed={predicted}
                disabled={injected}
                onClick={() => toggle(target.id)}
                className={`${MONO_LABEL} ${FOCUS_RING} rounded-full border px-3 py-[6px] text-[10px] transition-colors disabled:opacity-60`}
                style={{
                  color: predicted ? 'var(--ink)' : 'var(--muted)',
                  borderColor: predicted
                    ? 'color-mix(in srgb, var(--flow) 55%, transparent)'
                    : 'var(--line)',
                  background: predicted
                    ? 'color-mix(in srgb, var(--flow-deep) 18%, transparent)'
                    : 'transparent',
                }}
              >
                {target.name}
              </button>
            );
          })}
          {!injected ? (
            <button
              type="button"
              data-testid="inject-event"
              onClick={inject}
              className={`${MONO_LABEL} ${FOCUS_RING} ml-auto rounded-md border px-4 py-2 text-[10px]`}
              style={{
                color: 'var(--ink)',
                borderColor: 'color-mix(in srgb, var(--flow) 55%, transparent)',
                background: 'color-mix(in srgb, var(--flow-deep) 20%, transparent)',
              }}
            >
              inject the event
            </button>
          ) : (
            <span
              data-testid="injection-score"
              className={`${MONO_LABEL} ml-auto text-[10px]`}
              style={{ color: called === total ? 'var(--evidence)' : 'var(--muted)' }}
            >
              {called === total ? 'every instrument called correctly' : 'the graph disagrees'}
            </span>
          )}
        </div>

        {injected ? (
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reduced ? DUR.reduced : DUR.ingest,
              ease: reduced ? 'linear' : EASE_EXPO_OUT,
            }}
            className="grid gap-3"
            aria-live="polite"
          >
            {targets.map((target) => (
              <div
                key={target.id}
                data-event-verdict={target.id}
                data-reruns={target.reruns ? 'true' : 'false'}
                className="rounded-lg border p-4"
                style={{
                  borderColor: target.reruns
                    ? 'color-mix(in srgb, var(--flow) 32%, transparent)'
                    : 'var(--line)',
                  background: target.reruns
                    ? 'color-mix(in srgb, var(--flow-deep) 10%, transparent)'
                    : 'transparent',
                  opacity: target.reruns ? 1 : 0.86,
                }}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <span className="text-[15px]" style={{ color: 'var(--ink)' }}>
                    {target.name}
                  </span>
                  <span
                    className={`${MONO_LABEL} text-[9px]`}
                    style={{ color: target.reruns ? 'var(--flow)' : 'var(--faint)' }}
                  >
                    {target.reruns ? 're-runs' : 'unchanged'}
                  </span>
                </div>
                {target.fields.length > 0 ? (
                  <div
                    className={`${MONO_LABEL} mt-2 text-[9px]`}
                    style={{ color: 'var(--faint)' }}
                  >
                    rewrites {target.fields.join(' · ').toLowerCase()}
                  </div>
                ) : null}
                <div className="mt-3">{target.verdict}</div>
              </div>
            ))}
            <div data-testid="injection-settled">{settled}</div>
          </motion.div>
        ) : null}
      </div>
    </Frame>
  );
}

export default EventInjection;
