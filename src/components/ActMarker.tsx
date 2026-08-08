/**
 * `ActMarker` — 01-design-system §4 ("chapter markers in the margin, mono, small").
 *
 * The vertical form is the default: a rule, an index, and the act title set sideways in
 * the margin, so the editorial column keeps its full measure. The horizontal form is
 * used below the `xl` breakpoint, where there is no margin to spare.
 */

import { MONO_LABEL } from './styles';

export interface ActMarkerProps {
  /** 1-based. */
  index: number;
  total?: number;
  title: string;
  /** Dim the marker for acts that are not currently on stage. */
  active?: boolean;
  orientation?: 'vertical' | 'horizontal';
  className?: string;
}

export function ActMarker({
  index,
  total,
  title,
  active = false,
  orientation = 'vertical',
  className = '',
}: ActMarkerProps) {
  const pad = (n: number) => String(n).padStart(2, '0');
  const counter = total ? `${pad(index)} / ${pad(total)}` : pad(index);
  const color = active ? 'var(--muted)' : 'var(--faint)';

  if (orientation === 'horizontal') {
    return (
      <div
        data-component="act-marker"
        data-act-index={index}
        className={`flex items-center gap-3 ${className}`}
        style={{ color }}
      >
        <span className={`${MONO_LABEL} text-[10px] tabular-nums`}>{counter}</span>
        <span aria-hidden="true" className="h-px w-6" style={{ background: 'var(--line-strong)' }} />
        <span className={`${MONO_LABEL} text-[10px]`}>{title}</span>
      </div>
    );
  }

  return (
    <div
      data-component="act-marker"
      data-act-index={index}
      className={`flex select-none flex-col items-end gap-3 ${className}`}
      style={{ color }}
    >
      <span className={`${MONO_LABEL} text-[10px] tabular-nums`}>{counter}</span>
      <span
        aria-hidden="true"
        className="w-px flex-none"
        style={{
          height: '3.5rem',
          background: active
            ? 'linear-gradient(180deg, var(--flow-deep) 0%, var(--line) 100%)'
            : 'var(--line)',
        }}
      />
      <span
        className={`${MONO_LABEL} whitespace-nowrap text-[10px]`}
        style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
      >
        {title}
      </span>
    </div>
  );
}

export default ActMarker;
