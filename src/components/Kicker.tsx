/**
 * `Kicker` — 01-design-system §3, the system voice.
 *
 * A thin mono label above a narrative headline: 11–13px, uppercase, `letter-spacing:
 * .14em`. The kicker is what lets the display serif stay silent about what section this
 * is; it carries the filing information so the headline can carry the sentence.
 */

import { MONO_LABEL } from './styles';

export interface KickerProps {
  children: React.ReactNode;
  /** A quiet counter or index printed before the label, e.g. `03`. */
  index?: string;
  /** `rule` draws the hairline that runs the width of the column. */
  variant?: 'plain' | 'rule';
  tone?: 'faint' | 'muted' | 'flow';
  className?: string;
  id?: string;
}

const TONE = {
  faint: 'var(--faint)',
  muted: 'var(--muted)',
  flow: 'var(--flow)',
} as const;

export function Kicker({
  children,
  index,
  variant = 'plain',
  tone = 'faint',
  className = '',
  id,
}: KickerProps) {
  return (
    <div
      id={id}
      data-component="kicker"
      className={`flex items-center gap-3 ${className}`}
      style={{ color: TONE[tone] }}
    >
      {index ? (
        <span className={`${MONO_LABEL} text-[11px] tabular-nums opacity-70`}>{index}</span>
      ) : null}
      <span className={`${MONO_LABEL} text-[11px] leading-none`}>{children}</span>
      {variant === 'rule' ? (
        <span
          aria-hidden="true"
          className="h-px flex-1"
          style={{
            background:
              'linear-gradient(90deg, var(--line-strong) 0%, color-mix(in srgb, var(--line) 40%, transparent) 100%)',
          }}
        />
      ) : null}
    </div>
  );
}

export default Kicker;
