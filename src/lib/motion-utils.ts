'use client';

/**
 * Shared motion vocabulary for The Strategy Stack.
 *
 * 01-design-system §4 fixes one easing/duration vocabulary for the whole site; every
 * recipe in `src/motion/` imports its numbers from here so that "nothing animates by
 * feel" (00-LAW Ruling 7) is enforced by the module graph, not by discipline.
 *
 * This file is intentionally JSX-free: `src/lib` is owned by the integration lead and
 * only this module is in the S0 motion slice, so the Lenis provider is authored with
 * `createElement` rather than a second file.
 */

import Lenis from 'lenis';
import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

/* ------------------------------------------------------------------ easings */

/** Expo-out. The house curve: everything that *arrives* uses this. */
export const EASE_EXPO_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];
/** Symmetric ease for atmosphere drift and breathing loops. */
export const EASE_DRIFT: [number, number, number, number] = [0.45, 0, 0.55, 1];
/** Gravity: VRIO tokens failing a gate fall with this. Ease-in, hard landing. */
export const EASE_GRAVITY: [number, number, number, number] = [0.55, 0, 0.85, 0.35];
/** Handoff blur in/out between scroll acts. */
export const EASE_HANDOFF: [number, number, number, number] = [0.33, 1, 0.68, 1];

/** Spec'd spring for Five Forces gauge re-tweens (01 §5). */
export const FORCE_SPRING = { type: 'spring', stiffness: 120, damping: 20 } as const;

/* ---------------------------------------------------------------- durations */

/** Seconds. Every number here traces to a line in 01-design-system §4/§5. */
export const DUR = {
  /** motion/ingest — fade + 12px rise */
  ingest: 0.6,
  /** motion/ingest — per-item stagger */
  stagger: 0.06,
  /** motion/state — colour/border crossfade */
  state: 0.3,
  /** motion/state — the single 1.02 scale pulse */
  pulse: 0.25,
  /** motion/state — chip flip, 180deg rotateX */
  flip: 0.4,
  /** motion/transform — stroke-dashoffset draw */
  draw: 0.8,
  /** motion/route — dot travel along the connecting path */
  route: 0.9,
  /** fw/raci-route — the signature flourish */
  sign: 0.6,
  /** reduced-motion crossfade (01 §4: "200ms opacity crossfades") */
  reduced: 0.2,
  /** fw/bmc-assemble — the finished canvas' gradient sweep */
  sweep: 12,
  /** atmo/mesh-drift — one full drift cycle (spec: >= 20s) */
  drift: 24,
  /** fw/forces-gauges PESTLE variant — perimeter orbit */
  orbit: 40,
} as const;

/** motion/ingest — 12px rise. */
export const INGEST_RISE = 12;
/** atmo/mesh-drift — max drift amplitude in px (spec: <= 8px). */
export const DRIFT_AMPLITUDE = 8;

/* ------------------------------------------------------------ reduced motion */

const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';

function subscribeReducedMotion(onChange: () => void): () => void {
  if (typeof window === 'undefined' || !window.matchMedia) return () => undefined;
  const mql = window.matchMedia(REDUCED_QUERY);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
}

function readReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia(REDUCED_QUERY).matches;
}

/**
 * Hydration-safe `prefers-reduced-motion`.
 *
 * Framer's own `useReducedMotion` samples the query during the *first* render, which
 * means a statically exported page hydrates with `false` on a reduce-motion machine and
 * React logs a mismatch. `useSyncExternalStore` gives React an explicit server snapshot
 * and a live subscription, so the terminal state swaps in cleanly and keeps reacting if
 * the OS setting changes mid-session.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribeReducedMotion, readReducedMotion, () => false);
}

/**
 * Hydration-safe media query, same mechanism as `useReducedMotion`.
 *
 * Used for structural decisions that CSS cannot make on its own — chiefly whether an
 * act pins at all. Pinned scrollytelling on a phone means a 100vh stage holding a
 * diagram that needs 1700px, so below the desktop breakpoint the acts read as a
 * document, exactly as they do under reduced motion.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (typeof window === 'undefined' || !window.matchMedia) return () => undefined;
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    [query],
  );
  const snapshot = useCallback(
    () =>
      typeof window === 'undefined' || !window.matchMedia
        ? false
        : window.matchMedia(query).matches,
    [query],
  );
  return useSyncExternalStore(subscribe, snapshot, () => false);
}

/** The width at and above which acts pin and multi-column diagrams are legible. */
export const STAGE_BREAKPOINT = '(min-width: 1024px)';

/** True only after hydration. Used to keep no-JS output at the terminal state. */
export function useHasMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

/* ----------------------------------------------------------------- svg ids */

/**
 * Collision-free SVG ids for gradients/filters/masks.
 *
 * React's `useId` emits punctuation that is illegal inside `url(#...)`, so it is
 * stripped. The `ss` prefix also keeps the token linter happy: an id beginning with a
 * non-hex letter can never look like a raw hex colour.
 */
export function useSvgId(name: string): string {
  const raw = useId().replace(/[^a-zA-Z0-9]/g, '');
  return `ss-${name}-${raw}`;
}

/* --------------------------------------------------------------- utilities */

/** Deterministic PRNG (mulberry32) — atmosphere/particles must be SSR-stable. */
export function prng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const clamp01 = (n: number): number => (n < 0 ? 0 : n > 1 ? 1 : n);

/** Map a 0–1 progress value onto `count` discrete steps, clamped to the last one. */
export function progressToStep(progress: number, count: number, lead = 0.08): number {
  if (count <= 1) return 0;
  const p = clamp01((progress - lead) / (1 - lead * 2));
  return Math.min(count - 1, Math.floor(p * count));
}

/* -------------------------------------------------------------------- lenis */

const LenisContext = createContext<Lenis | null>(null);

/** The live Lenis instance, or `null` when smooth scroll is off (reduced motion). */
export function useLenis(): Lenis | null {
  return useContext(LenisContext);
}

export interface LenisProviderProps {
  children: ReactNode;
  /** Force smooth scroll off. Reduced-motion users are opted out automatically. */
  disabled?: boolean;
}

/**
 * Mounts Lenis for the subtree and publishes the instance on context.
 *
 * Lenis drives the *tempo* of the acts; it never owns their choreography — every recipe
 * reads real scroll position through Framer's `useScroll`, so the page behaves
 * identically when Lenis is absent (reduced motion, JS-off, or a future opt-out).
 */
export function LenisProvider({ children, disabled = false }: LenisProviderProps) {
  const reduced = useReducedMotion();
  const off = disabled || reduced;
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    if (off) {
      setLenis(null);
      return;
    }
    const instance = new Lenis({
      autoRaf: true,
      duration: 1.05,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
    });
    setLenis(instance);
    return () => {
      instance.destroy();
      setLenis(null);
    };
  }, [off]);

  return createElement(LenisContext.Provider, { value: lenis }, children);
}

/* ------------------------------------------------------- variant factories */

/**
 * motion/ingest as Framer variants: fade + 12px rise, 600ms expo-out, 60ms stagger.
 * Under reduced motion the rise is dropped and the fade shortens to 200ms — the
 * element still *arrives*, it just does not travel (01 §4).
 */
export function ingestVariants(reduced: boolean, distance: number = INGEST_RISE) {
  return {
    hidden: { opacity: 0, y: reduced ? 0 : distance },
    shown: {
      opacity: 1,
      y: 0,
      transition: reduced
        ? { duration: DUR.reduced, ease: 'linear' as const }
        : { duration: DUR.ingest, ease: EASE_EXPO_OUT },
    },
  };
}

/** Container variant that staggers `ingestVariants` children by 60ms. */
export function ingestContainerVariants(reduced: boolean, stagger: number = DUR.stagger) {
  return {
    hidden: {},
    shown: {
      transition: {
        staggerChildren: reduced ? 0 : stagger,
        delayChildren: 0,
      },
    },
  };
}

/**
 * Stable per-index delay for hand-rolled staggers (particles, tokens, gauge wedges)
 * where a Framer container is the wrong shape.
 */
export function staggerDelay(index: number, reduced: boolean, step: number = DUR.stagger): number {
  return reduced ? 0 : index * step;
}

/* -------------------------------------------------- svg path measurement */

export interface PathGeometry {
  /** Total length in user units, 0 until the path is measured. */
  length: number;
  /** Point at 0–1 along the path, in the SVG's user coordinate space. */
  pointAt: (t: number) => { x: number; y: number };
}

/**
 * Measures an SVG path so recipes can put things *on* it (motion/route's flow dot,
 * motion/transform's travelling inputs) without hard-coding coordinates.
 *
 * Takes the element itself rather than a ref object: a `<path>` rendered in the same
 * pass as its traveller is still `null` when the mount effect runs, so recipes hold the
 * node in state via a callback ref and the measurement re-runs the moment it exists.
 *
 * `getPointAtLength` is used rather than CSS `offset-path` because it works in the SVG
 * user coordinate space, survives `preserveAspectRatio="none"` layouts, and needs no
 * per-browser feature test.
 */
/**
 * `count` stable callback refs plus the elements they capture.
 *
 * Recipes that draw N connective paths and send a traveller down each one need the DOM
 * nodes in state (see `usePathGeometry`). Inline `(el) => setState(...)` refs would
 * change identity every render and loop forever, so the setters are memoised per index.
 */
export function usePathSlots(count: number): {
  paths: (SVGPathElement | null)[];
  setPath: ((el: SVGPathElement | null) => void)[];
} {
  const [paths, setPaths] = useState<(SVGPathElement | null)[]>([]);
  const setPath = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => (el: SVGPathElement | null) => {
        setPaths((prev) => {
          if (prev[i] === el) return prev;
          const next = prev.slice();
          next[i] = el;
          return next;
        });
      }),
    [count],
  );
  return { paths, setPath };
}

export function usePathGeometry(el: SVGPathElement | null, d?: string): PathGeometry {
  const [length, setLength] = useState(0);

  useEffect(() => {
    if (!el) {
      setLength(0);
      return;
    }
    const measure = () => setLength(el.getTotalLength());
    measure();
    const raf = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(raf);
  }, [el, d]);

  return useMemo<PathGeometry>(
    () => ({
      length,
      pointAt: (t: number) => {
        if (!el || length === 0) return { x: 0, y: 0 };
        const p = el.getPointAtLength(clamp01(t) * length);
        return { x: p.x, y: p.y };
      },
    }),
    [el, length],
  );
}
