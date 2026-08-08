/**
 * The section shell every framework page repeats.
 *
 * Six visible sections, one rhythm: mono kicker with its index and rule, a Newsreader
 * headline, one line of teaching voice, then the substance. 01-design-system §3's three
 * voices in the order the eye wants them, so a visitor who has read one framework page
 * can navigate the next without looking.
 */

import type { ReactNode } from 'react';
import { Kicker } from '@/components';

export interface PageSectionProps {
  /** Doubles as the anchor id and the `data-section` hook the walk uses. */
  id: string;
  index: string;
  kicker: string;
  title: ReactNode;
  lede?: string;
  children: ReactNode;
  className?: string;
  /** Drop the max-width column — used by the act-pinned stage, which is full-bleed. */
  bleed?: boolean;
}

export function PageSection({
  id,
  index,
  kicker,
  title,
  lede,
  children,
  className = '',
  bleed = false,
}: PageSectionProps) {
  return (
    <section
      id={id}
      data-section={id}
      aria-labelledby={`${id}-title`}
      className={`relative py-20 sm:py-24 ${className}`}
    >
      <div className="mx-auto w-full max-w-5xl px-5 sm:px-8">
        <Kicker index={index} variant="rule">
          {kicker}
        </Kicker>
        <h2
          id={`${id}-title`}
          className="font-narrative mt-5 max-w-[22ch] text-[clamp(28px,4vw,46px)] leading-[1.06] text-balance"
          style={{ color: 'var(--ink)' }}
        >
          {title}
        </h2>
        {lede ? (
          <p className="mt-4 max-w-[64ch] text-[16px] leading-[1.65]" style={{ color: 'var(--muted)' }}>
            {lede}
          </p>
        ) : null}
      </div>
      {bleed ? (
        <div className="mt-10">{children}</div>
      ) : (
        <div className="mx-auto mt-10 w-full max-w-5xl px-5 sm:px-8">{children}</div>
      )}
    </section>
  );
}

export default PageSection;
