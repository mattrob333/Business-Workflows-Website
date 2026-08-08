'use client';

/**
 * Recipe `motion/acts` — 01-design-system §4, scroll choreography.
 *
 * Spec: pages are divided into named acts; each act pins (`position: sticky`) for
 * 1.5–2.5 viewport heights while its diagram performs, then releases. Chapter markers
 * sit in the margin (mono, small); handoffs between sections fade and blur
 * (`filter: blur(8px) -> 0`).
 *
 * Acts also un-pin below the desktop breakpoint. A 100vh stage on a phone is a promise
 * the diagrams cannot keep — a business model canvas needs about 1700px of column — so
 * narrow viewports read the same document that reduced-motion users get.
 *
 * Reduced motion: acts un-pin and the page reads as a normal document, top to bottom.
 * Every act reports progress `1` immediately, so each diagram renders its terminal
 * state — the finished picture, not a frozen first frame. This is the single most
 * important reduced-motion decision on the site: a scrollytelling page that merely
 * *disables* its animation shows nine empty boxes.
 *
 * Acts are declared up front (`<Acts acts={[...]}>`) rather than self-registering via
 * effects: the margin rail needs to print "03 / 06" on the server render, and an
 * effect-time registry would have it flicker in after hydration.
 */

import {
  animate,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
  motion,
  type MotionValue,
} from 'framer-motion';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { ActMarker } from '@/components/ActMarker';
import {
  STAGE_BREAKPOINT,
  progressToStep,
  useMediaQuery,
  useReducedMotion,
} from '@/lib/motion-utils';

/* ------------------------------------------------------------------ types */

export interface ActDefinition {
  id: string;
  /** Printed in the margin rail, mono, small. */
  title: string;
  /** Optional one-line subtitle for the rail. */
  caption?: string;
}

export interface ActContextValue {
  id: string;
  title: string;
  index: number;
  total: number;
  /** 0–1 across the pinned span. Always `1` under reduced motion. */
  progress: MotionValue<number>;
  reduced: boolean;
}

const ActsRegistry = createContext<ActDefinition[]>([]);
const ActContext = createContext<ActContextValue | null>(null);

/** The act a component is rendering inside, or `null` when it stands alone. */
export function useAct(): ActContextValue | null {
  return useContext(ActContext);
}

/** Every act declared on the page, in document order. */
export function useActs(): ActDefinition[] {
  return useContext(ActsRegistry);
}

/* ------------------------------------------------------------------- Acts */

export interface ActsProps {
  acts: ActDefinition[];
  children: ReactNode;
  className?: string;
}

export function Acts({ acts, children, className = '' }: ActsProps) {
  return (
    <ActsRegistry.Provider value={acts}>
      <div data-recipe="motion/acts" data-acts-total={acts.length} className={className}>
        {children}
      </div>
    </ActsRegistry.Provider>
  );
}

/* -------------------------------------------------------------------- Act */

export interface ActProps {
  id: string;
  /** Viewport heights to pin for. Spec range 1.5–2.5; values outside are clamped. */
  pin?: number;
  children: ReactNode;
  className?: string;
  /** Content class for the sticky stage. */
  stageClassName?: string;
}

export function Act({ id, pin = 2, children, className = '', stageClassName = '' }: ActProps) {
  const registry = useActs();
  const reduced = useReducedMotion();
  const wideEnough = useMediaQuery(STAGE_BREAKPOINT);
  const flat = reduced || !wideEnough;
  const outerRef = useRef<HTMLDivElement>(null);

  const index = Math.max(0, registry.findIndex((a) => a.id === id));
  const def = registry[index];
  const title = def?.title ?? id;
  const pinned = Math.min(2.5, Math.max(1.5, pin));

  /** Choreography clock: 0 when the act locks, 1 when it releases. */
  const { scrollYProgress } = useScroll({
    target: outerRef,
    offset: ['start start', 'end end'],
  });
  /** Presence clock: covers the full traversal, used only for the blur handoff. */
  const { scrollYProgress: presence } = useScroll({
    target: outerRef,
    offset: ['start end', 'end start'],
  });

  const staticProgress = useMotionValue(1);
  const progress = reduced ? staticProgress : scrollYProgress;

  const blurPx = useTransform(presence, [0, 0.16, 0.84, 1], [8, 0, 0, 8]);
  const filter = useMotionTemplate`blur(${blurPx}px)`;
  const fade = useTransform(presence, [0, 0.16, 0.84, 1], [0.2, 1, 1, 0.2]);

  const value = useMemo<ActContextValue>(
    () => ({ id, title, index, total: registry.length, progress, reduced }),
    [id, title, index, registry.length, progress, reduced],
  );

  return (
    <ActContext.Provider value={value}>
      <section
        ref={outerRef}
        data-act={id}
        data-act-index={index + 1}
        data-pinned={flat ? 'false' : 'true'}
        aria-labelledby={`act-${id}-title`}
        className={`relative ${className}`}
        style={flat ? undefined : { height: `${pinned * 100}vh` }}
      >
        <div
          className={
            flat
              ? 'relative flex min-h-0 w-full flex-col justify-center py-16'
              : 'sticky top-0 flex h-screen w-full flex-col justify-center overflow-hidden'
          }
        >
          <motion.div
            className={`relative mx-auto w-full max-w-6xl px-5 sm:px-8 ${stageClassName}`}
            {...(reduced ? {} : { style: { filter, opacity: fade } })}
          >
            {/* Margin chapter marker — kage's rail. Inline on narrow screens. */}
            <div className="pointer-events-none absolute top-0 left-0 hidden -translate-x-full pr-8 xl:block">
              <ActMarker index={index + 1} total={registry.length} title={title} active />
            </div>
            <div className="mb-5 xl:hidden">
              <ActMarker
                index={index + 1}
                total={registry.length}
                title={title}
                active
                orientation="horizontal"
              />
            </div>
            <h2 id={`act-${id}-title`} className="sr-only">
              {title}
            </h2>
            {children}
          </motion.div>
        </div>
      </section>
    </ActContext.Provider>
  );
}

/* ------------------------------------------------------------------ stage */

export interface StageHandle {
  /** Discrete step index, 0 … stepCount-1. Terminal under reduced motion. */
  step: number;
  /** Continuous 0–1 driver, for anything that wants to interpolate. */
  progress: MotionValue<number>;
  reduced: boolean;
  /** Attach to the recipe's root when it might render outside an act. */
  ref: (el: HTMLElement | null) => void;
}

/**
 * The single driver every framework recipe uses.
 *
 * Inside an `<Act>` the steps are bound to scroll, so the visitor scrubs the framework
 * running. Outside one, the recipe self-plays once when it scrolls into view — which is
 * what makes the same component usable on a framework page (`S3`), in the recipe
 * gallery, and eventually in a card preview, without a second implementation.
 */
export function useStage(stepCount: number): StageHandle {
  const act = useAct();
  const reduced = useReducedMotion();
  const [node, setNode] = useState<HTMLElement | null>(null);
  const nodeRef = useMemo(() => ({ current: node }), [node]);
  const inView = useInView(nodeRef, { once: true, amount: 0.35 });

  const local = useMotionValue(0);
  const progress = act ? act.progress : local;
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (act) return;
    if (reduced) {
      local.set(1);
      return;
    }
    if (!inView) return;
    const controls = animate(local, 1, {
      duration: Math.max(1.4, stepCount * 0.9),
      ease: 'linear',
    });
    return () => controls.stop();
  }, [act, inView, reduced, stepCount, local]);

  useEffect(() => {
    if (reduced) {
      setStep(stepCount - 1);
      return;
    }
    setStep(progressToStep(progress.get(), stepCount));
  }, [reduced, stepCount, progress]);

  useMotionValueEvent(progress, 'change', (v) => {
    if (reduced) return;
    setStep(progressToStep(v, stepCount));
  });

  return { step, progress, reduced, ref: setNode };
}

export default Acts;
