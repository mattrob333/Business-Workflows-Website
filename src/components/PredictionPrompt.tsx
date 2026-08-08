'use client';

/**
 * `PredictionPrompt` — 01-design-system §6, the challenge-mode widget; the learning
 * mechanic adopted whole from the appendix §9 (Ruling 8).
 *
 * The teaching claim behind it: a visitor who commits to a guess *before* the framework
 * runs learns roughly twice as much from the reveal, because they now have a stake. So
 * the component's job is to make committing cheap and the reveal earned — the answer
 * slot (`children`) does not exist in the DOM until a pick is recorded.
 *
 * Accessibility: the options are a real radio group. Arrow keys move between options
 * (roving `tabIndex`, one tab stop for the whole group), `Enter`/`Space` commits, and
 * the reveal is announced through `aria-live="polite"`.
 */

import { AnimatePresence, motion } from 'framer-motion';
import { useId, useRef, useState, type ReactNode } from 'react';
import { DUR, EASE_EXPO_OUT, INGEST_RISE, useReducedMotion } from '@/lib/motion-utils';
import { FOCUS_RING, MONO_LABEL } from './styles';

export interface PredictionOption {
  id: string;
  label: string;
  /** Optional short gloss shown under the label. */
  detail?: string;
}

export interface PredictionPromptProps {
  question: string;
  options: PredictionOption[];
  /** The id that the framework will actually produce. Optional — some prompts have no "right". */
  correctId?: string;
  /** Revealed only after a pick is recorded. */
  children?: ReactNode;
  /** Notified on commit, so a run can carry the prediction into its state. */
  onPick?: (id: string) => void;
  /** Mono eyebrow above the question. */
  kicker?: string;
  className?: string;
}

export function PredictionPrompt({
  question,
  options,
  correctId,
  children,
  onPick,
  kicker = 'predict',
  className = '',
}: PredictionPromptProps) {
  const reduced = useReducedMotion();
  const [picked, setPicked] = useState<string | null>(null);
  const [cursor, setCursor] = useState(0);
  const groupId = useId();
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  const commit = (id: string, index: number) => {
    setCursor(index);
    if (picked) return;
    setPicked(id);
    onPick?.(id);
  };

  const move = (delta: number) => {
    const next = (cursor + delta + options.length) % options.length;
    setCursor(next);
    refs.current[next]?.focus();
  };

  const scored = picked !== null && correctId !== undefined;
  const wasRight = scored && picked === correctId;

  return (
    <div
      data-component="prediction-prompt"
      data-picked={picked ?? ''}
      className={`rounded-lg border p-5 ${className}`}
      style={{
        borderColor: 'var(--line)',
        background: 'color-mix(in srgb, var(--surface) 66%, transparent)',
        backdropFilter: 'blur(14px)',
      }}
    >
      <div className={`${MONO_LABEL} text-[10px]`} style={{ color: 'var(--faint)' }}>
        {kicker}
      </div>
      <p
        id={`${groupId}-q`}
        className="font-narrative mt-2 text-xl leading-snug"
        style={{ color: 'var(--ink)' }}
      >
        {question}
      </p>

      <div
        role="radiogroup"
        aria-labelledby={`${groupId}-q`}
        className="mt-4 grid gap-2"
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            e.preventDefault();
            move(1);
          } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            e.preventDefault();
            move(-1);
          }
        }}
      >
        {options.map((option, i) => {
          const isPicked = picked === option.id;
          const isAnswer = scored && option.id === correctId;
          const borderColor = isAnswer
            ? 'color-mix(in srgb, var(--evidence) 55%, transparent)'
            : isPicked
              ? 'color-mix(in srgb, var(--flow) 55%, transparent)'
              : 'var(--line)';
          return (
            <button
              key={option.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={isPicked}
              tabIndex={cursor === i ? 0 : -1}
              disabled={picked !== null && !isPicked && !isAnswer}
              onClick={() => commit(option.id, i)}
              className={`${FOCUS_RING} flex items-start gap-3 rounded-md border px-3 py-2 text-left transition-colors disabled:opacity-55`}
              style={{
                borderColor,
                background: isPicked
                  ? 'color-mix(in srgb, var(--flow-deep) 14%, transparent)'
                  : 'transparent',
                cursor: picked === null ? 'pointer' : 'default',
              }}
            >
              <span
                aria-hidden="true"
                className="mt-[3px] inline-block h-[11px] w-[11px] shrink-0 rounded-full border"
                style={{
                  borderColor: isPicked || isAnswer ? borderColor : 'var(--line-strong)',
                  background: isPicked
                    ? 'var(--flow)'
                    : isAnswer
                      ? 'var(--evidence)'
                      : 'transparent',
                }}
              />
              <span>
                <span className="block text-[14px]" style={{ color: 'var(--ink)' }}>
                  {option.label}
                </span>
                {option.detail ? (
                  <span className="mt-[2px] block text-[12px]" style={{ color: 'var(--faint)' }}>
                    {option.detail}
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>

      <div aria-live="polite">
        <AnimatePresence initial={false}>
          {picked !== null ? (
            <motion.div
              key="reveal"
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: INGEST_RISE }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: reduced ? DUR.reduced : DUR.ingest,
                ease: reduced ? 'linear' : EASE_EXPO_OUT,
              }}
              className="mt-4 border-t pt-4"
              style={{ borderColor: 'var(--line)' }}
              data-reveal="true"
            >
              {scored ? (
                <div
                  className={`${MONO_LABEL} mb-2 text-[10px]`}
                  style={{ color: wasRight ? 'var(--evidence)' : 'var(--muted)' }}
                >
                  {wasRight ? 'you called it' : 'not what the framework found'}
                </div>
              ) : null}
              {children}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default PredictionPrompt;
