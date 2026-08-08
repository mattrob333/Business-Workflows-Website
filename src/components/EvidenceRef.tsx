'use client';

/**
 * `EvidenceRef` — 01-design-system §6; the mechanical half of 00-LAW Ruling 4.
 *
 * "No invented numbers, even fictional ones, without a source object … the UI can always
 * answer 'where did this number come from?' with a click." That promise is this
 * component: a mono chip (`ev_103`) that opens the source, the date and the excerpt.
 *
 * Interaction contract:
 *   - Trigger is a real `<button>` with `aria-expanded` / `aria-haspopup="dialog"`.
 *   - The popover is a labelled dialog; focus moves into it on open and returns to the
 *     chip on close, so a keyboard user never loses their place.
 *   - `Escape` closes. So does a click outside, a second click, or scrolling the chip
 *     itself off screen.
 *   - Placement is measured, not assumed: the panel flips above the chip when there is
 *     no room below and is clamped inside the viewport horizontally. Evidence refs sit
 *     inline in prose, so they turn up in corners.
 *   - **Scrolling repositions rather than closes.** The obvious implementation — close
 *     on any scroll — is wrong on this site: Lenis drives smooth scroll from a rAF loop
 *     and keeps emitting scroll events after the pointer has stopped, so a popover
 *     opened during that settle would dismiss itself before it could be read, and would
 *     do it non-deterministically. The panel tracks its chip instead, on rAF.
 */

import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { DUR, EASE_EXPO_OUT, useReducedMotion } from '@/lib/motion-utils';
import { FOCUS_RING, MONO_LABEL } from './styles';

export interface EvidenceSource {
  /** Stable id, printed on the chip. Product convention: `ev_103`. */
  id: string;
  /** Where it came from — a document, a call, a filing. */
  source: string;
  /** ISO-ish display date. */
  date: string;
  excerpt: string;
  /** Optional provenance detail: `interview`, `invoice`, `crm-export`… */
  kind?: string;
  /** Optional reliability note, shown quietly under the excerpt. */
  reliability?: string;
}

export interface EvidenceRefProps {
  evidence: EvidenceSource;
  className?: string;
}

const PANEL_W = 300;
const GAP = 8;

export function EvidenceRef({ evidence, className = '' }: EvidenceRefProps) {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; above: boolean } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  const close = useCallback(
    (restoreFocus = true) => {
      setOpen(false);
      if (restoreFocus) triggerRef.current?.focus();
    },
    [],
  );

  /** Measure against the live trigger rect; flip above when there is no room below. */
  const place = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const panelH = panelRef.current?.offsetHeight ?? 180;
    const room = window.innerHeight - rect.bottom;
    const above = room < panelH + GAP && rect.top > panelH + GAP;
    const rawLeft = rect.left + rect.width / 2 - PANEL_W / 2;
    const left = Math.min(Math.max(GAP, rawLeft), window.innerWidth - PANEL_W - GAP);
    const next = { top: above ? rect.top - panelH - GAP : rect.bottom + GAP, left, above };
    setPos((prev) =>
      prev && prev.top === next.top && prev.left === next.left && prev.above === next.above
        ? prev
        : next,
    );
  }, []);

  /** Measure after paint so the panel's real height decides flip vs. drop. */
  useLayoutEffect(() => {
    if (open) place();
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        close();
      }
    };
    const onPointer = (e: PointerEvent) => {
      const t = e.target as Node;
      if (panelRef.current?.contains(t) || triggerRef.current?.contains(t)) return;
      close(false);
    };

    let frame = 0;
    const track = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const rect = triggerRef.current?.getBoundingClientRect();
        // Only dismiss once the chip itself has left the viewport.
        if (rect && (rect.bottom < 0 || rect.top > window.innerHeight)) {
          close(false);
          return;
        }
        place();
      });
    };

    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    window.addEventListener('scroll', track, { passive: true, capture: true });
    window.addEventListener('resize', track, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
      window.removeEventListener('scroll', track, true);
      window.removeEventListener('resize', track);
    };
  }, [open, close, place]);

  useEffect(() => {
    if (open && pos) panelRef.current?.focus();
  }, [open, pos]);

  return (
    <span data-component="evidence-ref" className={`relative inline-block ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((v) => !v)}
        className={`${MONO_LABEL} ${FOCUS_RING} inline-flex items-center gap-1 rounded-[3px] border px-[6px] py-[2px] text-[10px] leading-none transition-colors`}
        style={{
          color: open ? 'var(--flow)' : 'var(--muted)',
          borderColor: open ? 'color-mix(in srgb, var(--flow) 50%, transparent)' : 'var(--line)',
          background: open
            ? 'color-mix(in srgb, var(--flow-deep) 16%, transparent)'
            : 'color-mix(in srgb, var(--raised) 60%, transparent)',
          letterSpacing: '.06em',
          textTransform: 'none',
        }}
      >
        <span
          aria-hidden="true"
          className="inline-block h-[3px] w-[3px] rounded-full"
          style={{ background: 'var(--evidence)' }}
        />
        {evidence.id}
        <span className="sr-only">— show evidence</span>
      </button>

      <AnimatePresence>
        {open && pos ? (
          <motion.div
            ref={panelRef}
            id={panelId}
            role="dialog"
            aria-label={`Evidence ${evidence.id} — ${evidence.source}`}
            tabIndex={-1}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: pos.above ? 6 : -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: pos.above ? 4 : -4 }}
            transition={{
              duration: reduced ? DUR.reduced : DUR.state,
              ease: reduced ? 'linear' : EASE_EXPO_OUT,
            }}
            className="fixed z-50 rounded-md p-3 text-left"
            style={{
              top: pos.top,
              left: pos.left,
              width: PANEL_W,
              background: 'color-mix(in srgb, var(--raised) 92%, transparent)',
              backdropFilter: 'blur(14px)',
              border: '1px solid var(--line-strong)',
              boxShadow: 'var(--shadow)',
            }}
          >
            <div className="flex items-baseline justify-between gap-2">
              <span
                className={`${MONO_LABEL} text-[10px]`}
                style={{ color: 'var(--evidence)', letterSpacing: '.1em' }}
              >
                {evidence.kind ?? 'evidence'}
              </span>
              <span
                className="font-system text-[10px] tabular-nums"
                style={{ color: 'var(--faint)' }}
              >
                {evidence.date}
              </span>
            </div>
            <div
              className="mt-2 text-[13px] leading-snug font-medium"
              style={{ color: 'var(--ink)' }}
            >
              {evidence.source}
            </div>
            <p
              className="mt-2 border-l pl-3 text-[13px] leading-relaxed"
              style={{ color: 'var(--muted)', borderColor: 'var(--line-strong)' }}
            >
              “{evidence.excerpt}”
            </p>
            {evidence.reliability ? (
              <div className="mt-2 text-[11px]" style={{ color: 'var(--faint)' }}>
                {evidence.reliability}
              </div>
            ) : null}
            <div
              className={`${MONO_LABEL} mt-3 text-[9px]`}
              style={{ color: 'var(--faint)', letterSpacing: '.14em' }}
            >
              esc to close
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </span>
  );
}

export default EvidenceRef;
