'use client';

/**
 * Recipe `motion/ingest` — 01-design-system §4, meaning: *data enters the system*.
 *
 * Spec: element fades and rises 12px, `[0.16, 1, 0.3, 1]` (expo-out), 600ms,
 * stagger 60ms per item.
 *
 * Reduced motion: the rise is dropped, the fade shortens to 200ms and the stagger goes
 * to zero. The element still *arrives* — it just does not travel. Terminal state is
 * byte-identical to the full-motion terminal state.
 */

import { motion, type HTMLMotionProps } from 'framer-motion';
import { Children, isValidElement, type ReactNode } from 'react';
import {
  DUR,
  INGEST_RISE,
  ingestContainerVariants,
  ingestVariants,
  useReducedMotion,
} from '@/lib/motion-utils';

export type IngestTrigger = 'in-view' | 'mount' | 'controlled';

export interface IngestProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children?: ReactNode;
  /** How the recipe fires. `controlled` defers to `active` (act-driven choreography). */
  trigger?: IngestTrigger;
  /** Used with `trigger="controlled"`. */
  active?: boolean;
  /** Override the 12px rise (e.g. 0 for elements that must not move). */
  distance?: number;
  /** Seconds of delay before the ingest — for hand-rolled sequences. */
  delay?: number;
  /** Render as a child of a stagger container instead of firing on its own. */
  asItem?: boolean;
}

export function Ingest({
  children,
  trigger = 'in-view',
  active = true,
  distance = INGEST_RISE,
  delay = 0,
  asItem = false,
  style,
  ...rest
}: IngestProps) {
  const reduced = useReducedMotion();
  const variants = ingestVariants(reduced, distance);

  if (asItem) {
    return (
      <motion.div
        data-recipe="motion/ingest"
        variants={variants}
        {...(style ? { style } : {})}
        {...rest}
      >
        {children}
      </motion.div>
    );
  }

  const shownWithDelay = {
    ...variants.shown,
    transition: { ...variants.shown.transition, delay: reduced ? 0 : delay },
  };

  const common = {
    'data-recipe': 'motion/ingest',
    variants: { hidden: variants.hidden, shown: shownWithDelay },
    initial: 'hidden' as const,
    ...(style ? { style } : {}),
    ...rest,
  };

  if (trigger === 'controlled') {
    return (
      <motion.div {...common} animate={active ? 'shown' : 'hidden'}>
        {children}
      </motion.div>
    );
  }

  if (trigger === 'mount') {
    return (
      <motion.div {...common} animate="shown">
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div {...common} whileInView="shown" viewport={{ once: true, amount: 0.25 }}>
      {children}
    </motion.div>
  );
}

export interface IngestGroupProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children?: ReactNode;
  trigger?: IngestTrigger;
  active?: boolean;
  /** Seconds between items. Spec default 0.06. */
  stagger?: number;
  distance?: number;
  /** Wrap each child in an item automatically. Off if children are already `Ingest`s. */
  autoWrap?: boolean;
}

/**
 * The staggered form. 60ms per item, in DOM order — the sequence is the sentence:
 * a framework's inputs arrive one at a time so you can read them arriving.
 */
export function IngestGroup({
  children,
  trigger = 'in-view',
  active = true,
  stagger = DUR.stagger,
  distance = INGEST_RISE,
  autoWrap = true,
  ...rest
}: IngestGroupProps) {
  const reduced = useReducedMotion();
  const container = ingestContainerVariants(reduced, stagger);
  const item = ingestVariants(reduced, distance);

  const animateProp =
    trigger === 'controlled'
      ? { animate: active ? ('shown' as const) : ('hidden' as const) }
      : trigger === 'mount'
        ? { animate: 'shown' as const }
        : { whileInView: 'shown' as const, viewport: { once: true, amount: 0.2 } };

  const content = autoWrap
    ? Children.map(children, (child, i) =>
        isValidElement(child) ? (
          <motion.div key={i} variants={item}>
            {child}
          </motion.div>
        ) : (
          child
        ),
      )
    : children;

  return (
    <motion.div
      data-recipe="motion/ingest"
      data-ingest-group="true"
      variants={container}
      initial="hidden"
      {...animateProp}
      {...rest}
    >
      {content}
    </motion.div>
  );
}

export default Ingest;
