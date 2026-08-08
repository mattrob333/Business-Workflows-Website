/**
 * `StatusChip` — the honesty engine's face (00-LAW Ruling 4, 01-design-system §6).
 *
 * Five states, exact product grammar: `fact`, `supported-inference`, `assumption`,
 * `hypothesis`, `recommendation`. Every displayed claim on this site carries one.
 *
 * Colour discipline, and the reason this component is deliberately drab:
 *   - `--evidence` (green) is spent **only** on `fact` and `supported-inference`,
 *     because green means "confirmed/verified/supported" and nothing else.
 *   - The other three are neutral or faint. An assumption that looked as confident as a
 *     fact would be a lie told in CSS.
 *   - **No amber.** Amber is the constraint, and a claim's epistemic status is never
 *     the constraint (01 §1, team rule 3).
 *
 * The five states are therefore distinguished by *dot treatment* as much as by colour —
 * solid, ringed, hollow, dotted — so the ladder survives greyscale, colour-blindness,
 * and a bad projector.
 */

export type ClaimStatus =
  | 'fact'
  | 'supported-inference'
  | 'assumption'
  | 'hypothesis'
  | 'recommendation';

interface StatusSpec {
  label: string;
  short: string;
  color: string;
  /** Dot rendering — the redundant, non-colour channel. */
  dot: 'solid' | 'ring' | 'hollow' | 'dotted' | 'half';
  border: string;
  background: string;
  /** Read out to assistive tech in place of the terse chip text. */
  description: string;
}

const SPEC: Record<ClaimStatus, StatusSpec> = {
  fact: {
    label: 'Fact',
    short: 'FACT',
    color: 'var(--evidence)',
    dot: 'solid',
    border: 'color-mix(in srgb, var(--evidence) 40%, transparent)',
    background: 'var(--evidence-soft)',
    description: 'Fact — verified against a source in the evidence pack',
  },
  'supported-inference': {
    label: 'Supported inference',
    short: 'SUPPORTED',
    color: 'var(--evidence)',
    dot: 'ring',
    border: 'color-mix(in srgb, var(--evidence) 26%, transparent)',
    background: 'color-mix(in srgb, var(--evidence-soft) 70%, transparent)',
    description: 'Supported inference — reasoned from cited evidence',
  },
  assumption: {
    label: 'Assumption',
    short: 'ASSUMPTION',
    color: 'var(--muted)',
    dot: 'half',
    border: 'var(--line-strong)',
    background: 'color-mix(in srgb, var(--raised) 70%, transparent)',
    description: 'Assumption — taken as given, not evidenced',
  },
  hypothesis: {
    label: 'Hypothesis',
    short: 'HYPOTHESIS',
    color: 'var(--faint)',
    dot: 'hollow',
    border: 'var(--line)',
    background: 'color-mix(in srgb, var(--surface) 70%, transparent)',
    description: 'Hypothesis — proposed, awaiting a test',
  },
  recommendation: {
    label: 'Recommendation',
    short: 'RECOMMENDED',
    color: 'var(--muted)',
    dot: 'dotted',
    border: 'var(--line-strong)',
    background: 'transparent',
    description: 'Recommendation — a suggested action, not a finding',
  },
};

export const CLAIM_STATUSES = Object.keys(SPEC) as ClaimStatus[];

export function statusLabel(status: ClaimStatus): string {
  return SPEC[status].label;
}

function Dot({ spec }: { spec: StatusSpec }) {
  const base = 'inline-block h-[7px] w-[7px] shrink-0 rounded-full';
  switch (spec.dot) {
    case 'solid':
      return <span aria-hidden="true" className={base} style={{ background: spec.color }} />;
    case 'ring':
      return (
        <span
          aria-hidden="true"
          className={base}
          style={{ border: `1.5px solid ${spec.color}`, background: 'transparent' }}
        />
      );
    case 'half':
      return (
        <span
          aria-hidden="true"
          className={base}
          style={{
            border: `1px solid ${spec.color}`,
            background: `linear-gradient(90deg, ${spec.color} 0 50%, transparent 50% 100%)`,
          }}
        />
      );
    case 'hollow':
      return (
        <span
          aria-hidden="true"
          className={base}
          style={{ border: `1px solid ${spec.color}`, background: 'transparent' }}
        />
      );
    case 'dotted':
      return (
        <span
          aria-hidden="true"
          className={base}
          style={{ border: `1px dotted ${spec.color}`, background: 'transparent' }}
        />
      );
  }
}

export interface StatusChipProps {
  status: ClaimStatus;
  /** `short` is the mono ALL-CAPS form; `long` prints the readable label. */
  form?: 'short' | 'long';
  className?: string;
  /** Render without the pill ground — for dense tables and inline runs of prose. */
  bare?: boolean;
}

export function StatusChip({
  status,
  form = 'short',
  className = '',
  bare = false,
}: StatusChipProps) {
  const spec = SPEC[status];
  return (
    <span
      data-component="status-chip"
      data-status={status}
      title={spec.description}
      className={`font-system inline-flex items-center gap-[6px] rounded-full text-[10px] leading-none whitespace-nowrap uppercase ${
        bare ? '' : 'border px-2 py-[5px]'
      } ${className}`}
      style={
        bare
          ? { color: spec.color, letterSpacing: '.12em' }
          : {
              color: spec.color,
              borderColor: spec.border,
              background: spec.background,
              letterSpacing: '.12em',
            }
      }
    >
      <Dot spec={spec} />
      <span className="sr-only">{spec.description}</span>
      <span aria-hidden="true">{form === 'short' ? spec.short : spec.label}</span>
    </span>
  );
}

export default StatusChip;
