/* amber-law: constraint-surface */

/**
 * `ConstraintBadge` — **the only amber component on the site** (01-design-system §1/§6,
 * team rule 3).
 *
 * The amber law: amber appears when and only when the content *is* the binding
 * constraint — the Theory-of-Constraints pages, the constraint moment of a Strategy
 * Run, the bottleneck stage of a flow diagram. Not a button. Not a highlight. Not a
 * warning. Not a brand accent.
 *
 * Two files in `src/` may carry the `amber-law: constraint-surface` pragma and therefore
 * reference the amber token: this one and `src/motion/fw-toc-flow.tsx`. Everything else
 * that needs to render a constraint composes *this component*, which is precisely why
 * `scripts/lint-tokens.mjs` can enforce the law mechanically instead of by review.
 *
 * If you are about to add the pragma to a third file, you are almost certainly wrong.
 */

import { MONO_LABEL } from './styles';

export type ConstraintBadgeSize = 'sm' | 'md';

export interface ConstraintBadgeProps {
  /** What is constrained. Defaults to the bare word. */
  label?: string;
  /** The stage, capability or step that binds — printed after the label. */
  subject?: string;
  size?: ConstraintBadgeSize;
  /** `solid` fills with the soft amber ground; `outline` is border-only. */
  variant?: 'solid' | 'outline';
  className?: string;
}

export function ConstraintBadge({
  label = 'constraint',
  subject,
  size = 'md',
  variant = 'solid',
  className = '',
}: ConstraintBadgeProps) {
  const small = size === 'sm';
  return (
    <span
      data-component="constraint-badge"
      data-amber-surface="badge"
      className={`${MONO_LABEL} inline-flex items-center gap-2 rounded-full border whitespace-nowrap ${
        small ? 'px-2 py-[4px] text-[9px]' : 'px-3 py-[6px] text-[10px]'
      } ${className}`}
      style={{
        color: 'var(--constraint)',
        borderColor: 'color-mix(in srgb, var(--constraint) 45%, transparent)',
        background: variant === 'solid' ? 'var(--constraint-soft)' : 'transparent',
        letterSpacing: '.14em',
      }}
    >
      <span
        aria-hidden="true"
        className={`inline-block shrink-0 rounded-full ${small ? 'h-[5px] w-[5px]' : 'h-[6px] w-[6px]'}`}
        style={{
          background: 'var(--constraint)',
          boxShadow: '0 0 0 3px color-mix(in srgb, var(--constraint) 18%, transparent)',
        }}
      />
      <span>
        {label}
        {subject ? (
          <>
            <span aria-hidden="true" style={{ opacity: 0.5 }}> · </span>
            <span style={{ color: 'var(--ink)' }}>{subject}</span>
          </>
        ) : null}
      </span>
    </span>
  );
}

export default ConstraintBadge;
