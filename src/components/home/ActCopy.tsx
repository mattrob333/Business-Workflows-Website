/**
 * The editorial layer of an act — 01-design-system §2, layer 3.
 *
 * Mono kicker, Newsreader headline, one line of teaching voice. Every act on the
 * homepage wears the same three voices in the same order, so the page has a pulse: the
 * diagram changes, the shape of the sentence over it does not.
 *
 * Two slots, and the difference between them is a layout decision a pinned act forces.
 * `children` stacks under the note; `aside` sets the sourced material in a second column
 * beside it. A pinned stage is exactly one viewport and clips rather than scrolls, so the
 * acts whose diagram is tall (the pipe, the routing) put their claim blocks *beside* the
 * sentence instead of under it, and buy back a couple of hundred pixels.
 *
 * `data-copy` is not decoration. The S4 walk sweeps every element carrying it for text
 * containing a digit and fails on any that does not sit inside a claim block or an
 * evidence chip (00-LAW Ruling 4, mechanised the way S3's explore sweep is). It is the
 * reason the prose on this page says *nine blocks* and *a hundred true findings* in
 * words: a number the copy invented for rhythm must never be mistakable for a finding.
 */

import type { ReactNode } from 'react';
import { Kicker } from '@/components/Kicker';

export interface ActCopyProps {
  /** Mono kicker — usually the recipe name performing below it (01 §5). */
  kicker: string;
  /** One line, Newsreader. The act's sentence. */
  headline: ReactNode;
  /** What the diagram is doing. Never what it looks like. */
  note: ReactNode;
  /** Sourced material, stacked under the note. */
  children?: ReactNode;
  /** Sourced material, set in a second column beside the sentence. */
  aside?: ReactNode;
  className?: string;
}

export function ActCopy({
  kicker,
  headline,
  note,
  children,
  aside,
  className = '',
}: ActCopyProps) {
  const column = (
    <div className={aside ? '' : 'max-w-[64ch]'}>
      <Kicker>{kicker}</Kicker>
      <h3
        className="font-narrative mt-3 text-[clamp(26px,3.4vw,42px)] leading-[1.06] text-balance"
        style={{ color: 'var(--ink)' }}
      >
        {headline}
      </h3>
      <p
        className="mt-3 max-w-[62ch] text-[15px] leading-[1.6]"
        style={{ color: 'var(--muted)' }}
      >
        {note}
      </p>
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );

  if (!aside) {
    return (
      <div data-copy="act" className={className}>
        {column}
      </div>
    );
  }

  return (
    <div
      data-copy="act"
      className={`grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:items-end ${className}`}
    >
      {column}
      <div>{aside}</div>
    </div>
  );
}

export default ActCopy;
