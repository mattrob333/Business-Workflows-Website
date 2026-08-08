'use client';

/**
 * `LensSwitch` — 01-design-system §6, the compare-lenses tabs (appendix §9, Ruling 8).
 *
 * Same company, same evidence, different framework looking at it. The switch is a real
 * WAI-ARIA tab set: one tab stop for the group, arrow keys to move, `Home`/`End` to
 * jump, and automatic activation (selection follows focus) because switching lenses is
 * a cheap, reversible, read-only act.
 *
 * The moving underline uses a shared `layoutId`, so the indicator travels between tabs
 * rather than blinking — the one place on this component where motion carries meaning:
 * it says *same subject, new instrument*.
 */

import { motion } from 'framer-motion';
import { useId, useRef, useState, type ReactNode } from 'react';
import { DUR, EASE_EXPO_OUT, useReducedMotion } from '@/lib/motion-utils';
import { FOCUS_RING, MONO_LABEL } from './styles';

export interface Lens {
  id: string;
  label: string;
  /** Optional mono sublabel, e.g. the framework's core question. */
  caption?: string;
  content: ReactNode;
}

export interface LensSwitchProps {
  lenses: Lens[];
  /** Uncontrolled initial selection. */
  defaultLensId?: string;
  onChange?: (id: string) => void;
  label?: string;
  className?: string;
}

export function LensSwitch({
  lenses,
  defaultLensId,
  onChange,
  label = 'Compare lenses',
  className = '',
}: LensSwitchProps) {
  const reduced = useReducedMotion();
  const baseId = useId();
  const first = lenses[0];
  const [activeId, setActiveId] = useState(defaultLensId ?? first?.id ?? '');
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const layoutId = `${baseId}-lens-underline`;

  const activeIndex = Math.max(
    0,
    lenses.findIndex((l) => l.id === activeId),
  );
  const active = lenses[activeIndex] ?? first;

  const select = (index: number) => {
    const lens = lenses[index];
    if (!lens) return;
    setActiveId(lens.id);
    onChange?.(lens.id);
    refs.current[index]?.focus();
  };

  if (!active) return null;

  return (
    <div data-component="lens-switch" className={className}>
      <div
        role="tablist"
        aria-label={label}
        className="flex flex-wrap gap-1 border-b"
        style={{ borderColor: 'var(--line)' }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            select((activeIndex + 1) % lenses.length);
          } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            select((activeIndex - 1 + lenses.length) % lenses.length);
          } else if (e.key === 'Home') {
            e.preventDefault();
            select(0);
          } else if (e.key === 'End') {
            e.preventDefault();
            select(lenses.length - 1);
          }
        }}
      >
        {lenses.map((lens, i) => {
          const selected = lens.id === active.id;
          return (
            <button
              key={lens.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${lens.id}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${lens.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(i)}
              className={`${FOCUS_RING} relative rounded-t-md px-3 py-2 text-left transition-colors`}
              style={{ background: selected ? 'color-mix(in srgb, var(--raised) 55%, transparent)' : 'transparent' }}
            >
              <span
                className={`${MONO_LABEL} block text-[10px]`}
                style={{ color: selected ? 'var(--ink)' : 'var(--faint)' }}
              >
                {lens.label}
              </span>
              {lens.caption ? (
                <span
                  className="mt-[3px] block text-[11px]"
                  style={{ color: selected ? 'var(--muted)' : 'var(--faint)', opacity: selected ? 1 : 0.7 }}
                >
                  {lens.caption}
                </span>
              ) : null}
              {selected ? (
                <motion.span
                  layoutId={layoutId}
                  className="absolute inset-x-0 -bottom-px h-px"
                  style={{ background: 'var(--flow)' }}
                  transition={
                    reduced
                      ? { duration: 0 }
                      : { duration: DUR.state, ease: EASE_EXPO_OUT }
                  }
                />
              ) : null}
            </button>
          );
        })}
      </div>

      {lenses.map((lens) => (
        <div
          key={lens.id}
          role="tabpanel"
          id={`${baseId}-panel-${lens.id}`}
          aria-labelledby={`${baseId}-tab-${lens.id}`}
          hidden={lens.id !== active.id}
          tabIndex={0}
          className={`${FOCUS_RING} pt-5`}
        >
          {lens.id === active.id ? (
            <motion.div
              key={lens.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: reduced ? DUR.reduced : DUR.state, ease: 'linear' }}
            >
              {lens.content}
            </motion.div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export default LensSwitch;
